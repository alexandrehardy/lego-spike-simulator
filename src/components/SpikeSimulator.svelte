<script lang="ts">
    import * as Blockly from 'blockly/core';
    import {
        type Model,
        componentStore,
        findPartTransform,
        resolveFromZip,
        setRobotFromFile,
        setRobotFromContent,
        setStudioMode
    } from '$lib/ldraw/components';
    import { type CompiledModel, WebGLCompiler } from '$lib/ldraw/gl';
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
        ForceSensor,
        Wheel
    } from '$lib/spike/vm';
    import { genId } from '$lib/blockly/genid';
    import { copyScene, sceneStore } from '$lib/spike/scene';
    import HubWidget from '$components/HubWidget.svelte';
    import RobotPreview from '$components/RobotPreview.svelte';
    import ScenePreview from '$components/ScenePreview.svelte';
    import ColourSensor from '$components/ColourSensor.svelte';
    import DistanceSensor from '$components/DistanceSensor.svelte';
    import ForceCheckSensor from '$components/ForceCheckSensor.svelte';
    import * as m4 from '$lib/ldraw/m4';
    import JSZip from 'jszip';

    export let runSimulation: boolean = false;
    export let workspace: Blockly.WorkspaceSvg | undefined;
    export let connectorOpen = false;
    export let sceneOpen = false;
    export let wheelsOpen = false;
    export let hub = new Hub();
    export let camera: 'top' | 'left' | 'right' | 'front' | 'back' | 'adaptive' = 'adaptive';
    export let robotFocus = false;
    export let tilt = true;

    let compiler = new WebGLCompiler();

    interface SensorView {
        id: number | 'none';
        port: PortType;
        type: string;
    }

    let numberOfLoads = 0;
    let vm: VM | undefined;
    let hubImage = '0000000000000000000000000';
    let hubCentreButtonColour = '#ffffff';
    let compiledRobot: CompiledModel | undefined = $componentStore.robotModel
        ? compiler.compileModel($componentStore.robotModel, { rescale: false })
        : undefined;
    let sensors: SensorView[] = [];
    let lastFrame: number = 0;
    let scene = copyScene($sceneStore);
    let id = genId();

    const partNames: Record<string, string> = {
        '54696': 'motor',
        '68488': 'motor',
        '54675': 'motor',
        '37308': 'light',
        '37316': 'distance',
        '37312': 'force',
        '39367p01': 'wheel', // Diameter 56mm
        '49295p01': 'wheel' // Diameter 88mm
    };
    const partRadius: Record<string, number> = {
        '39367p01': 28,
        '49295p01': 44
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

    function connectWheels(hub: Hub, robot: Model) {
        for (const subpart of robot.subparts) {
            if (subpart.model) {
                if (subpart.port) {
                    // Ignore the hub for the moment, we only have one
                    const part = subpart.modelNumber.replace('.dat', '');
                    const type = partNames[part];
                    const port = subpart.port.port as PortType;
                    if (type === 'wheel') {
                        const radius = partRadius[part] ?? 1;
                        const gearing = subpart.gear_ratio ?? 1;
                        hub.wheels.push(
                            new Wheel(subpart.id, radius, gearing, port, m4.identity())
                        );
                    }
                }
                connectWheels(hub, subpart.model);
            }
        }
    }

    function loadWheelTransforms(hub: Hub, robot: Model) {
        for (const wheel of hub.wheels) {
            const result = findPartTransform(robot, wheel.id);
            if (result) {
                let matrix = m4.identity();
                if (compiledRobot) {
                    matrix = m4.translate(matrix, 0.0, compiledRobot.bbox.min.y, 0.0);
                    matrix = m4.translate(
                        matrix,
                        compiledRobot.recenter.x,
                        compiledRobot.recenter.y,
                        compiledRobot.recenter.z
                    );
                }
                matrix = m4.axisRotate(matrix, [1.0, 0.0, 0.0], Math.PI);
                matrix = m4.scale(matrix, 0.4, 0.4, 0.4);
                matrix = m4.multiply(matrix, result.forward);
                wheel.locationTransform = matrix;
                wheel.applyTransform();
            } else {
                console.log('Error');
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
                                const robot = setRobotFromContent(content);
                                compiledRobot = compiler.compileModel(robot, { rescale: false });
                                hub.reload();
                                hub = hub;
                            } finally {
                                setStudioMode(false);
                            }
                        }
                    } else {
                        const robot = await setRobotFromFile(first);
                        compiledRobot = compiler.compileModel(robot, { rescale: false });
                        hub.reload();
                        connectPorts(hub, robot);
                        connectWheels(hub, robot);
                        loadWheelTransforms(hub, robot);
                        hub = hub;
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

    function stepVM(timestamp: number) {
        if (!vm) {
            return;
        }
        if (vm.id != vm.hub.id) {
            return;
        }
        const frameTime = timestamp - lastFrame;
        if (vm.state == 'running') {
            if (lastFrame > 0) {
                vm.step(frameTime / 1000.0, scene);
            } else {
                vm.step(0.0, scene);
            }
            requestAnimationFrame(stepVM);
        }
        lastFrame = timestamp;
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
            let sensorList: SensorView[] = [];
            if (hub.ports.A.type != 'none') {
                sensorList.push({ id: hub.ports.A.id(), port: 'A', type: hub.ports.A.type });
            }
            if (hub.ports.B.type != 'none') {
                sensorList.push({ id: hub.ports.B.id(), port: 'B', type: hub.ports.B.type });
            }
            if (hub.ports.C.type != 'none') {
                sensorList.push({ id: hub.ports.C.id(), port: 'C', type: hub.ports.C.type });
            }
            if (hub.ports.D.type != 'none') {
                sensorList.push({ id: hub.ports.D.id(), port: 'D', type: hub.ports.D.type });
            }
            if (hub.ports.E.type != 'none') {
                sensorList.push({ id: hub.ports.E.id(), port: 'E', type: hub.ports.E.type });
            }
            if (hub.ports.F.type != 'none') {
                sensorList.push({ id: hub.ports.F.id(), port: 'F', type: hub.ports.F.type });
            }
            sensors = sensorList;
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
            hub = hub;
            scene = copyScene($sceneStore);
            vm = new VM(id, hub, globals, $codeStore.events, $codeStore.procedures, workspace);
            vm.start();
            lastFrame = 0;
            requestAnimationFrame(stepVM);
        } else {
            if (vm) {
                vm.stop();
                hubImage = '0000000000000000000000000';
                hubCentreButtonColour = '#ffffff';
            }
        }
    }

    function hubLeftPress() {
        if (vm) {
            vm.hub.leftPressed = true;
        }
    }

    function hubRightPress() {
        if (vm) {
            vm.hub.rightPressed = true;
        }
    }

    function hubLeftRelease() {
        if (vm) {
            vm.hub.leftPressed = false;
        }
    }

    function hubRightRelease() {
        if (vm) {
            vm.hub.rightPressed = false;
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

    <div class="w-full h-full relative overflow-hidden" hidden={!compiledRobot && !runSimulation}>
        <div class="flex flex-row w-full h-full">
            <div class="flex flex-col">
                <div class="mx-3 my-0 h-min">
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
                    {#each sensors as sensor}
                        {#if sensor.type == 'light'}
                            <span class="text-sm mt-2">
                                Port {sensor.port}: Colour sensor
                            </span>
                            <ColourSensor
                                id={`sensor_view_${sensor.port}`}
                                {scene}
                                class="h-14 w-14"
                                map={$sceneStore.map}
                                lightSensorId={sensor.id}
                                {hub}
                                port={sensor.port}
                            />
                        {:else if sensor.type == 'force'}
                            <span class="text-sm mt-2">
                                Port {sensor.port}: Force sensor
                            </span>
                            <ForceCheckSensor
                                id={`sensor_view_${sensor.port}`}
                                {scene}
                                class="h-14 w-14"
                                map={$sceneStore.map}
                                forceSensorId={sensor.id}
                                {hub}
                                port={sensor.port}
                            />
                        {:else if sensor.type == 'distance'}
                            <span class="text-sm mt-2">
                                Port {sensor.port}: Distance sensor
                            </span>
                            <DistanceSensor
                                id={`sensor_view_${sensor.port}`}
                                {scene}
                                class="h-14 w-14"
                                map={$sceneStore.map}
                                distanceSensorId={sensor.id}
                                {hub}
                                port={sensor.port}
                            />
                        {/if}
                    {/each}
                {/if}
            </div>
            <div class="overflow-hidden w-full h-full">
                {#if runSimulation}
                    <ScenePreview
                        id="scene_preview"
                        {scene}
                        class="h-full w-full"
                        map={$sceneStore.map}
                        rotate={false}
                        {camera}
                        {robotFocus}
                        {tilt}
                        select="#all"
                        dimMap={true}
                        {hub}
                    />
                {:else}
                    <div class="flex flex-col w-full h-full">
                        {#if compiledRobot}
                            <div class="absolute right-0 top-0 text-white px-2 mx-2 my-1">
                                {Math.ceil(compiledRobot.bbox.max.x - compiledRobot.bbox.min.x)}mm x
                                {Math.ceil(compiledRobot.bbox.max.z - compiledRobot.bbox.min.z)}mm x
                                {Math.ceil(compiledRobot.bbox.max.y - compiledRobot.bbox.min.y)}mm
                            </div>
                        {/if}
                        <RobotPreview
                            id="robot_preview"
                            class="w-full h-full"
                            robotModel={$componentStore.robotModel}
                            {compiledRobot}
                            enabled={!connectorOpen && !sceneOpen && !wheelsOpen}
                        />
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
