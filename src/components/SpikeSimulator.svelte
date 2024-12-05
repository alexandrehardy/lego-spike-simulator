<script lang="ts">
    import * as Blockly from 'blockly/core';
    import { onDestroy, onMount } from 'svelte';
    import { Button } from 'flowbite-svelte';
    import {
        componentStore,
        resolveFromZip,
        setRobotFromFile,
        type LDrawStore
    } from '$lib/ldraw/components';
    import { WebGL, type CompiledModel } from '$lib/ldraw/gl';
    import { type Model } from '$lib/ldraw/components';
    import { VM, Hub, type Namespace, StringValue, ListValue, codeStore } from '$lib/spike/vm';
    import HubWidget from '$components/HubWidget.svelte';

    export let runSimulation: boolean = false;
    export let workspace: Blockly.WorkspaceSvg | undefined;

    let numberOfLoads = 0;
    let gl: WebGL | undefined;
    let compiledRobot: CompiledModel | undefined;
    let interval: number | undefined;
    let inRender = false;
    let droppedFrames = 0;
    let vm: VM | undefined;
    let hubImage = '0000000000000000000000000';

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

    let angle = 0;
    let angle2 = 0;
    function renderRobot() {
        if (!gl) {
            return;
        }
        if (!compiledRobot) {
            gl.clearColour(1.0, 1.0, 1.0);
            gl.clear();
            return;
        }
        gl.setModelIdentity();
        gl.clearColour(0.0, 0.0, 0.0);
        gl.clear();
        gl.translate(0, 0, -20);
        gl.rotate(180, 1.0, 0.0, 0.0);
        gl.rotate(angle, 0.0, 1.0, 0.0);
        //gl.rotate(angle2, 1.0, 0.0, 0.0);
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

    function doRender() {
        renderRobot();
        inRender = false;
    }

    function queueRender() {
        if (inRender) {
            droppedFrames++;
            console.log(droppedFrames);
            return;
        }
        droppedFrames = 0;
        inRender = true;
        setTimeout(doRender, 0);
    }

    function resizeGL(data: LDrawStore) {
        if (!gl) {
            return;
        }
        const gl2use = gl;
        setTimeout(() => gl2use.resizeToFit(), 100);
    }

    function handleResize() {
        resizeGL($componentStore);
    }

    function handleHubEvent(event: string, value: string) {
        if (event == 'screen') {
            hubImage = value;
        }
    }

    function startOrPauseSimulation(start: boolean) {
        if (start) {
            if (vm) {
                vm.stop();
                hubImage = '0000000000000000000000000';
            }
            const selected = Blockly.common.getSelected();
            if (selected) {
                selected.unselect();
            }
            const hub = new Hub();
            hub.setEventHandler(handleHubEvent);
            const globals: Namespace = {};
            if (workspace) {
                let variables = workspace.getVariablesOfType('Number');
                for (let i = 0; i < variables.length; i++) {
                    globals[variables[i].name] = new StringValue('');
                }
                variables = workspace.getVariablesOfType('list');
                for (let i = 0; i < variables.length; i++) {
                    globals[variables[i].name] = new ListValue([]);
                }
            }
            vm = new VM(hub, globals, $codeStore.events, $codeStore.procedures, workspace);
            vm.start();
        } else {
            if (vm) {
                vm.stop();
                hubImage = '0000000000000000000000000';
            }
        }
    }

    function hubLeftPress() {
        if (vm) {
            vm.hub.leftPressed = true;
            vm.runThreads();
        }
    }

    function hubRightPress() {
        if (vm) {
            vm.hub.rightPressed = true;
            vm.runThreads();
        }
    }

    function hubLeftRelease() {
        if (vm) {
            vm.hub.leftPressed = false;
            vm.runThreads();
        }
    }

    function hubRightRelease() {
        if (vm) {
            vm.hub.rightPressed = false;
            vm.runThreads();
        }
    }

    onMount(() => {
        const canvas = document.getElementById('robot_preview');
        if (canvas) {
            gl = WebGL.create(canvas as HTMLCanvasElement);
            if (gl) {
                resizeGL($componentStore);
                compiledRobot = doCompile($componentStore.robotModel);
            }
            interval = setInterval(queueRender, 33);
        } else {
            console.log('No WebGL available');
        }
        addEventListener('resize', handleResize);
    });

    onDestroy(() => {
        if (interval) {
            clearInterval(interval);
            interval = undefined;
        }
        removeEventListener('resize', handleResize);
    });

    $: compiledRobot = doCompile($componentStore.robotModel);
    $: resizeGL($componentStore);
    $: startOrPauseSimulation(runSimulation);
</script>

<div class="flex flex-col h-full p-2 overflow-y-scroll relative">
    {#key numberOfLoads}
        <input
            type="file"
            id="load_robot"
            class="hidden"
            accept=".ldr,.mpd"
            on:change={loadRobot}
        />
        <input type="file" id="load_library" class="hidden" accept=".zip" on:change={loadLibrary} />
    {/key}
    {#if !compiledRobot}
        <div class="m-2">
            Use LeoCad to create a model for your robot (<a
                href="https://www.leocad.org/"
                target="_blank">https://www.leocad.org/</a
            >). Then upload the robot.
        </div>
        <div class="m-2">
            <span
                >Load the robot by clicking the
                <img class="inline mx-2" alt="robot" width="32" height="32" src="icons/Robot.svg" />
                icon. Then load the scene to run the robot in by clicking on the
                <img class="inline mx-2" alt="scene" width="32" height="32" src="icons/Scene.svg" />
                icon.</span
            >
        </div>
        <div class="m-2">
            You may need to upload the component library (complete.zip) to load your model (<a
                href="https://library.ldraw.org/updates?latest"
                target="_blank">https://library.ldraw.org/updates?latest</a
            >). Check to see if there are any missing parts to see if the library needs to be
            loaded.
        </div>
        <div class="m-2">
            Always load the robot before the library, only missing bricks are loaded from the
            library.
        </div>
    {/if}

    <div class="w-full flex-1 relative">
        <div class="flex flex-row w-full h-full">
            <div class="m-3 h-min">
                <HubWidget image={hubImage} on:leftPress={hubLeftPress} on:rightPress={hubRightPress} on:leftRelease={hubLeftRelease} on:rightRelease={hubRightRelease}/>
            </div>
            <canvas id="robot_preview" class="flex-1 w-full h-full"></canvas>
        </div>
    </div>
</div>
