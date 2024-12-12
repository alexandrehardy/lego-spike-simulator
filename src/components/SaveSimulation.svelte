<script lang="ts">
    import { Button, Modal } from 'flowbite-svelte';
    import { CirclePlusOutline, PlaySolid, TrashBinOutline } from 'flowbite-svelte-icons';
    import FileSaver from 'file-saver';
    import { componentStore, saveMPD, type LDrawStore } from '$lib/ldraw/components';

    export let modalOpen = false;

    function saveRobot() {
        const robot = $componentStore.robotModel;
        if (robot) {
            const content = saveMPD(robot);
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            FileSaver.saveAs(blob, 'robot.mpd');
        }
    }

    function saveScene() {}
</script>

<Modal
    backdropClass="fixed inset-0 z-[80] bg-gray-900 bg-opacity-50 dark:bg-opacity-80"
    dialogClass="fixed top-0 start-0 end-0 h-modal md:inset-0 md:h-full z-[90] w-full p-4 flex"
    title="Save simulation"
    bind:open={modalOpen}
>
    <div class="flex flex-col gap-2 items-center">
        <Button color="light" class="!p-2 w-96" on:click={saveRobot}>
            <div class="flex flex-row gap-2 items-center">
                <img alt="robot" width="32" height="32" src="icons/Robot.svg" />
                <span>Save robot (mpd with ports)</span>
            </div>
        </Button>
        <Button color="light" class="!p-2 w-96" on:click={saveScene}>
            <div class="flex flex-row gap-2 items-center">
                <img alt="scene" width="32" height="32" src="icons/Scene.svg" />
                <span>Save scene with mat (zip with mpd)</span>
            </div>
        </Button>
    </div>
</Modal>
