<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { WebGL, type MapTexture } from '$lib/ldraw/gl';
    import { type SceneStore, type SceneObject } from '$lib/spike/scene';
    import { Hub, type PortType } from '$lib/spike/vm';
    import * as m4 from '$lib/ldraw/m4';
    import { componentStore, findPartTransform, type Model } from '$lib/ldraw/components';

    export let id: string;
    export let scene: SceneStore;
    export let enabled = true;
    export let distanceSensorId: number | 'none' = 'none';
    export let port: PortType;
    export let hub: Hub;

    let canRender = false;
    let gl: WebGL | undefined;
    let droppedFrames = 0;
    let lastFrame: number = 0;
    let mapTexture: MapTexture | null = null;
    let cameraMatrix: m4.Matrix4 = getCameraMatrix(distanceSensorId, $componentStore.robotModel);
    let distance = 0.0;
    let range = 2000.0;

    function reportSensor(gl: WebGL) {
        const frame = gl.getColourBuffer();
        let closest = 10000;
        let verticalAperture = 0.25;
        for (
            let y = Math.round(frame.height * verticalAperture);
            y < frame.height * (1.0 - verticalAperture);
            y++
        ) {
            for (let x = 0; x < frame.width - 1; x++) {
                let d = frame.buffer[(x + y * frame.width) * 4];
                let dx = frame.buffer[(x + 1 + y * frame.width) * 4];
                let dy = frame.buffer[(x + (y + 1) * frame.width) * 4];
                if (Math.abs(d - dx) > 20) {
                    continue;
                }
                if (Math.abs(d - dy) > 20) {
                    continue;
                }
                d = (d / 255.0) * range; // remap to maximum range;
                if (d < closest) {
                    closest = d;
                }
            }
        }
        hub.measureDistance(port, closest);
        distance = Math.trunc(closest);
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
        gl.setModelIdentity();
        if (scene.robot) {
            const obj = scene.robot;
            // Offset so the sensor isn't in view
            gl.translate(0, 0, 28);
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
        gl.clearColour(1.0, 1.0, 1.0);
        gl.clear();
        if (mapTexture) {
            gl.setBrightness(1.0);
            gl.pushMatrix();
            gl.drawDepthQuad(mapTexture);
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
                gl.perspectiveAngle = 35; // 35 degree viewing angle
                gl.mindist = 1; //Only measures from 50mm, but we don't want to clip that, so we set 1mm
                gl.maxdist = range; // fast sensing is 300mm. But can measure up to 2000mm. Go with 2000
                resizeGL(scene);
                gl.renderDepth(true);
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

    $: cameraMatrix = getCameraMatrix(distanceSensorId, $componentStore.robotModel);
    $: resizeGL(scene);
    $: checkEnabled(enabled);
    $: loadMapTexture(scene.map);
    $: setMapSize(scene);
    $: loadSceneItems(scene.objects, false);
    $: loadRobot(scene.robot, false);
</script>

<div class="flex flex-row gap-1">
    <div class="border">
        <canvas {id} class={$$props.class}></canvas>
    </div>
    {distance}mm
</div>
