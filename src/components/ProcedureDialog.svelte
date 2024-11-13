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

    function createProcedure() {
        if (!callback) {
            modalOpen = false;
            return;
        }
        if (procedureName.trim().length > 0) {
            if (callback({ name: procedureName, parameters: parameters })) {
                procedureName = '';
                parameters = [];
                modalOpen = false;
            }
        }
    }

    function cancel() {
        procedureName = '';
        parameters = [];
        modalOpen = false;
    }
</script>

<Modal
    backdropClass="fixed inset-0 z-[80] bg-gray-900 bg-opacity-50 dark:bg-opacity-80"
    dialogClass="fixed top-0 start-0 end-0 h-modal md:inset-0 md:h-full z-[90] w-full p-4 flex"
    title="Make a block"
    bind:open={modalOpen}
    autoclose
>
    <div class="flex flex-col gap-2">
        <div class="bg-red-300 p-5 text-black">
            {procedureName}
        </div>
        <Input id="procedure_name" size="lg" placeholder="block name" bind:value={procedureName} />
        <div class="flex flex-row gap-2 justify-around items-center">
            <Button color="yellow"
                ><div class="flex flex-col items-center">
                    <div>Add an input</div>
                    <div>(Number)</div>
                </div></Button
            >
            <Button color="yellow"
                ><div class="flex flex-col items-center">
                    <div>Add an input</div>
                    <div>(Boolean)</div>
                </div></Button
            >
            <Button color="yellow"
                ><div class="flex flex-col items-center">
                    <div>Add a label</div>
                    <div>&nbsp;</div>
                </div></Button
            >
        </div>

        <div class="flex flex-row gap-2 mt-5 items-center justify-center">
            <Button on:click={cancel}>CANCEL</Button>
            <Button on:click={createProcedure} color="alternative">SAVE</Button>
        </div>
    </div>
</Modal>
