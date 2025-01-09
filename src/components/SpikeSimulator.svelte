<script lang="ts">
    import * as Blockly from 'blockly/core';
    import {
        type Model,
        componentStore,
        resolveFromZip,
        setRobotFromFile,
        setRobotFromContent,
        setStudioMode
    } from '$lib/ldraw/components';
    import { type CompiledModel } from '$lib/ldraw/gl';
    import {
        VM,
        Hub,
        type Namespace,
        StringValue,
        ListValue,
        codeStore,
        type PortType,
        Port,
        Motor,
        LightSensor,
        UltraSoundSensor,
        ForceSensor
    } from '$lib/spike/vm';
    import { sceneStore } from '$lib/spike/scene';
    import HubWidget from '$components/HubWidget.svelte';
    import RobotPreview from '$components/RobotPreview.svelte';
    import ScenePreview from '$components/ScenePreview.svelte';
    import SensorView from '$components/SensorView.svelte';
    import JSZip from 'jszip';

    export let runSimulation: boolean = false;
    export let workspace: Blockly.WorkspaceSvg | undefined;
    export let connectorOpen = false;
    export let sceneOpen = false;
    export let hub = new Hub();

    let numberOfLoads = 0;
    let vm: VM | undefined;
    let hubImage = '0000000000000000000000000';
    let hubCentreButtonColour = '#ffffff';
    let compiledRobot: CompiledModel | undefined = undefined;
    let lightSensorId: number | 'none' = 'none';

    const partNames: Record<string, string> = {
        '54696': 'motor',
        '68488': 'motor',
        '54675': 'motor',
        '37308': 'light',
        '37316': 'distance',
        '37312': 'force'
    };

    function connectPorts(hub: Hub, robot: Model) {
        for (const subpart of robot.subparts) {
            if (subpart.model) {
                if (subpart.port) {
                    // Ignore the hub for the moment, we only have one
                    const part = subpart.modelNumber.replace('.dat', '');
                    const type = partNames[part];
                    const port = subpart.port.port as PortType;
                    if (type === 'motor') {
                        hub.ports[port] = new Port('motor');
                        hub.ports[port].motor = new Motor(subpart.id);
                    } else if (type === 'light') {
                        hub.ports[port] = new Port('light');
                        hub.ports[port].light = new LightSensor(subpart.id);
                    } else if (type === 'distance') {
                        hub.ports[port] = new Port('distance');
                        hub.ports[port].ultra = new UltraSoundSensor(subpart.id);
                    } else if (type === 'force') {
                        hub.ports[port] = new Port('force');
                        hub.ports[port].force = new ForceSensor(subpart.id);
                    }
                }
                connectPorts(hub, subpart.model);
            }
        }
    }

    async function loadRobot() {
        const element = document.getElementById('load_robot');
        if (element) {
            const fileElement = element as HTMLInputElement;
            if (fileElement.files) {
                if (fileElement.files.length > 0) {
                    const first = fileElement.files[0];
                    numberOfLoads++;
                    if (first.name.toLowerCase().endsWith('.io')) {
                        const zip = new JSZip();
                        const zipFile = await zip.loadAsync(first);
                        const file = zipFile.file('model2.ldr');
                        if (file) {
                            const content = await file.async('string');
                            try {
                                setStudioMode(true);
                                setRobotFromContent(content);
                                hub.reload();
                            } finally {
                                setStudioMode(false);
                            }
                        }
                    } else {
                        const robot = await setRobotFromFile(first);
                        hub.reload();
                        connectPorts(hub, robot);
                    }
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

    function handleHubEvent(event: string, value: string) {
        if (event == 'screen') {
            hubImage = value;
        }
        if (event == 'hubButtonColour') {
            hubCentreButtonColour = value;
        }
    }

    function startOrPauseSimulation(start: boolean) {
        if (start) {
            if (vm) {
                vm.stop();
                hubImage = '0000000000000000000000000';
                hubCentreButtonColour = '#ffffff';
            }
            const selected = Blockly.common.getSelected();
            if (selected) {
                selected.unselect();
            }
            hub.setEventHandler(handleHubEvent);
            hub.reset();
            if (hub.ports.A.type == 'light') {
                lightSensorId = hub.ports.A.id();
            } else if (hub.ports.B.type == 'light') {
                lightSensorId = hub.ports.B.id();
            } else if (hub.ports.C.type == 'light') {
                lightSensorId = hub.ports.C.id();
            } else if (hub.ports.D.type == 'light') {
                lightSensorId = hub.ports.D.id();
            } else if (hub.ports.E.type == 'light') {
                lightSensorId = hub.ports.E.id();
            } else if (hub.ports.F.type == 'light') {
                lightSensorId = hub.ports.F.id();
            }
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
                hubCentreButtonColour = '#ffffff';
            }
            lightSensorId = 'none';
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

    $: startOrPauseSimulation(runSimulation);
</script>

<div class="flex flex-col h-full p-2 overflow-y-scroll relative">
    {#key numberOfLoads}
        <input
            type="file"
            id="load_robot"
            class="hidden"
            accept=".ldr,.mpd,.io"
            on:change={loadRobot}
        />
        <input type="file" id="load_library" class="hidden" accept=".zip" on:change={loadLibrary} />
    {/key}
    {#if !compiledRobot && !runSimulation}
        <div class="m-2">
            Use LeoCad (<a href="https://www.leocad.org/" target="_blank">https://www.leocad.org/</a
            >) to create a model for your robot or Bricklink Studio (<a
                href="https://www.bricklink.com/v3/studio/download.page"
                target="_blank">https://www.bricklink.com/v3/studio/download.page</a
            >). Then upload the robot.
        </div>
        <div class="m-2">
            <span
                >Load the robot by clicking the
                <img class="inline mx-2" alt="robot" width="32" height="32" src="icons/Robot.svg" />
                icon. Then setup or load the scene to run the robot in by clicking on the
                <img class="inline mx-2" alt="scene" width="32" height="32" src="icons/Scene.svg" />
                icon.</span
            >
        </div>
        <div class="m-2">
            You may need to upload the component library (complete.zip) to load your model (<a
                href="https://library.ldraw.org/updates?latest"
                target="_blank">https://library.ldraw.org/updates?latest</a
            >). Check to see if there are any missing parts to see if the library needs to be
            loaded. The
            <img class="inline mx-2" alt="scene" width="32" height="32" src="icons/Library.svg" /> icon
            will bounce if additional parts are needed. Click on it to load parts.
        </div>
        <div class="m-2">
            Always load the robot before the library, only missing bricks are loaded from the
            library.
        </div>
    {/if}

    <div class="w-full flex-1 relative" hidden={!compiledRobot && !runSimulation}>
        <div class="flex flex-row w-full h-full">
            <div class="flex flex-col">
            <div class="m-3 h-min">
                <HubWidget
                    image={hubImage}
                    centreButtonColour={hubCentreButtonColour}
                    on:leftPress={hubLeftPress}
                    on:rightPress={hubRightPress}
                    on:leftRelease={hubLeftRelease}
                    on:rightRelease={hubRightRelease}
                />
            </div>
            {#if runSimulation}
                <SensorView
                    id="sensor_view"
                    scene={$sceneStore}
                    class="h-28 w-28"
                    map={$sceneStore.map}
                    {lightSensorId}
                    />
{/if}
            </div>
            {#if runSimulation}
                <ScenePreview
                    id="scene_preview"
                    scene={$sceneStore}
                    class="h-full w-full"
                    map={$sceneStore.map}
                    rotate={false}
                    camera="front"
                    tilt={true}
                    select="#all"
                />
            {:else}
                <RobotPreview
                    id="robot_preview"
                    class="flex-1 w-full h-full"
                    robotModel={$componentStore.robotModel}
                    bind:compiledRobot
                    enabled={!connectorOpen && !sceneOpen}
                />
            {/if}
        </div>
    </div>
</div>
