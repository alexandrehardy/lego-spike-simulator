<script lang="ts">
    import { Modal, Input } from 'flowbite-svelte';
    import {
        componentStore,
        findParts,
        findPartTransform,
        type PartMatch
    } from '$lib/ldraw/components';
    import { type PortType, Hub, Wheel } from '$lib/spike/vm';
    import HubWidget from '$components/HubWidget.svelte';
    import RobotPreview from '$components/RobotPreview.svelte';

    interface WheelMatch {
        part: PartMatch;
        wheel?: Wheel;
    }

    export let modalOpen = false;
    export let hub: Hub;
    const matchCodes = ['39367p01', '49295p01'];
    const partNames: Record<string, string> = {
        '39367p01': 'Wheel', // Diameter 56mm
        '49295p01': 'Large Wheel' // Diameter 88mm
    };
    const partRadius: Record<string, number> = {
        '39367p01': 28,
        '49295p01': 44
    };
    let port: PortType | undefined;
    let parts: PartMatch[] = findParts($componentStore.robotModel, matchCodes);
    let wheels: WheelMatch[] = getWheels(parts, hub);
    let selectedWheel: number = -1;
    let selectedMotor: number = -1;
    let selected: number[] = [];
    let gearing = 1;
    let radius = 0;

    function getWheels(parts: PartMatch[], hub: Hub) {
        const wheels: WheelMatch[] = [];
        for (const part of parts) {
            const wheel = hub.wheels.find((w) => w.id == part.id);
            wheels.push({ part: part, wheel: wheel });
        }
        return wheels;
    }

    function select(id: number, part: string) {
        selectedWheel = id;
        radius = partRadius[part] ?? 0;
        const wheel = hub.wheels.find((w) => w.id == id);
        if (wheel) {
            port = wheel.port;
            gearing = wheel.gearing;
            radius = wheel.radius;
        } else {
            port = undefined;
        }

        if (port) {
            const portModel = hub.ports[port];
            if (portModel.type == 'motor') {
                const id = portModel.id();
                if (id == 'none') {
                    selectedMotor = -1;
                } else {
                    selectedMotor = id;
                }
            } else {
                selectedMotor = -1;
            }
        } else {
            selectedMotor = -1;
        }
        selected = [selectedWheel, selectedMotor];
    }

    function attach(toPort: PortType | undefined) {
        if (selectedWheel == -1) {
            return;
        }
        if (toPort) {
            port = toPort;
            let wheel = hub.wheels.find((w) => w.id == selectedWheel);
            if (wheel) {
                wheel.port = toPort;
            } else {
                const result = findPartTransform($componentStore.robotModel, selectedWheel);
                if (result) {
                    wheel = new Wheel(selectedWheel, radius, gearing, toPort, result.forward);
                    hub.wheels.push(wheel);
                }
            }
            const match = wheels.find((w) => w.part.id == selectedWheel);
            if (match) {
                match.wheel = wheel;
                wheels = wheels;
            }
            const portModel = hub.ports[port];
            if (portModel.type == 'motor') {
                const id = portModel.id();
                if (id == 'none') {
                    selectedMotor = -1;
                } else {
                    selectedMotor = id;
                }
            } else {
                selectedMotor = -1;
            }
            selected = [selectedWheel, selectedMotor];
        }
    }

    function updateGearing() {
        if (selectedWheel == -1) {
            return;
        }
        const match = wheels.find((w) => w.part.id == selectedWheel);
        if (match && match.wheel) {
            match.wheel.gearing = gearing;
            wheels = wheels;
        }
    }

    $: parts = findParts($componentStore.robotModel, matchCodes);
    $: wheels = getWheels(parts, hub);
</script>

<Modal
    backdropClass="fixed inset-0 z-[80] bg-gray-900 bg-opacity-50 dark:bg-opacity-80"
    dialogClass="fixed top-0 start-0 end-0 h-modal md:inset-0 md:h-full z-[90] w-full p-4 flex"
    title="Connect wheels"
    size="xl"
    bind:open={modalOpen}
>
    <div class="flex flex-row gap-2 h-[80dvh]">
        <div class="flex-1 flex flex-row gap-4 mb-4">
            <HubWidget
                bind:selectedPort={port}
                on:A={() => attach('A')}
                on:B={() => attach('B')}
                on:C={() => attach('C')}
                on:D={() => attach('D')}
                on:E={() => attach('E')}
                on:F={() => attach('F')}
            />
            <div class="flex flex-col gap-2">
                <span class="mb-2"
                    >Select the wheel to change, and then click on the port with the motor that
                    drives the wheel, and enter gear ratio. A negative gear ratio will cause the
                    wheel to turn in reverse.</span
                >
                {#each wheels as wheel}
                    {#if selectedWheel == wheel.part.id}
                        <button
                            class="rounded-xl p-4 border border-gray-400 bg-green-100 flex flex-col items-start w-full h-32"
                            on:click={() => select(wheel.part.id, wheel.part.part)}
                        >
                            <span>{partNames[wheel.part.part]}</span>
                            <span class="ml-6 text-sm text-black"
                                >Port: {wheel.wheel?.port ?? ''}</span
                            >
                            <div class="pl-6 flex flex-row items-center gap-2 w-full">
                                <span class="text-sm text-black">Gear ratio:</span>
                                <Input
                                    class="flex-1 my-0 py-2"
                                    bind:value={gearing}
                                    on:change={() => updateGearing()}
                                />
                            </div>
                        </button>
                    {:else}
                        <button
                            class="rounded-xl p-4 border border-gray-400 flex flex-col items-start h-32"
                            on:click={() => select(wheel.part.id, wheel.part.part)}
                        >
                            <span>{partNames[wheel.part.part]}</span>
                            <span class="ml-6 text-sm text-black"
                                >Port: {wheel.wheel?.port ?? ''}</span
                            >
                            <span class="ml-6 mt-0.5 text-sm text-black py-2"
                                >Gear ratio: {wheel.wheel?.gearing ?? ''}</span
                            >
                        </button>
                    {/if}
                {/each}
            </div>
        </div>
        <RobotPreview
            id="robot_preview_port"
            class="flex-1 w-full h-full"
            robotModel={$componentStore.robotModel}
            enabled={modalOpen}
            select={selected}
        />
    </div>
</Modal>
