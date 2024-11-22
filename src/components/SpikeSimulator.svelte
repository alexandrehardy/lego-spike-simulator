<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { Button } from 'flowbite-svelte';
    import { componentStore, resolveFromZip, setRobotFromFile } from '$lib/ldraw/components';
    import { WebGL, type CompiledModel } from '$lib/ldraw/gl';
    import { type Model } from '$lib/ldraw/components';

    export let modalOpen = false;
    let numberOfLoads = 0;
    let gl: WebGL | undefined;
    let compiledRobot: CompiledModel | undefined;
    let interval: number | undefined;

    function loadRobot() {
        const element = document.getElementById('load_robot');
        if (element) {
            const fileElement = element as HTMLInputElement;
            if (fileElement.files) {
                if (fileElement.files.length > 0) {
                    const first = fileElement.files[0];
                    numberOfLoads++;
                    setRobotFromFile(first);
                }
            }
        }
    }

    function loadLibrary() {
        const element = document.getElementById('load_library');
        if (element) {
            const fileElement = element as HTMLInputElement;
            if (fileElement.files) {
                if (fileElement.files.length > 0) {
                    const first = fileElement.files[0];
                    numberOfLoads++;
                    resolveFromZip(first);
                }
            }
        }
    }

    function askForRobot() {
        const element = document.getElementById('load_robot');
        if (element) {
            element.click();
        }
    }

    function askForLibrary() {
        const element = document.getElementById('load_library');
        if (element) {
            element.click();
        }
    }

    let angle = 0;
    let angle2 = 0;
    function renderRobot() {
        if (!gl) {
            return;
        }
        gl.setModelIdentity();
        gl.clearColour(0.0, 0.0, 0.0);
        gl.clear();
        gl.translate(0, 0, -20);
        gl.rotate(angle, 1.0, 1.0, 0.0);
        gl.rotate(angle2, 1.0, 0.0, 0.0);
        if (compiledRobot) {
            gl.scale(0.05);
            gl.drawCompiled(compiledRobot);
        }
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

    function doCompile(robot: Model | undefined) {
        if (!robot) {
            return undefined;
        }
        if (gl) {
            return gl.compileModel(robot);
        }
    }

    onMount(() => {
        const canvas = document.getElementById('robot_preview');
        if (canvas) {
            gl = WebGL.create(canvas as HTMLCanvasElement);
            if (gl) {
                compiledRobot = doCompile($componentStore.robotModel);
            }
            interval = setInterval(() => {
                renderRobot();
            }, 33);
        } else {
            console.log('No WebGL available');
        }
    });

    onDestroy(() => {
        if (interval) {
            clearInterval(interval);
            interval = undefined;
        }
    });

    $: compiledRobot = doCompile($componentStore.robotModel);
</script>

{#key numberOfLoads}
    <input type="file" id="load_robot" class="hidden" accept=".ldr" on:change={loadRobot} />
    <input type="file" id="load_library" class="hidden" accept=".zip" on:change={loadLibrary} />
{/key}
<div class="flex flex-col">
    <div>
        Use LeoCad to create a model (<a href="https://www.leocad.org/" target="_blank"
            >https://www.leocad.org/</a
        >).
    </div>
    <div>
        You may need to upload the component library (complete.zip) to load your model (<a
            href="https://library.ldraw.org/updates?latest"
            target="_blank">https://library.ldraw.org/updates?latest</a
        >).
    </div>
    <div>
        Always load the robot before the library, only missing bricks are loaded from the library.
    </div>
    <div class="flex flex-row">
        <Button color="light" class="!p-2" on:click={askForRobot}>Robot</Button>
        <Button color="light" class="!p-2" on:click={askForLibrary}>Library</Button>
    </div>

    <div>
        {#if $componentStore.robotModel}
            Robot loaded
        {:else}
            Robot not loaded
        {/if}
    </div>
    {#each $componentStore.unresolved as part}
        <div class="text-red-700">
            Missing {part}
        </div>
    {/each}
</div>

<canvas id="robot_preview" class="w-full h-96"></canvas>
