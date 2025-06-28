<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
    import { WebGL, type MapTexture } from '$lib/ldraw/gl';
    import { type SceneStore, type SceneObject } from '$lib/spike/scene';
    import { Hub, type PortType } from '$lib/spike/vm';
    import * as m4 from '$lib/ldraw/m4';
    import { hexColor } from '$lib/ldraw/components';
    import { componentStore, findPartTransform, type Model } from '$lib/ldraw/components';

    export let id: string;
    export let scene: SceneStore;
    export let enabled = true;
    export let lightSensorId: number | 'none' = 'none';
    export let port: PortType;
    export let hub: Hub;

    let canRender = false;
    let gl: WebGL | undefined;
    let droppedFrames = 0;
    let lastFrame: number = 0;
    let mapTexture: MapTexture | null = null;
    let cameraMatrix: m4.Matrix4 = getCameraMatrix(lightSensorId, $componentStore.robotModel);
    let lastColour = '#330033';
    let reflected = 0;
    let override = 'none';
    let overrideOpen = false;
    let colours = [
        {
            value: '#901f76',
            name: 'Magenta',
            icon: 'colours/Circle0.svg',
            colour: hexColor('#901f76')
        },
        {
            value: '#1e5aa8',
            name: 'Blue',
            icon: 'colours/Circle2.svg',
            colour: hexColor('#1e5aa8')
        },
        {
            value: '#68c3e2',
            name: 'Medium Azure',
            icon: 'colours/Circle3.svg',
            colour: hexColor('#68c3e2')
        },
        {
            value: '#00852b',
            name: 'Green',
            icon: 'colours/Circle5.svg',
            colour: hexColor('#00852b')
        },
        {
            value: '#fac80a',
            name: 'Yellow',
            icon: 'colours/Circle6.svg',
            colour: hexColor('#fac80a')
        },
        { value: '#b40000', name: 'Red', icon: 'colours/Circle8.svg', colour: hexColor('#b40000') },
        {
            value: '#f4f4f4',
            name: 'White',
            icon: 'colours/Circle9.svg',
            colour: hexColor('#f4f4f4')
        },
        {
            value: '#000000',
            name: 'Black',
            icon: 'colours/Circle10.svg',
            colour: hexColor('#000000')
        },
        { value: '#330033', name: 'Background', icon: 'colours/CircleNone.svg', colour: undefined },
        { value: 'none', name: 'Sensor', icon: 'icons/SensorLight.svg', colour: undefined }
    ];

    let colourMap = mapColours();

    let colourGrid = computeGrid(colours, 4);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function computeGrid(a: any[], cols: number) {
        let row = [];
        const rows = [];
        for (const item of a) {
            row.push(item);
            if (row.length >= cols) {
                rows.push(row);
                row = [];
            }
        }
        if (row.length > 0) {
            rows.push(row);
        }
        return rows;
    }

    function mapColours() {
        let result = {};
        for (const colourEntry of colours) {
            result[colourEntry.value] = colourEntry;
        }
        return result;
    }

    interface HistogramEntry {
        k: string;
        v: number;
    }

    function reportSensor(gl: WebGL) {
        if (override != 'none') {
            const sense = override;
            if (lastColour != sense) {
                const c = hexColor(sense);
                const r = Math.sqrt(c.r * c.r + c.g * c.g + c.b * c.b);
                hub.measureReflected(port, r);
                hub.measureColour(port, sense);
                lastColour = sense;
            }
            return;
        }

        const buffer = gl.getColourBuffer().buffer;
        const histogram = new Map<string, number>();
        let avg = 0.0;
        let count = 0;
        // Add bias to colour measurement.
        // the 4000K light is actually skewed toward red
        const rbias = 1;
        const gbias = 0.85;
        const bbias = 0.85;
        for (let i = 0; i < buffer.length; i += 4) {
            const r = buffer[i + 0];
            const g = buffer[i + 1];
            const b = buffer[i + 2];
            if (r == 51 && g == 0 && b == 51) {
                // Background colour (0.2, 0.0, 0.2)
                continue;
            }
            const ch = (r << 16) + (g << 8) + b;
            const h = '#' + ch.toString(16);
            const c = hexColor(h);
            let dist = 1000.0;
            let nearest = undefined;
            for (const colourEntry of colours) {
                const ref = colourEntry.colour;
                if (ref) {
                    // The 4000K light has a slight red bias
                    // try compensate for that.
                    const rdist = (c.r * rbias - ref.r) * (c.r * rbias - ref.r);
                    const gdist = (c.g * gbias - ref.g) * (c.g * gbias - ref.g);
                    const bdist = (c.b * bbias - ref.b) * (c.b * bbias - ref.b);
                    const cdist = rdist + gdist + bdist;
                    if (cdist < dist) {
                        nearest = colourEntry.value;
                        dist = cdist;
                    }
                }
            }
            const reflect = Math.sqrt((c.r * c.r + c.g * c.g + c.b * c.b) / 3.0);
            avg += reflect;
            count++;
            if (nearest && dist < 0.3) {
                histogram.set(nearest, (histogram.get(nearest) ?? 0) + 1);
            } else {
                // None
                histogram.set('#330033', (histogram.get('#330033') ?? 0) + 1);
            }
        }
        avg = avg / count;
        reflected = avg;
        hub.measureReflected(port, avg);

        const histogramArray: HistogramEntry[] = [];
        for (const [key, value] of histogram) {
            histogramArray.push({ k: key, v: value });
        }
        histogramArray.sort((a, b) => b.v - a.v);
        if (histogramArray.length > 0) {
            const sense = histogramArray[0].k;
            if (lastColour != sense) {
                hub.measureColour(port, sense);
                lastColour = sense;
            }
        } else {
            const sense = '#330033';
            if (lastColour != sense) {
                hub.measureColour(port, sense);
                lastColour = sense;
            }
        }
    }

    function doRender(timestamp: number) {
        const frameTime = timestamp - lastFrame;
        // Aim for 30 fps
        const frames = Math.round(frameTime / 33);
        if (frames > 1 && lastFrame > 0) {
            droppedFrames++;
            // TODO: Drop the model detail
        }
        lastFrame = timestamp;
        renderScene();
        if (gl) {
            reportSensor(gl);
        }
        if (canRender && enabled) {
            requestAnimationFrame(doRender);
        } else {
            lastFrame = 0;
        }
    }

    function queueRender() {
        if (!canRender) {
            return;
        }
        requestAnimationFrame(doRender);
    }

    function renderScene() {
        if (!gl) {
            return;
        }
        gl.resizeToFit();
        gl.setModelIdentity();
        if (scene.robot) {
            const obj = scene.robot;
            // Offset so the sensor isn't in view
            gl.translate(0, 0, 17);
            gl.rotate(180.0, 0.0, 1.0, 0.0);
            gl.rotate(180.0, 1.0, 0.0, 0.0);
            const s = 1.0 / 0.4;
            // Map back again to mm
            gl.scale(0.4);
            gl.multMatrix(cameraMatrix);
            // Map from mm to ldraw units
            gl.scale(s);
            gl.rotate(-180.0, 1.0, 0.0, 0.0);
            if (obj.compiled) {
                // The object may be recentered, adjust for that
                gl.translate(
                    -obj.compiled.recenter.x,
                    -obj.compiled.recenter.y,
                    -obj.compiled.recenter.z
                );
            }
            if (obj.rotation) {
                gl.rotate(-obj.rotation, 0.0, 1.0, 0.0);
            }
            if (obj.position) {
                gl.translate(-obj.position.x, -obj.position.y, -obj.position.z);
            }
        }
        // Use an odd background colour to make it easy to recognise
        gl.clearColour(0.2, 0.0, 0.2);
        gl.clear();
        if (mapTexture) {
            gl.setBrightness(1.0);
            gl.pushMatrix();
            gl.drawTexturedQuad(mapTexture);
            gl.popMatrix();
            gl.setBrightness(1.0);
        }
        for (const obj of scene.objects) {
            gl.setBrightness(1.0);
            gl.pushMatrix();
            if (obj.position) {
                gl.translate(obj.position.x, obj.position.y, obj.position.z);
            }
            if (obj.rotation) {
                gl.rotate(obj.rotation, 0.0, 1.0, 0.0);
            }
            if (obj.compiled) {
                gl.drawCompiled(obj.compiled);
            } else {
                gl.drawBox(100, 100, 100);
            }
            gl.popMatrix();
            gl.setBrightness(1.0);
        }

        if (scene.robot) {
            const obj = scene.robot;
            gl.setBrightness(1.0);
            gl.pushMatrix();
            if (obj.position) {
                gl.translate(obj.position.x, obj.position.y, obj.position.z);
            }
            if (obj.rotation) {
                gl.rotate(obj.rotation, 0.0, 1.0, 0.0);
            }
            if (obj.compiled) {
                gl.drawCompiled(obj.compiled);
            } else {
                gl.drawBox(100, 100, 100);
            }
            gl.popMatrix();
            gl.setBrightness(1.0);
        }

        gl.flush();
    }

    function checkEnabled(enabled: boolean) {
        if (enabled) {
            queueRender();
        }
    }

    async function loadMapTexture(map: Blob | undefined) {
        if (!gl) {
            mapTexture = null;
            return;
        }
        if (mapTexture) {
            gl.deleteTexture(mapTexture.texture);
        }
        if (!map) {
            mapTexture = null;
            return;
        }
        mapTexture = await gl.loadTexture(map);
        // We could get the size from the texture.
        // But better not, since it isn't real units.
        // mapWidth = mapTexture.width;
        // mapHeight = mapTexture.height;
        if (mapTexture) {
            mapTexture.width = scene.mapWidth;
            mapTexture.height = scene.mapHeight;
        }
    }

    function loadRobot(robot: SceneObject, forceCompile: boolean) {
        if (!gl) {
            return;
        }
        const obj = robot;
        if (obj.bricks) {
            if (!obj.compiled || forceCompile) {
                obj.compiled = gl.compileModel(obj.bricks, { rescale: false });
            }
        }
        if (!obj.position && obj.compiled) {
            obj.position = { x: 0.0, y: -obj.compiled.bbox.min.y, z: 0.0 };
        } else if (obj.compiled && obj.position) {
            obj.position = { x: obj.position.x, y: -obj.compiled.bbox.min.y, z: obj.position.z };
        } else if (obj.compiled) {
            obj.position = { x: 0.0, y: -obj.compiled.bbox.min.y, z: 0.0 };
        }
    }

    function loadSceneItems(objects: SceneObject[], forceCompile: boolean) {
        if (!gl) {
            return;
        }
        for (const obj of objects) {
            if (obj.bricks) {
                if (!obj.compiled || forceCompile) {
                    obj.compiled = gl.compileModel(obj.bricks, { rescale: false });
                }
            }
            if (!obj.position && obj.compiled) {
                obj.position = { x: 0.0, y: -obj.compiled.bbox.min.y, z: 0.0 };
            }
        }
    }

    function setOverride(colour: string) {
        override = colour;
        overrideOpen = false;
    }

    onMount(() => {
        const canvas = document.getElementById(id);
        if (canvas) {
            gl = WebGL.create(canvas as HTMLCanvasElement);
            if (gl) {
                gl.perspectiveAngle = 45;
                gl.mindist = 0.01;
                gl.maxdist = 50.0;
                loadSceneItems(scene.objects, true);
                loadRobot(scene.robot, true);
                loadMapTexture(scene.map);
            }
            canRender = true;
            queueRender();
        } else {
            console.log('No WebGL available');
        }
    });

    onDestroy(() => {
        canRender = false;
        if (mapTexture && gl) {
            gl.deleteTexture(mapTexture.texture);
            mapTexture = null;
        }
    });

    function setMapSize(scene: SceneStore) {
        if (mapTexture) {
            mapTexture.width = scene.mapWidth;
            mapTexture.height = scene.mapHeight;
        }
    }

    function getCameraMatrix(id: number | 'none', robot: Model | undefined): m4.Matrix4 {
        if (id === 'none') {
            return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        }
        if (!robot) {
            return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        }
        const result = findPartTransform(robot, id);
        if (!result) {
            return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        }
        return result.inverse;
    }

    $: cameraMatrix = getCameraMatrix(lightSensorId, $componentStore.robotModel);
    $: checkEnabled(enabled);
    $: loadMapTexture(scene.map);
    $: setMapSize(scene);
    $: loadSceneItems(scene.objects, false);
    $: loadRobot(scene.robot, false);
</script>

<div class="flex flex-row gap-1">
    <canvas {id} class={$$props.class}></canvas>
    <div class="flex flex-col">
        <img
            class="p-1 w-12 h-10 bg-gray-300"
            src={colourMap[lastColour].icon}
            alt={colourMap[lastColour].name}
        />
        <div class="text-sm">R:{Math.floor(reflected * 100) / 100}</div>
    </div>
    <Button class="bg-blue-300 w-12 h-12 m-0 p-0">
        {#each colours as colour}
            {#if override == colour.value}
                <img class="w-8 h-8" src={colour.icon} alt={colour.name} />
            {/if}
        {/each}
    </Button>
    <Dropdown class="bg-blue-300 rounded-xl hover:bg-blue-300" bind:open={overrideOpen}>
        {#each colourGrid as row}
            <DropdownItem class="hover:bg-blue-300">
                <div class="flex flex-row">
                    {#each row as colour}
                        <button
                            class="hover:bg-blue-500 p-2"
                            on:click={() => setOverride(colour.value)}
                        >
                            <img class="w-8 h-8" src={colour.icon} alt={colour.name} />
                        </button>
                    {/each}
                </div>
            </DropdownItem>
        {/each}
    </Dropdown>
</div>
