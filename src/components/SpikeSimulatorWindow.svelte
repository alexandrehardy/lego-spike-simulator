<script lang="ts">
    import { Button, Input, Modal } from 'flowbite-svelte';
    import SpikeSimulator from '$components/SpikeSimulator.svelte';

    export let modalOpen = false;
</script>

<Modal
    size="xl"
    backdropClass="fixed inset-0 z-[80] bg-gray-900 bg-opacity-50 dark:bg-opacity-80"
    dialogClass="fixed top-0 start-0 end-0 h-modal md:inset-0 md:h-full z-[90] w-full p-4 flex"
    title="Simulator"
    bind:open={modalOpen}
    autoclose
>
    <SpikeSimulator />
</Modal>
