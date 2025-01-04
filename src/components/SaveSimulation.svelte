<script lang="ts">
    import { Button, Modal } from 'flowbite-svelte';
    import FileSaver from 'file-saver';
    import { componentStore, clearPorts, setPort, saveMPD } from '$lib/ldraw/components';
    import { allPorts, Hub } from '$lib/spike/vm';
    import { sceneStore } from '$lib/spike/scene';
    import JSZip from 'jszip';

    export let modalOpen = false;
    export let hub: Hub;

    function saveRobot() {
        const robot = $componentStore.robotModel;
        if (robot) {
            clearPorts(robot);
            for (const port of allPorts) {
                const id = hub.ports[port].id();
                if (id !== 'none') {
                    setPort(robot, 'main', port, id);
                }
            }
            const content = saveMPD(robot);
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            FileSaver.saveAs(blob, 'robot.mpd');
        }
    }

    async function saveScene() {
        const scene = $sceneStore;
        const zip = new JSZip();
        if (scene.map) {
            zip.file('mat.jpg', scene.map);
        }
        for (const obj of scene.objects) {
            if (obj.bricks) {
                const content = saveMPD(obj.bricks);
                zip.file(`bricks-${obj.name}`, content);
            }
        }
        const json = {
            version: 1,
            robot: {
                anchored: scene.robot.anchored,
                position: scene.robot.position,
                rotation: scene.robot.rotation,
                name: '#robot'
            },
            matWidth: scene.mapWidth,
            matHeight: scene.mapHeight,
            objects: scene.objects.map((o) => ({
                anchored: o.anchored,
                position: o.position,
                rotation: o.rotation,
                name: o.name
            }))
        };
        zip.file('scene.json', JSON.stringify(json));
        const sceneZip = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
        FileSaver.saveAs(sceneZip, 'scene.zip');
    }
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
