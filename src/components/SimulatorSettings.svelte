<script lang="ts">
    import { Modal, Label, Range } from 'flowbite-svelte';
    import { getStepSleep, getTimeFactor, setStepSleep, setTimeFactor } from '$lib/spike/vm';

    export let modalOpen = false;
    let stepTime = getStepSleep() / 1000.0;
    let timeScale = getTimeFactor();

    function updateSleep() {
        setStepSleep(stepTime * 1000);
    }

    function updateScale() {
        setTimeFactor(timeScale);
    }
</script>

<Modal
    backdropClass="fixed inset-0 z-[80] bg-gray-900 bg-opacity-50 dark:bg-opacity-80"
    dialogClass="fixed top-0 start-0 end-0 h-modal md:inset-0 md:h-full z-[90] w-full p-4 flex"
    title="Settings"
    bind:open={modalOpen}
>
    <div class="flex flex-col gap-2 items-start">
        <Label>Time between program steps: {stepTime} seconds</Label>
        <Range min="0" max="10" step="0.1" bind:value={stepTime} on:change={() => updateSleep()} />
        <div class="h-2" />
        <Label>Time scaling (slower or faster): {timeScale}</Label>
        <Range
            min="0.1"
            max="5"
            step="0.1"
            bind:value={timeScale}
            on:change={() => updateScale()}
        />
    </div>
</Modal>
