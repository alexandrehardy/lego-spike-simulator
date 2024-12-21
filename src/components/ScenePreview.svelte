<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { WebGL, type CompiledModel, type MapTexture } from '$lib/ldraw/gl';
    import { type Model } from '$lib/ldraw/components';

    export let id: string;
    export let robotModel: Model | undefined;
    export let compiledRobot: CompiledModel | undefined = undefined;
    export let enabled = true;
    export let select: number | undefined = undefined;
    export let map: File | undefined;

    let canRender = false;
    let gl: WebGL | undefined;
    let droppedFrames = 0;
    let lastFrame: number = 0;
    let angle = 0;
    let angle2 = 0;
    let mapTexture: MapTexture | null = null;
    let oldMap: File | undefined;

    function doCompile(robot: Model | undefined, select: number | undefined) {
        if (!robot) {
            return undefined;
        }
        if (gl) {
            return gl.compileModel(robot, { select: select });
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
        //gl.rotate(180, 1.0, 0.0, 0.0);
        //gl.rotate(angle, 0.0, 1.0, 0.0);
        //gl.rotate(angle2, 1.0, 0.0, 0.0);
        if (mapTexture) {
            gl.scale(10);
            gl.drawTexturedQuad(mapTexture);
        }
        /*if (compiledRobot) {
            gl.scale(0.05);
            gl.drawCompiled(compiledRobot);
        }*/
        gl.flush();
        angle = angle + 5 * 0.1;
        angle2 = angle2 + 5 * 1.37 * 0.1;
        if (angle > 360) {
            angle = angle - 360;
        }
        if (angle2 > 360) {
            angle2 = angle2 - 360;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function resizeGL(data: CompiledModel | undefined) {
        if (!gl) {
            return;
        }
        const gl2use = gl;
        setTimeout(() => gl2use.resizeToFit(), 100);
    }

    function handleResize() {
        resizeGL(compiledRobot);
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
    }

    onMount(() => {
        const canvas = document.getElementById(id);
        if (canvas) {
            gl = WebGL.create(canvas as HTMLCanvasElement);
            if (gl) {
                resizeGL(compiledRobot);
                compiledRobot = doCompile(robotModel, select);
                loadMapTexture(map);
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

    $: compiledRobot = doCompile(robotModel, select);
    $: resizeGL(compiledRobot);
    $: checkEnabled(enabled);
    $: loadMapTexture(map);
</script>

<canvas {id} class={$$props.class}></canvas>
