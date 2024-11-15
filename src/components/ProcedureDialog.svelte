<script lang="ts">
    import { Button, Input, Modal } from 'flowbite-svelte';
    import {
        type ProcedureCreateCallback,
        type ParameterDefinition
    } from '$lib/blockly/procedure_flyout';

    export let modalOpen = false;
    export let callback: ProcedureCreateCallback | undefined = undefined;
    let procedureName = '';
    let parameters: ParameterDefinition[] = [];
    let labelVisible = false;
    let label = '';
    let varChoices = [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z'
    ];

    function createProcedure() {
        if (!callback) {
            reset();
            return;
        }
        if (procedureName.trim().length > 0) {
            if (callback({ name: procedureName, parameters: parameters, label: label })) {
                reset();
            }
        }
    }

    function reset() {
        procedureName = '';
        labelVisible = false;
        label = '';
        parameters = [];
        modalOpen = false;
    }

    function cancel() {
        reset();
    }

    function addInputNum() {
        let i = parameters.length;
        let count = 0;
        while (i >= varChoices.length) {
            count++;
            i -= varChoices.length;
        }
        let name = varChoices[i];
        if (count) {
            name += count.toString();
        }
        parameters.push({ name: name, type: ['Number', 'String'] });
        parameters = parameters;
    }

    function addInputBool() {
        let i = parameters.length;
        let count = 0;
        while (i >= varChoices.length) {
            count++;
            i -= varChoices.length;
        }
        let name = varChoices[i];
        if (count) {
            name += count.toString();
        }
        parameters.push({ name: name, type: ['Boolean'] });
        parameters = parameters;
    }

    function addLabel() {
        labelVisible = true;
        label = '';
    }

    function setParameterName(parameter: ParameterDefinition, e: Event) {
        if (e.target) {
            parameter.name = (e.target as HTMLInputElement).value;
        }
    }
</script>

<Modal
    size="md"
    backdropClass="fixed inset-0 z-[80] bg-gray-900 bg-opacity-50 dark:bg-opacity-80"
    dialogClass="fixed top-0 start-0 end-0 h-modal md:inset-0 md:h-full z-[90] w-full p-4 flex"
    title="Make a block"
    bind:open={modalOpen}
    autoclose
>
    <div class="flex flex-col gap-2">
        <div
            class="bg-red-300 p-5 text-black flex flex-row gap-2 rounded-xl items-center flex-wrap"
        >
            <div class="h-10 flex flex-row items-center">define</div>
            <div class="h-10 flex flex-row items-center">
                {procedureName}
            </div>
            {#each parameters as parameter}
                {#if parameter.type && parameter.type[0] == 'Boolean'}
                    <div class="flex flex-row">
                        <div class="bg-red-400 boolean-left w-5 h-10"></div>
                        <div class="bg-red-400 h-10 flex items-center justify-center">
                            <Input
                                id="label"
                                size="md"
                                placeholder={parameter.name}
                                value={parameter.name}
                                class="w-20 m-0 px-2 py-0.5"
                                on:change={(e) => {
                                    setParameterName(parameter, e);
                                }}
                            />
                        </div>
                        <div class="bg-red-400 boolean-right w-5 h-10"></div>
                    </div>
                {:else}
                    <div
                        class="bg-red-400 rounded-full px-3 min-w-10 h-10 flex items-center justify-center"
                    >
                        <Input
                            id="label"
                            size="md"
                            placeholder={parameter.name}
                            value={parameter.name}
                            class="w-20 m-0 px-2 py-0.5"
                            on:change={(e) => {
                                setParameterName(parameter, e);
                            }}
                        />
                    </div>
                {/if}
            {/each}
            {#if labelVisible}
                <Input
                    id="label"
                    size="lg"
                    placeholder="label"
                    bind:value={label}
                    class="flex-1 min-w-20"
                />
            {/if}
        </div>
        <Input id="procedure_name" size="lg" placeholder="block name" bind:value={procedureName} />
        <div class="flex flex-row gap-2 justify-around items-center">
            <Button color="alternative" on:click={addInputNum}>
                <div class="flex flex-col items-center">
                    <div>Add an input</div>
                    <div>(Number)</div>
                </div></Button
            >

            <Button color="alternative" on:click={addInputBool}>
                <div class="flex flex-col items-center">
                    <div>Add an input</div>
                    <div>(Boolean)</div>
                </div></Button
            >

            <Button color="alternative" on:click={addLabel}>
                <div class="flex flex-col items-center">
                    <div>Add a label</div>
                    <div>&nbsp;</div>
                </div></Button
            >
        </div>

        <div class="flex flex-row gap-2 mt-5 items-center justify-center">
            <Button on:click={cancel}>CANCEL</Button>
            <Button on:click={createProcedure} color="green">SAVE</Button>
        </div>
    </div>
</Modal>

<style>
    .boolean-left {
        clip-path: polygon(0% 50%, 100% 0%, 100% 100%);
    }
    .boolean-right {
        clip-path: polygon(100% 50%, 0% 100%, 0% 0%);
    }
</style>
