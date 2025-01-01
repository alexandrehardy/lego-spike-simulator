<script lang="ts">
    import { Modal } from 'flowbite-svelte';
    import FileSaver from 'file-saver';
    import { loadModel, setStudioMode } from '$lib/ldraw/components';
    import { sceneStore, type SceneStore } from '$lib/spike/scene';
    import { TrashBinOutline } from 'flowbite-svelte-icons';
    import ScenePreview from '$components/ScenePreview.svelte';
    import Menu from '$components/Menu.svelte';
    import { type MenuAction, type MenuEntry } from '$components/Menu.svelte';
    import JSZip from 'jszip';

    export let modalOpen = false;
    let numberOfLoads = 0;
    let mapFile: File | undefined = $sceneStore.map;
    let camera: 'top' | 'left' | 'right' | 'front' | 'back' | 'angle' = 'angle';
    let rotate = false;
    let mapWidth = 0;
    let mapHeight = 0;

    let menu = prepareMenu(rotate, camera, $sceneStore);
    $: menu = prepareMenu(rotate, camera, $sceneStore);

    function toggleRotate() {
        rotate = !rotate;
    }

    function setCamera(direction: 'top' | 'left' | 'right' | 'front' | 'back' | 'angle') {
        camera = direction;
    }

    function prepareMenu(rotate: boolean, camera: string, scene: SceneStore) {
        let menu: MenuEntry[] = [];
        menu.push({
            name: 'Load',
            actions: [
                { name: 'Load mat', action: () => loadBackgroundMap() },
                { name: 'Load full scene', action: () => loadScene() },
                { name: 'Load object', action: () => loadObject() }
            ]
        });
        menu.push({
            name: 'Camera',
            actions: [
                {
                    name: 'Angle',
                    action: () => {
                        setCamera('angle');
                    },
                    radio: camera == 'angle'
                },
                {
                    name: 'Top',
                    action: () => {
                        setCamera('top');
                    },
                    radio: camera == 'top'
                },
                {
                    name: 'Left',
                    action: () => {
                        setCamera('left');
                    },
                    radio: camera == 'left'
                },
                {
                    name: 'Right',
                    action: () => {
                        setCamera('right');
                    },
                    radio: camera == 'right'
                },
                {
                    name: 'Front',
                    action: () => {
                        setCamera('front');
                    },
                    radio: camera == 'front'
                },
                {
                    name: 'Back',
                    action: () => {
                        setCamera('back');
                    },
                    radio: camera == 'back'
                },
                {
                    name: 'Rotate',
                    action: () => {
                        toggleRotate();
                    },
                    checkbox: rotate
                }
            ]
        });

        let select: MenuAction[] = [];
        if (scene.map) {
            select.push({ name: 'Mat', action: () => {}, radio: true });
        }
        select.push({ name: 'Robot', action: () => {}, radio: false });
        menu.push({
            name: 'Select',
            actions: select
        });
        for (const obj of scene.objects) {
            select.push({ name: obj.name, action: () => {}, radio: false });
        }
        let remove: MenuAction[] = [];
        for (const obj of scene.objects) {
            remove.push({ name: obj.name, action: () => {}, icon: TrashBinOutline });
        }
        menu.push({
            name: 'Remove',
            actions: remove
        });
        return menu;
    }

    function loadBackgroundMap() {
        const element = document.getElementById('load_map_image');
        if (element) {
            element.click();
        }
    }

    function loadScene() {}

    function loadObject() {
        const element = document.getElementById('load_object_file');
        if (element) {
            element.click();
        }
    }

    function loadMapImage() {
        const element = document.getElementById('load_map_image');
        if (element) {
            const fileElement = element as HTMLInputElement;
            if (fileElement.files) {
                if (fileElement.files.length > 0) {
                    const first = fileElement.files[0];
                    mapFile = first;
                    sceneStore.update((old) => {
                        return {
                            ...old,
                            map: mapFile
                        };
                    });
                    numberOfLoads++;
                }
            }
        }
    }

    async function loadObjectFromFile() {
        const element = document.getElementById('load_object_file');
        if (element) {
            const fileElement = element as HTMLInputElement;
            if (fileElement.files) {
                if (fileElement.files.length > 0) {
                    const first = fileElement.files[0];
                    if (first.name.toLowerCase().endsWith('.io')) {
                        const zip = new JSZip();
                        const zipFile = await zip.loadAsync(first);
                        const file = zipFile.file('model2.ldr');
                        if (file) {
                            const content = await file.async('string');
                            try {
                                setStudioMode(true);
                                const model = loadModel(first.name, content);
                                sceneStore.update((old) => {
                                    return {
                                        ...old,
                                        objects: old.objects.concat([
                                            {
                                                bricks: model,
                                                anchored: true,
                                                position: { x: 0, y: 0, z: 0 },
                                                name: first.name
                                            }
                                        ])
                                    };
                                });
                            } finally {
                                setStudioMode(false);
                            }
                        }
                    } else {
                        const model = loadModel(first.name, await first.text());
                        sceneStore.update((old) => {
                            return {
                                ...old,
                                objects: old.objects.concat([
                                    {
                                        bricks: model,
                                        anchored: true,
                                        position: { x: 0, y: 0, z: 0 },
                                        name: first.name
                                    }
                                ])
                            };
                        });
                    }
                    numberOfLoads++;
                }
            }
        }
    }
</script>

{#key numberOfLoads}
    <input
        type="file"
        id="load_map_image"
        class="hidden"
        accept=".jpg,.png"
        on:change={loadMapImage}
    />
    <input
        type="file"
        id="load_object_file"
        class="hidden"
        accept=".ldr,.mpd,.io"
        on:change={loadObjectFromFile}
    />
{/key}
<Modal
    backdropClass="fixed inset-0 z-[80] bg-gray-900 bg-opacity-50 dark:bg-opacity-80"
    dialogClass="fixed top-0 start-0 end-0 h-modal md:inset-0 md:h-full z-[90] w-full p-4 flex"
    title="Scene editor"
    size="xl"
    bind:open={modalOpen}
>
    <div class="flex flex-col gap-1 h-[80dvh] relative">
        <Menu {menu} class="absolute z-50" />
        <div class="flex flex-row flex-1 relative">
            <div class="flex-1 h-full">
                <ScenePreview
                    id="scene_preview"
                    scene={$sceneStore}
                    class="h-full w-full"
                    map={mapFile}
                    {rotate}
                    {camera}
                    bind:mapWidth
                    bind:mapHeight
                />
            </div>
        </div>
    </div>
</Modal>
