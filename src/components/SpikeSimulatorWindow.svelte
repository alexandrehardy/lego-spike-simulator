<script lang="ts">
    import * as Blockly from 'blockly/core';
    import { CogOutline } from 'flowbite-svelte-icons';
    import { Button, CloseButton, Tooltip } from 'flowbite-svelte';
    import MenuDropdown from '$components/MenuDropdown.svelte';
    import { type MenuAction } from '$components/Menu.svelte';
    import HubIcon from '$components/HubIcon.svelte';
    import SpikeSimulator from '$components/SpikeSimulator.svelte';
    import SaveSimulation from '$components/SaveSimulation.svelte';
    import SimulatorSettings from '$components/SimulatorSettings.svelte';
    import PortConnector from '$components/PortConnector.svelte';
    import WheelConnector from '$components/WheelConnector.svelte';
    import LoadScene from '$components/LoadScene.svelte';
    import { type LDrawStore, componentStore } from '$lib/ldraw/components';
    import { Hub, codeStore } from '$lib/spike/vm';
    import {
        spikeGenerator,
        resetCode,
        getCodeEvents,
        getCodeProcedures
    } from '$lib/blockly/generator';

    export let modalOpen = false;
    export let blocklyOpen: boolean;
    export let workspace: Blockly.WorkspaceSvg | undefined;
    export let split = 2;
    let hub = new Hub();

    let connectorOpen = false;
    let wheelsOpen = false;
    let saveOpen = false;
    let sceneOpen = false;
    let settingsOpen = false;
    let robotButtonColour: 'light' | 'red' | 'green' = 'light';
    let libraryClass = '!p-2';
    let runSimulation = false;
    // cameraOpen is used as a bind variable, but reported as unused by es-lint
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let cameraOpen = false;
    let camera: 'top' | 'left' | 'right' | 'front' | 'back' | 'adaptive' = 'adaptive';
    let robotFocus = false;
    let tilt = true;

    let cameraMenu = buildCameraMenu();

    function buildCameraMenu(): MenuAction[] {
        return [
            {
                name: 'Default view',
                action: () => {
                    camera = 'adaptive';
                    tilt = true;
                    robotFocus = false;
                    cameraMenu = buildCameraMenu();
                },
                radio: camera == 'adaptive'
            },
            {
                name: 'View left',
                action: () => {
                    camera = 'left';
                    cameraMenu = buildCameraMenu();
                },
                radio: camera == 'left'
            },
            {
                name: 'View right',
                action: () => {
                    camera = 'right';
                    cameraMenu = buildCameraMenu();
                },
                radio: camera == 'right'
            },
            {
                name: 'View back',
                action: () => {
                    camera = 'back';
                    cameraMenu = buildCameraMenu();
                },
                radio: camera == 'back'
            },
            {
                name: 'View front',
                action: () => {
                    camera = 'front';
                    cameraMenu = buildCameraMenu();
                },
                radio: camera == 'front'
            },
            {
                name: 'View top',
                action: () => {
                    camera = 'top';
                    tilt = false;
                    robotFocus = false;
                    cameraMenu = buildCameraMenu();
                },
                radio: camera == 'top'
            },
            {
                name: 'Tilt view',
                action: () => {
                    tilt = !tilt;
                    cameraMenu = buildCameraMenu();
                },
                toggle: tilt
            },
            {
                name: 'Robot view',
                action: () => {
                    robotFocus = !robotFocus;
                    if (robotFocus) {
                        camera = 'back';
                        tilt = true;
                    }
                    cameraMenu = buildCameraMenu();
                },
                toggle: robotFocus
            }
        ];
    }

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
        } else {
            if (store.unresolved.length > 0) {
                robotButtonColour = 'red';
            } else {
                robotButtonColour = 'green';
            }
        }
        if (store.unresolved.length > 0) {
            libraryClass = '!p-2 animate-bounce';
        } else {
            libraryClass = '!p-2';
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

    function saveRobotOrScene() {
        saveOpen = true;
    }

    function connectPorts() {
        connectorOpen = true;
    }

    function connectWheels() {
        wheelsOpen = true;
    }

    function loadScene() {
        sceneOpen = true;
    }

    function openSettings() {
        settingsOpen = true;
    }

    $: updateButtons($componentStore);
</script>

<PortConnector bind:modalOpen={connectorOpen} bind:hub />
<WheelConnector bind:modalOpen={wheelsOpen} bind:hub />
<SaveSimulation bind:modalOpen={saveOpen} bind:hub />
<LoadScene bind:modalOpen={sceneOpen} />
<SimulatorSettings bind:modalOpen={settingsOpen} />
{#if modalOpen}
    <div class="{split == 1 ? 'flex-1' : 'flex-[2]'} h-full overflow-hidden">
        <div class="relative flex-1 h-full flex flex-col overflow-hidden">
            <div
                class="flex flex-row bg-gray-100 gap-2 p-2 items-center border-b border-b-gray-300 z-10 flex-wrap"
            >
                <div class="w-8 h-8 flex flex-col justify-center items-center">
                    <img alt="code" width="32" height="32" src="icons/Brick.svg" />
                </div>
                <Button color={robotButtonColour} class="!p-2" on:click={askForRobot}>
                    <div class="w-8 h-8 flex flex-col justify-center items-center">
                        <img alt="robot" width="32" height="32" src="icons/Robot.svg" />
                    </div>
                </Button>
                <Tooltip>Load a robot model for use in the simulator</Tooltip>
                <Button color="light" class="!p-2" on:click={connectPorts}>
                    <div class="w-8 h-8 flex flex-col justify-center items-center">
                        <HubIcon />
                    </div>
                </Button>
                <Tooltip>Connect ports on the spike hub of the robot</Tooltip>
                <Button color="light" class="!p-2" on:click={connectWheels}>
                    <div class="w-8 h-8 flex flex-col justify-center items-center">
                        <img alt="scene" width="32" height="32" src="icons/wheel.svg" />
                    </div>
                </Button>
                <Tooltip>Connect wheels to motors of the robot</Tooltip>
                <Button color="light" class="!p-2" on:click={loadScene}>
                    <div class="w-8 h-8 flex flex-col justify-center items-center">
                        <img alt="scene" width="32" height="32" src="icons/Scene.svg" />
                    </div>
                </Button>
                <Tooltip>Setup or load a scene based on a WRO or FLL mat</Tooltip>
                <Button color="light" class={libraryClass} on:click={askForLibrary}>
                    <div class="w-8 h-8 flex flex-col justify-center items-center">
                        <img alt="scene" width="32" height="32" src="icons/Library.svg" />
                    </div>
                </Button>
                <Tooltip>Load any missing components from the ldraw library (complete.zip)</Tooltip>
                <Button color="light" class="!p-2" on:click={saveRobotOrScene}>
                    <div class="w-8 h-8 flex flex-col justify-center items-center">
                        <img alt="save" width="32" height="32" src="icons/SaveMedium.svg" />
                    </div>
                </Button>
                <Tooltip
                    >Save the robot with ports and wheels, or the scene (without the robot)</Tooltip
                >
                <Button color="light" class="!p-2" on:click={openSettings}>
                    <CogOutline class="w-8 h-8" />
                </Button>
                <Tooltip>Adjust simulator speed settings</Tooltip>
                <Button id="camera_config_button" color="light" class="!p-2">
                    <div class="w-8 h-8 flex flex-col justify-center items-center">
                        <img alt="eye" width="32" height="32" src="icons/Eye.svg" />
                    </div>
                </Button>
                <MenuDropdown
                    name="camera"
                    actions={cameraMenu}
                    rounded={true}
                    class="bg-white rounded-2xl"
                />
                <Tooltip triggeredBy="#camera_config_button">Set camera for simulator</Tooltip>
                {#if runSimulation}
                    <Button color="light" class="!p-2" on:click={stopRobot}>
                        <div class="w-8 h-8 flex flex-col justify-center items-center">
                            <img
                                alt="stop"
                                width="32"
                                height="32"
                                src="icons/GenericStopIcon.svg"
                            />
                        </div>
                    </Button>
                    <Tooltip>Stop the simulation</Tooltip>
                {:else}
                    <Button color="light" class="!p-2" on:click={startRobot}>
                        <div class="w-8 h-8 flex flex-col justify-center items-center">
                            <img
                                alt="play"
                                width="32"
                                height="32"
                                src="icons/GenericPlayIcon.svg"
                            />
                        </div>
                    </Button>
                    <Tooltip>Start the simulation, running the code in the code panel</Tooltip>
                {/if}
                {#if !blocklyOpen}
                    <Button color="light" class="!p-2" on:click={openBlockly}>
                        <div class="w-8 h-8 flex flex-col justify-center items-center">
                            <img alt="blockly" width="32" height="32" src="icons/BlocklyIcon.svg" />
                        </div>
                    </Button>
                    <Tooltip>Open the code panel</Tooltip>
                {/if}
                <div class="flex-1" />
                {#if blocklyOpen}
                    <CloseButton on:click={closeWindow} />
                    <Tooltip>Close the simulation window</Tooltip>
                {/if}
            </div>
            {#key blocklyOpen}
                <div class="flex-1 w-full overflow-hidden">
                    <SpikeSimulator
                        bind:runSimulation
                        {workspace}
                        bind:connectorOpen
                        bind:hub
                        bind:sceneOpen
                        bind:wheelsOpen
                        {camera}
                        {tilt}
                        {robotFocus}
                    />
                </div>
            {/key}
        </div>
    </div>
{/if}
