<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { Button, Modal } from 'flowbite-svelte';
    import FileSaver from 'file-saver';
    import { WebGL, type CompiledModel } from '$lib/ldraw/gl';
    import { loadModel } from '$lib/ldraw/components';
    import { sceneStore } from '$lib/spike/scene';
    import ScenePreview from '$components/ScenePreview.svelte';

    export let modalOpen = false;
    let numberOfLoads = 0;
    let mapFile: File | undefined = $sceneStore.map;

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
        accept=".ldr,.mpd"
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
    <div class="flex flex-row h-[80dvh]">
        <div class="flex-1 flex flex-col gap-2 items-center">
            <Button color="light" class="!p-2 w-96" on:click={loadBackgroundMap}>
                <div class="flex flex-row gap-2 items-center">
                    <img alt="scene" width="32" height="32" src="icons/Scene.svg" />
                    <span>Load background</span>
                </div>
            </Button>
            <Button color="light" class="!p-2 w-96" on:click={loadScene}>
                <div class="flex flex-row gap-2 items-center">
                    <img alt="scene" width="32" height="32" src="icons/Scene.svg" />
                    <span>Load full scene</span>
                </div>
            </Button>
            <Button color="light" class="!p-2 w-96" on:click={loadObject}>
                <div class="flex flex-row gap-2 items-center">
                    <img alt="scene" width="32" height="32" src="icons/Scene.svg" />
                    <span>Load object</span>
                </div>
            </Button>
        </div>
        <div class="flex-1 h-full">
            <ScenePreview
                id="scene_preview"
                robotModel={undefined}
                class="h-full w-full"
                map={mapFile}
            />
        </div>
    </div>
</Modal>
