<script lang="ts">
    import { onMount } from 'svelte';
    import { Button } from 'flowbite-svelte';
    import { componentStore, resolveFromZip, setRobotFromFile } from '$lib/ldraw/components';
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

    function renderSetup() {
        const positionAttributeLocation = gl.gl.getAttribLocation(gl.pipeline, 'a_position');
        const positionBuffer = gl.gl.createBuffer();
        gl.gl.bindBuffer(gl.gl.ARRAY_BUFFER, positionBuffer);

        // three 2d points
        const positions = [0, 0, 0, 0.5, 0.7, 0];

        gl.gl.bufferData(gl.gl.ARRAY_BUFFER, new Float32Array(positions), gl.gl.STATIC_DRAW);

        // Clear the canvas
        gl.gl.clearColor(0, 0, 0, 255);
        gl.gl.clear(gl.gl.COLOR_BUFFER_BIT);
        // Tell it to use our program (pair of shaders)
        gl.gl.useProgram(gl.pipeline);
        gl.gl.enableVertexAttribArray(positionAttributeLocation);

        // Bind the position buffer.
        gl.gl.bindBuffer(gl.gl.ARRAY_BUFFER, positionBuffer);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        const size = 2; // 2 components per iteration
        const type = gl.gl.FLOAT; // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0; // start at the beginning of the buffer
        gl.gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
        var primitiveType = gl.gl.TRIANGLES;

        const count = 3;
        gl.gl.drawArrays(primitiveType, offset, count);
    }

    onMount(() => {
        const canvas = document.getElementById('robot_preview');
        if (canvas) {
            gl = new WebGL(canvas as HTMLCanvasElement);
            if (gl.enabled) {
                renderSetup();
            }
        } else {
            console.log('No WebGL available');
        }
    });
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

<canvas id="robot_preview" class="w-96 h-96"></canvas>
