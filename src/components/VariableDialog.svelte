<script lang="ts">
    import { Button, Input, Modal } from 'flowbite-svelte';
    import { type VariableCreateCallback } from '$lib/blockly/variable_flyout';

    export let modalOpen = false;
    export let type: string = '';
    export let callback: VariableCreateCallback | undefined = undefined;
    let title = '';
    let variableName = '';

    function createVariable() {
        if (!callback) {
            modalOpen = false;
            return;
        }
        if (variableName.trim().length > 0) {
            let variableType = 'Number';
            if (type == 'list') {
                variableType = 'list';
            } else {
                variableType = 'Number';
            }
            if (callback({ name: variableName, type: variableType })) {
                variableName = '';
                modalOpen = false;
            }
        }
    }

    function cancel() {
        variableName = '';
        modalOpen = false;
    }

    $: title = type == 'list' ? 'New List' : 'New Variable';
</script>

<Modal
    backdropClass="fixed inset-0 z-[80] bg-gray-900 bg-opacity-50 dark:bg-opacity-80"
    dialogClass="fixed top-0 start-0 end-0 h-modal md:inset-0 md:h-full z-[90] w-full p-4 flex"
    {title}
    bind:open={modalOpen}
    autoclose
>
    <Input id="variable_name" size="lg" placeholder="myVariable" bind:value={variableName} />
    <Button on:click={cancel}>CANCEL</Button>
    <Button on:click={createVariable} color="green">OK</Button>
</Modal>
