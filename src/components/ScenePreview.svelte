<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { WebGL, type MapTexture } from '$lib/ldraw/gl';
    import { type SceneStore, type SceneObject } from '$lib/spike/scene';

    export let id: string;
    export let scene: SceneStore;
    export let enabled = true;
    export let select: number | undefined = undefined;
    export let camera: 'top' | 'left' | 'right' | 'front' | 'back' | 'angle';
    export let rotate = false;
    export let mapWidth = 0;
    export let mapHeight = 0;

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
        if (camera == 'angle') {
            gl.rotate(45, 1.0, 0.0, 0.0);
        } else if (camera == 'top') {
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
            gl.pushMatrix();
            gl.scale(10);
            gl.drawTexturedQuad(mapTexture);
            gl.popMatrix();
        }
        gl.translate(0, 0, 0);
        // The mapTexture is -1 to 1 (x)
        // then scaled to -10 to 10 (x)
        // ldraw units are 0.4mm
        // The map width is available, so scale accordingly
        gl.scale((0.4 / mapWidth) * 20);
        for (const obj of scene.objects) {
            if (obj.compiled) {
                gl.drawCompiled(obj.compiled);
            }
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

    async function loadMapTexture(map: File | undefined) {
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
        if (mapTexture) {
            mapWidth = mapTexture.width;
            mapHeight = mapTexture.height;
        }
    }

    function loadSceneItems(objects: SceneObject[], forceCompile: boolean) {
        if (!gl) {
            return;
        }
        for (const obj of objects) {
            if (!obj.compiled || forceCompile) {
                obj.compiled = gl.compileModel(obj.bricks, { rescale: false });
            }
        }
    }

    onMount(() => {
        const canvas = document.getElementById(id);
        if (canvas) {
            gl = WebGL.create(canvas as HTMLCanvasElement);
            if (gl) {
                resizeGL(scene);
                loadSceneItems(scene.objects, true);
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

    $: resizeGL(scene);
    $: checkEnabled(enabled);
    $: loadMapTexture(scene.map);
    $: loadSceneItems(scene.objects, false);
</script>

<canvas {id} class={$$props.class}></canvas>
