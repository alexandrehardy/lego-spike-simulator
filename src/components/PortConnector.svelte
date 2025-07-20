<script lang="ts">
    import { Modal, Radio } from 'flowbite-svelte';
    import { componentStore, findParts, type PartMatch } from '$lib/ldraw/components';
    import {
        type PortType,
        allPorts,
        Hub,
        Port,
        Motor,
        LightSensor,
        UltraSoundSensor,
        ForceSensor
    } from '$lib/spike/vm';
    import HubWidget from '$components/HubWidget.svelte';
    import RobotPreview from '$components/RobotPreview.svelte';

    export let modalOpen = false;
    export let hub: Hub;
    const matchCodes = ['54696', '54696p01', '68488', '54675', '37308', '37316', '37312'];
    const partNames: Record<string, string> = {
        '54696': 'Medium motor',
        '54696p01': 'Medium motor',
        '68488': 'Small motor',
        '54675': 'Large motor',
        '37308': 'Colour sensor',
        '37316': 'Distance sensor',
        '37312': 'Force sensor'
    };
    let port: PortType = 'A';
    let parts: PartMatch[] = findParts($componentStore.robotModel, matchCodes);
    let selected: number = -1;

    function selectPort(newPort: PortType) {
        port = newPort;
        const id = hub.ports[port].id();
        if (id === 'none') {
            selected = -1;
        } else {
            selected = id;
        }
    }

    function attach(e: Event) {
        if (e.target) {
            const radio = e.target as HTMLInputElement;
            if (radio.value === 'none') {
                hub.ports[port] = new Port('none');
                selected = -1;
            } else {
                const match = parts.find((x) => x.id.toString() === radio.value);
                if (match) {
                    selected = match.id;
                    for (const p of allPorts) {
                        if (match.id == hub.ports[p].id()) {
                            hub.ports[p] = new Port('none');
                        }
                    }
                    if (match.part == '54696') {
                        hub.ports[port] = new Port('motor');
                        hub.ports[port].motor = new Motor(match.id);
                    } else if (match.part == '54696p01') {
                        hub.ports[port] = new Port('motor');
                        hub.ports[port].motor = new Motor(match.id);
                    } else if (match.part == '68488') {
                        hub.ports[port] = new Port('motor');
                        hub.ports[port].motor = new Motor(match.id);
                    } else if (match.part == '54675') {
                        hub.ports[port] = new Port('motor');
                        hub.ports[port].motor = new Motor(match.id);
                    } else if (match.part == '37308') {
                        hub.ports[port] = new Port('light');
                        hub.ports[port].light = new LightSensor(match.id);
                    } else if (match.part == '37316') {
                        hub.ports[port] = new Port('distance');
                        hub.ports[port].ultra = new UltraSoundSensor(match.id);
                    } else if (match.part == '37312') {
                        hub.ports[port] = new Port('force');
                        hub.ports[port].force = new ForceSensor(match.id);
                    }
                }
            }
        }
    }

    function isChecked(port: 'A' | 'B' | 'C' | 'D' | 'E' | 'F', id: number | 'none') {
        return hub.ports[port].id() === id;
    }

    $: parts = findParts($componentStore.robotModel, matchCodes);
</script>

<Modal
    backdropClass="fixed inset-0 z-[80] bg-gray-900 bg-opacity-50 dark:bg-opacity-80"
    dialogClass="fixed top-0 start-0 end-0 h-modal md:inset-0 md:h-full z-[90] w-full p-4 flex"
    title="Connect robot ports"
    size="xl"
    bind:open={modalOpen}
>
    <div class="flex flex-row gap-2 h-[75dvh] overflow-hidden">
        <div class="flex-1 flex flex-row gap-4 mb-4 overflow-hidden">
            <HubWidget
                bind:selectedPort={port}
                on:A={() => selectPort('A')}
                on:B={() => selectPort('B')}
                on:C={() => selectPort('C')}
                on:D={() => selectPort('D')}
                on:E={() => selectPort('E')}
                on:F={() => selectPort('F')}
            />
            <div class="flex flex-col gap-2">
                <span>Click on a port on the hub to determine the connection for the port.</span>
                <span class="text-black font-bold">Port {port}:</span>
                {#key port}
                    <Radio
                        name="attachment"
                        value="none"
                        on:change={attach}
                        checked={isChecked(port, 'none')}>None</Radio
                    >
                    {#each parts as part}
                        <Radio
                            name="attachment"
                            value={part.id.toString()}
                            on:change={attach}
                            checked={isChecked(port, part.id)}>{partNames[part.part]}</Radio
                        >
                    {/each}
                {/key}
            </div>
        </div>
        <div class="flex-1 w-full h-full overflow-hidden">
            <RobotPreview
                id="robot_preview_port"
                class="w-full h-full"
                robotModel={$componentStore.robotModel}
                enabled={modalOpen}
                select={[selected]}
            />
        </div>
    </div>
</Modal>
