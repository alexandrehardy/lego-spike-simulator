<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { WebGL, type MapTexture } from '$lib/ldraw/gl';
    import { type SceneStore, type SceneObject } from '$lib/spike/scene';

    export let id: string;
    export let scene: SceneStore;
    export let enabled = true;
    export let select: string | undefined = undefined;
    export let camera: 'top' | 'left' | 'right' | 'front' | 'back';
    export let tilt = true;
    export let rotate = false;
    export let unresolved: string[] = [];

    let canRender = false;
    let gl: WebGL | undefined;
    let droppedFrames = 0;
    let lastFrame: number = 0;
    let angle = 0;
    let mapTexture: MapTexture | null = null;

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
        gl.clearColour(0.0, 0.0, 0.0);
        gl.clear();
        gl.translate(0, 0, -20);
        // Make unit meters
        gl.scale(0.01);
        if (tilt) {
            gl.rotate(45, 1.0, 0.0, 0.0);
        }
        if (camera == 'top') {
            gl.rotate(90, 1.0, 0.0, 0.0);
        } else if (camera == 'left') {
            gl.rotate(90, 0.0, 1.0, 0.0);
        } else if (camera == 'right') {
            gl.rotate(-90, 0.0, 1.0, 0.0);
        } else if (camera == 'front') {
            gl.rotate(0, 0.0, 1.0, 0.0);
        } else if (camera == 'back') {
            gl.rotate(180, 0.0, 1.0, 0.0);
        }
        if (rotate) {
            gl.rotate(angle, 0.0, 1.0, 0.0);
        }
        if (mapTexture) {
            if (select === '#map' || select === '#all') {
                gl.setBrightness(1.0);
            } else {
                gl.setBrightness(0.3);
            }
            gl.pushMatrix();
            gl.drawTexturedQuad(mapTexture);
            gl.popMatrix();
            gl.setBrightness(1.0);
        }
        gl.translate(0, 0, 0);
        for (const obj of scene.objects) {
            if (select === obj.name || select === '#all') {
                gl.setBrightness(1.0);
            } else {
                gl.setBrightness(0.3);
            }
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
            if (select === '#robot' || select === '#all') {
                gl.setBrightness(1.0);
            } else {
                gl.setBrightness(0.3);
            }
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
        if (rotate) {
            angle = angle + 5 * 0.1;
            if (angle > 360) {
                angle = angle - 360;
            }
        } else {
            angle = 0;
        }
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

    function loadRobot(robot: SceneObject, forceCompile: boolean, unresolved: string[]) {
        if (!gl) {
            return;
        }
        if (unresolved.length > 0) {
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

    function loadSceneItems(objects: SceneObject[], forceCompile: boolean, unresolved: string[]) {
        if (!gl) {
            return;
        }
        if (unresolved.length > 0) {
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
                resizeGL(scene);
                loadSceneItems(scene.objects, true, unresolved);
                loadRobot(scene.robot, true, unresolved);
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

    $: resizeGL(scene);
    $: checkEnabled(enabled);
    $: loadMapTexture(scene.map);
    $: setMapSize(scene);
    $: loadSceneItems(scene.objects, false, unresolved);
    $: loadRobot(scene.robot, false, unresolved);
</script>

<canvas {id} class={$$props.class}></canvas>
