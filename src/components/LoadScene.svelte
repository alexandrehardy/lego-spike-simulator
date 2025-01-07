<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { Button, Input, Modal } from 'flowbite-svelte';
    import { type Model, loadModel, setStudioMode, componentStore } from '$lib/ldraw/components';
    import { sceneStore, type SceneStore, type SceneObject } from '$lib/spike/scene';
    import { EditOutline, TrashBinOutline } from 'flowbite-svelte-icons';
    import ScenePreview from '$components/ScenePreview.svelte';
    import Menu from '$components/Menu.svelte';
    import { type MenuAction, type MenuEntry } from '$components/Menu.svelte';
    import JSZip from 'jszip';

    export let modalOpen = false;
    let numberOfLoads = 0;
    let mapFile: Blob | undefined = $sceneStore.map;
    let camera: 'top' | 'left' | 'right' | 'front' | 'back' = 'front';
    let tilt = true;
    let rotate = false;
    let select: string | undefined = '#all';
    let selectedText: string | undefined;
    let selectedObject: SceneObject | undefined;
    let renameObject: SceneObject | undefined = undefined;
    let newName: string = '';
    let customSizeVisible = false;
    let customHeight = 1000;
    let customWidth = 1000;

    let menu = prepareMenu(rotate, tilt, camera, select, $sceneStore);
    $: menu = prepareMenu(rotate, tilt, camera, select, $sceneStore);
    $: setRobotModel($componentStore.robotModel);

    function toggleRotate() {
        rotate = !rotate;
    }

    function toggleTilt() {
        tilt = !tilt;
    }

    function setCamera(direction: 'top' | 'left' | 'right' | 'front' | 'back') {
        camera = direction;
    }

    function setRobotModel(robot: Model | undefined) {
        sceneStore.update((old) => {
            const newRobot = { ...old.robot, bricks: robot, compiled: undefined };
            return {
                ...old,
                robot: newRobot
            };
        });
    }

    function removeObject(name: string) {
        if (name === select) {
            select = undefined;
            selectedText = undefined;
            selectedObject = undefined;
        }
        sceneStore.update((old) => {
            const objects = old.objects.filter((x) => x.name !== name);
            return {
                ...old,
                objects: objects
            };
        });
    }

    function setSelected(name: string) {
        select = name;
        if (name.startsWith('#')) {
            if (name == '#map') {
                selectedText = `Mat (${$sceneStore.mapWidth}mm x ${$sceneStore.mapHeight}mm)`;
                selectedObject = undefined;
            } else if (name == '#robot') {
                selectedText = 'Spike robot';
                selectedObject = $sceneStore.robot;
            } else if (name == '#all') {
                selectedText = '';
                selectedObject = undefined;
            } else {
                selectedText = undefined;
                selectedObject = undefined;
            }
        } else {
            selectedText = `Object: ${name}`;
            selectedObject = $sceneStore.objects.find((x) => x.name === name);
        }
    }

    function updateSelectedText(scene: SceneStore) {
        if (select == '#map') {
            selectedText = `Mat (${scene.mapWidth}mm x ${scene.mapHeight}mm)`;
        }
    }

    function setFirstLegoLeagueMatSize() {
        sceneStore.update((old) => {
            return {
                ...old,
                mapWidth: 2360,
                mapHeight: 1140
            };
        });
    }

    function setWorldRoboticsOrganizationMatSize() {
        sceneStore.update((old) => {
            return {
                ...old,
                mapWidth: 2362,
                mapHeight: 1143
            };
        });
    }

    function setCustomMapSize() {
        customWidth = $sceneStore.mapWidth;
        customHeight = $sceneStore.mapHeight;
        renameObject = undefined;
        customSizeVisible = true;
    }

    function setRenameObject(obj: SceneObject) {
        customSizeVisible = false;
        renameObject = obj;
        newName = obj.name;
    }

    function hideRename() {
        renameObject = undefined;
    }

    function doRenameObject() {
        if (renameObject) {
            const oldName = renameObject.name;
            renameObject.name = newName;
            renameObject = undefined;
            menu = prepareMenu(rotate, tilt, camera, select, $sceneStore);
            if (select == oldName) {
                selectedText = `Object: ${newName}`;
            }
        }
    }

    function hideCustomSize() {
        customSizeVisible = false;
    }

    function setCustomSize() {
        customSizeVisible = false;
        customWidth = +customWidth;
        customHeight = +customHeight;
        if (customWidth < 200) {
            customWidth = 200;
        }
        if (customHeight < 200) {
            customHeight = 200;
        }
        sceneStore.update((old) => {
            return {
                ...old,
                mapWidth: +customWidth,
                mapHeight: +customHeight
            };
        });
    }

    function prepareMenu(
        rotate: boolean,
        tilt: boolean,
        camera: string,
        select: string | undefined,
        scene: SceneStore
    ) {
        let menu: MenuEntry[] = [];
        menu.push({
            name: 'Mat Size',
            actions: [
                { name: 'FLL (2360mm x 1140mm)', action: () => setFirstLegoLeagueMatSize() },
                {
                    name: 'WRO (2362mm x 1143mm)',
                    action: () => setWorldRoboticsOrganizationMatSize()
                },
                { name: 'Custom', action: () => setCustomMapSize() }
            ]
        });
        menu.push({
            name: 'Load',
            actions: [
                { name: 'Load mat', action: () => loadBackgroundMap() },
                { name: 'Load object', action: () => loadObject() },
                { name: 'Load full scene', action: () => loadScene() }
            ]
        });
        menu.push({
            name: 'Camera',
            actions: [
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
                },
                {
                    name: 'Tilt',
                    action: () => {
                        toggleTilt();
                    },
                    checkbox: tilt
                }
            ]
        });

        let selectMenu: MenuAction[] = [];
        if (scene.map) {
            selectMenu.push({
                name: 'All',
                action: () => {
                    setSelected('#all');
                },
                radio: select == '#all'
            });
            selectMenu.push({
                name: 'Mat',
                action: () => {
                    setSelected('#map');
                },
                radio: select == '#map'
            });
        }
        selectMenu.push({
            name: 'Robot',
            action: () => {
                setSelected('#robot');
            },
            radio: select == '#robot'
        });
        for (const obj of scene.objects) {
            selectMenu.push({
                name: obj.name,
                action: () => {
                    setSelected(obj.name);
                },
                radio: select == obj.name
            });
        }
        menu.push({
            name: 'Select',
            actions: selectMenu
        });

        let remove: MenuAction[] = [];
        for (const obj of scene.objects) {
            remove.push({
                name: obj.name,
                action: () => {
                    removeObject(obj.name);
                },
                icon: TrashBinOutline
            });
        }
        menu.push({
            name: 'Remove',
            actions: remove
        });

        let rename: MenuAction[] = [];
        for (const obj of scene.objects) {
            rename.push({
                name: obj.name,
                action: () => {
                    setRenameObject(obj);
                },
                icon: EditOutline
            });
        }
        menu.push({
            name: 'Rename',
            actions: rename
        });
        return menu;
    }

    function loadBackgroundMap() {
        const element = document.getElementById('load_map_image');
        if (element) {
            element.click();
        }
    }

    function loadScene() {
        const element = document.getElementById('load_scene_file');
        if (element) {
            element.click();
        }
    }

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
                    setSelected('#map');
                    numberOfLoads++;
                }
            }
        }
    }

    async function loadSceneFromFile() {
        const element = document.getElementById('load_scene_file');
        if (element) {
            const fileElement = element as HTMLInputElement;
            if (fileElement.files && fileElement.files.length > 0) {
                const first = fileElement.files[0];
                const zip = new JSZip();
                const zipFile = await zip.loadAsync(first);
                let map: Blob | undefined = undefined;
                const jsonFile = zipFile.file('scene.json');
                if (!jsonFile) {
                    console.log('Invalid scene file format, missing scene.json');
                    return;
                }
                const sceneDefContents = await jsonFile.async('string');
                const scene = JSON.parse(sceneDefContents);
                const objects: SceneObject[] = [];

                const mapFile = zipFile.file('mat.jpg');
                if (mapFile) {
                    map = await mapFile.async('blob');
                }

                const robot = {
                    anchored: scene.robot.anchored,
                    position: scene.robot.position,
                    rotation: scene.robot.rotation,
                    name: scene.robot.name,
                    bricks: $componentStore.robotModel
                };
                for (const obj of scene.objects) {
                    const objFile = zipFile.file(`bricks-${obj.name}`);
                    if (objFile) {
                        const content = await objFile.async('string');
                        const model = loadModel(obj.name, content);
                        objects.push({
                            anchored: obj.anchored,
                            position: obj.position,
                            rotation: obj.rotation,
                            name: obj.name,
                            bricks: model
                        });
                    } else {
                        objects.push({
                            anchored: obj.anchored,
                            position: obj.position,
                            rotation: obj.rotation,
                            name: obj.name
                        });
                    }
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                sceneStore.update((old) => {
                    return {
                        robot: robot,
                        objects: objects,
                        map: map,
                        mapWidth: scene.matWidth,
                        mapHeight: scene.matHeight
                    };
                });
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
                                                name: first.name
                                            }
                                        ])
                                    };
                                });
                                setSelected(first.name);
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
                                        name: first.name
                                    }
                                ])
                            };
                        });
                        setSelected(first.name);
                    }
                    numberOfLoads++;
                }
            }
        }
    }

    function moveObjectLeft() {
        if (!modalOpen) {
            return;
        }
        if (!selectedObject) {
            return;
        }
        if (selectedObject.position) {
            selectedObject.position.x -= 10.0;
        }
    }

    function moveObjectRight() {
        if (!modalOpen) {
            return;
        }
        if (!selectedObject) {
            return;
        }
        if (selectedObject.position) {
            selectedObject.position.x += 10.0;
        }
    }

    function moveObjectUp() {
        if (!modalOpen) {
            return;
        }
        if (!selectedObject) {
            return;
        }
        if (selectedObject.position) {
            selectedObject.position.z -= 10.0;
        }
    }

    function moveObjectDown() {
        if (!modalOpen) {
            return;
        }
        if (!selectedObject) {
            return;
        }
        if (selectedObject.position) {
            selectedObject.position.z += 10.0;
        }
    }

    function rotateObjectClockwise() {
        if (!modalOpen) {
            return;
        }
        if (!selectedObject) {
            return;
        }
        if (selectedObject.rotation === undefined) {
            selectedObject.rotation = 0.0;
        }
        selectedObject.rotation -= 10.0;
    }

    function rotateObjectAntiClockwise() {
        if (!modalOpen) {
            return;
        }
        if (!selectedObject) {
            return;
        }
        if (selectedObject.rotation === undefined) {
            selectedObject.rotation = 0.0;
        }
        selectedObject.rotation += 10.0;
    }

    function moveObjectWithKey(event: KeyboardEvent) {
        if (event.key === 'ArrowDown') {
            moveObjectDown();
        } else if (event.key === 'ArrowUp') {
            moveObjectUp();
        } else if (event.key === 'ArrowLeft') {
            moveObjectLeft();
        } else if (event.key === 'ArrowRight') {
            moveObjectRight();
        } else if (event.key === 'r') {
            rotateObjectClockwise();
        } else if (event.key === 'R') {
            rotateObjectAntiClockwise();
        }
    }

    onMount(() => {
        window.addEventListener('keyup', moveObjectWithKey);
    });

    onDestroy(() => {
        window.removeEventListener('keyup', moveObjectWithKey);
    });

    $: updateSelectedText($sceneStore);
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
    <input
        type="file"
        id="load_scene_file"
        class="hidden"
        accept=".spk"
        on:change={loadSceneFromFile}
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
            <div class="flex-1 h-full relative">
                {#if selectedText}
                    <div class="absolute right-0 top-0 text-white mx-2 my-1">{selectedText}</div>
                {/if}
                <div class="absolute left-0 top-0 h-full w-full" hidden={!renameObject}>
                    {#if renameObject}
                        <div class="flex flex-row justify-around items-center h-full">
                            <div class="bg-white rounded-xl p-3 flex flex-col shadow gap-2">
                                <h2>Rename object: {renameObject.name}</h2>
                                <hr />
                                <div class="flex flex-row w-96 gap-2 items-center">
                                    <span class="w-28">New name: </span><Input
                                        bind:value={newName}
                                    />
                                </div>
                                <div class="flex flex-row justify-center gap-2">
                                    <Button on:click={hideRename}>CANCEL</Button>
                                    <Button on:click={doRenameObject} color="green">OK</Button>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
                <div class="absolute left-0 top-0 h-full w-full" hidden={!customSizeVisible}>
                    <div class="flex flex-row justify-around items-center h-full">
                        <div class="bg-white rounded-xl p-3 flex flex-col shadow gap-2">
                            <h2>Custom Mat Size</h2>
                            <hr />
                            <div class="flex flex-row w-96 gap-2 items-center">
                                <span class="w-20">Width: </span><Input bind:value={customWidth} />
                            </div>
                            <div class="flex flex-row w-96 gap-2 items-center">
                                <span class="w-20">Height: </span><Input
                                    bind:value={customHeight}
                                />
                            </div>
                            <div class="flex flex-row justify-center gap-2">
                                <Button on:click={hideCustomSize}>CANCEL</Button>
                                <Button on:click={setCustomSize} color="green">OK</Button>
                            </div>
                        </div>
                    </div>
                </div>
                {#if select && select !== '#map' && select !== '#all'}
                    <button
                        class="absolute bottom-[70px] right-[60px] text-white"
                        on:click={moveObjectUp}
                    >
                        <img alt="Move up" width="32" height="32" src="icons/MoveUp.svg" />
                    </button>
                    <button
                        class="absolute bottom-[20px] right-[60px] text-white"
                        on:click={moveObjectDown}
                    >
                        <img alt="Move down" width="32" height="32" src="icons/MoveDown.svg" />
                    </button>
                    <button
                        class="absolute bottom-[45px] right-[90px] text-white"
                        on:click={moveObjectLeft}
                    >
                        <img alt="Move left" width="32" height="32" src="icons/MoveLeft.svg" />
                    </button>
                    <button
                        class="absolute bottom-[45px] right-[30px] text-white"
                        on:click={moveObjectRight}
                    >
                        <img alt="Move right" width="32" height="32" src="icons/MoveRight.svg" />
                    </button>
                    <button
                        class="absolute bottom-[65px] right-[130px] text-white"
                        on:click={rotateObjectAntiClockwise}
                    >
                        <img
                            alt="Rotate anti-clockwise"
                            width="32"
                            height="32"
                            src="icons/FieldAcw.svg"
                        />
                    </button>
                    <button
                        class="absolute bottom-[25px] right-[130px] text-white"
                        on:click={rotateObjectClockwise}
                    >
                        <img
                            alt="Rotate clockwise"
                            width="32"
                            height="32"
                            src="icons/FieldCw.svg"
                        />
                    </button>
                {/if}
                <ScenePreview
                    id="scene_preview"
                    scene={$sceneStore}
                    class="h-full w-full"
                    map={mapFile}
                    {rotate}
                    {camera}
                    {tilt}
                    {select}
                />
            </div>
        </div>
    </div>
</Modal>
