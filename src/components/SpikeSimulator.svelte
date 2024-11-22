<script lang="ts">
    import { onMount } from 'svelte';
    import { Button } from 'flowbite-svelte';
    import {
        type LDrawStore,
        componentStore,
        resolveFromZip,
        setRobotFromFile
    } from '$lib/ldraw/components';
    import { WebGL } from '$lib/ldraw/gl';

    export let modalOpen = false;
    let numberOfLoads = 0;
    let gl: WebGL | undefined;

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
    function renderRobot(robot: LDrawStore) {
        if (!gl) {
            return;
        }
        //if (!robot.robotModel) {
        //    return;
        //}
        //gl.setProjectionIdentity();
        gl.setModelIdentity();
        gl.clearColor(0.0, 0.0, 0.0);
        gl.clear();
        //gl.scale(10.0);
        gl.translate(0, 0, -10);
        gl.rotate(angle, 1.0, 1.0, 0.0);
        gl.rotate(angle * 1.337, 1.0, 0.0, 0.0);
        //gl.drawTriangles([{colour: 0, p1: {x: 10.0, y: 10.0, z: 10.0}, p2: {x: 10.0, y: -10.0, z: 10.0}, p3: {x: -10.0, y: -10.0, z: 10.0}}]);
        if (robot.robotModel) {
            gl.scale(0.05);
            gl.drawModel(robot.robotModel);
        }
        gl.flush();
        angle = angle + 5;
        if (angle > 360) {
            angle = angle - 360;
        }
    }

    onMount(() => {
        const canvas = document.getElementById('robot_preview');
        if (canvas) {
            gl = WebGL.create(canvas as HTMLCanvasElement);
            setInterval(() => {
                renderRobot($componentStore);
            }, 33);
        } else {
            console.log('No WebGL available');
        }
    });

    //$: renderRobot($componentStore);
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
