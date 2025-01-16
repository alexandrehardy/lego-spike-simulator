<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { WebGL, type MapTexture } from '$lib/ldraw/gl';
    import { type SceneStore, type SceneObject } from '$lib/spike/scene';
    import { Hub, type PortType, VM } from '$lib/spike/vm';
    import * as m4 from '$lib/ldraw/m4';
    import { componentStore, findPartTransform, type Model } from '$lib/ldraw/components';

    export let id: string;
    export let scene: SceneStore;
    export let enabled = true;
    export let lightSensorId: number | 'none' = 'none';
    export let port: PortType;
    export let hub: Hub;
    export let vm: VM | undefined;

    let canRender = false;
    let gl: WebGL | undefined;
    let droppedFrames = 0;
    let lastFrame: number = 0;
    let mapTexture: MapTexture | null = null;
    let cameraMatrix: m4.Matrix4 = getCameraMatrix(lightSensorId, $componentStore.robotModel);
    let lastColour = '#330033';

    interface HistogramEntry {
        k: string;
        v: number;
    }

    function reportSensor(gl: WebGL) {
        const buffer = gl.getColourBuffer();
        const histogram = new Map<string, number>();
        for (let i = 0; i < buffer.length; i += 4) {
            const r = buffer[i + 0];
            const g = buffer[i + 1];
            const b = buffer[i + 2];
            if (r == 51 && g == 0 && b == 51) {
                // Background colour (0.2, 0.0, 0.2)
                continue;
            }
            const c = (r << 16) + (g << 8) + b;
            const h = '#' + c.toString(16);
            histogram.set(h, (histogram.get(h) ?? 0) + 1);
        }

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
                if (vm) {
                    vm.runThreads();
                }
            }
        } else {
            const sense = '#330033';
            if (lastColour != sense) {
                hub.measureColour(port, sense);
                lastColour = sense;
                if (vm) {
                    vm.runThreads();
                }
            }
        }
    }

    function doRender(timestamp: number) {
        const frameTime = timestamp - lastFrame;
        // Aim for 30 fps
        const frames = Math.round(frameTime / 33);
        if (frames > 1) {
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function resizeGL(data: SceneStore) {
        if (!gl) {
            return;
        }
        const gl2use = gl;
        setTimeout(() => gl2use.resizeToFit(), 100);
    }

    function handleResize() {
        resizeGL(scene);
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

    onMount(() => {
        const canvas = document.getElementById(id);
        if (canvas) {
            gl = WebGL.create(canvas as HTMLCanvasElement);
            if (gl) {
                gl.perspectiveAngle = 45;
                gl.mindist = 0.01;
                gl.maxdist = 50.0;
                resizeGL(scene);
                loadSceneItems(scene.objects, true);
                loadRobot(scene.robot, true);
                loadMapTexture(scene.map);
            }
            canRender = true;
            queueRender();
        } else {
            console.log('No WebGL available');
        }
        addEventListener('resize', handleResize);
    });

    onDestroy(() => {
        canRender = false;
        removeEventListener('resize', handleResize);
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
    $: resizeGL(scene);
    $: checkEnabled(enabled);
    $: loadMapTexture(scene.map);
    $: setMapSize(scene);
    $: loadSceneItems(scene.objects, false);
    $: loadRobot(scene.robot, false);
</script>

<canvas {id} class={$$props.class}></canvas>
