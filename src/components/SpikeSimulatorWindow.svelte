<script lang="ts">
    import * as Blockly from 'blockly/core';
    import { Button, CloseButton } from 'flowbite-svelte';
    import SpikeSimulator from '$components/SpikeSimulator.svelte';
    import { type LDrawStore, componentStore } from '$lib/ldraw/components';
    import { codeStore } from '$lib/spike/vm';
    import {
        spikeGenerator,
        resetCode,
        getCodeEvents,
        getCodeProcedures
    } from '$lib/blockly/generator';

    export let modalOpen = false;
    export let blocklyOpen: boolean;
    export let workspace: Blockly.WorkspaceSvg | undefined;
    let robotButtonColour: 'light' | 'red' | 'green' = 'light';
    let libraryClass = '!p-2';
    let runSimulation = false;

    function closeWindow() {
        modalOpen = false;
    }

    function openBlockly() {
        blocklyOpen = true;
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

    function updateButtons(store: LDrawStore) {
        if (!store.robotModel) {
            robotButtonColour = 'light';
            libraryClass = '!p-2';
        } else {
            if (store.unresolved.length > 0) {
                robotButtonColour = 'red';
                libraryClass = '!p-2 animate-bounce';
            } else {
                robotButtonColour = 'green';
                libraryClass = '!p-2';
            }
        }
    }

    function startRobot() {
        resetCode();
        const code = spikeGenerator.workspaceToCode(workspace);
        console.log('=======');
        console.log(code);
        console.log('=======');
        console.log(getCodeProcedures());
        codeStore.set({ events: getCodeEvents(), procedures: getCodeProcedures() });
        runSimulation = true;
    }

    function stopRobot() {
        runSimulation = false;
    }

    $: updateButtons($componentStore);
</script>

{#if modalOpen}
    <div class="flex-1 h-full">
        <div class="relative flex-1 h-full flex flex-col overflow-hidden">
            <div
                class="flex flex-row bg-gray-100 gap-2 p-2 items-center border-b border-b-gray-300"
            >
                <img alt="code" width="32" height="32" src="icons/Brick.svg" />
                <Button color={robotButtonColour} class="!p-2" on:click={askForRobot}>
                    <img alt="robot" width="32" height="32" src="icons/Robot.svg" />
                </Button>
                <Button color="light" class="!p-2">
                    <img alt="scene" width="32" height="32" src="icons/Scene.svg" />
                </Button>
                <Button color="light" class={libraryClass} on:click={askForLibrary}>
                    <img alt="scene" width="32" height="32" src="icons/Library.svg" />
                </Button>
                {#if runSimulation}
                    <Button color="light" class="!p-2" on:click={stopRobot}>
                        <img alt="play" width="32" height="32" src="icons/GenericStopIcon.svg" />
                    </Button>
                {:else}
                    <Button color="light" class="!p-2" on:click={startRobot}>
                        <img alt="play" width="32" height="32" src="icons/GenericPlayIcon.svg" />
                    </Button>
                {/if}
                {#if !blocklyOpen}
                    <Button color="light" class="!p-2" on:click={openBlockly}>
                        <img alt="blockly" width="32" height="32" src="icons/BlocklyIcon.svg" />
                    </Button>
                {/if}
                <div class="flex-1" />
                {#if blocklyOpen}
                    <CloseButton on:click={closeWindow} />
                {/if}
            </div>
            <div class="flex-1 w-full overflow-hidden">
                <SpikeSimulator bind:runSimulation {workspace} />
            </div>
        </div>
    </div>
{/if}
