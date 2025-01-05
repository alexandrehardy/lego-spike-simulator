<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { Modal } from 'flowbite-svelte';
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
    let mapWidth = 0;
    let mapHeight = 0;
    let select: string | undefined = undefined;
    let selectedText: string | undefined;
    let selectedObject: SceneObject | undefined;

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
                selectedText = 'Mat';
                selectedObject = undefined;
            } else if (name == '#robot') {
                selectedText = 'Spike robot';
                selectedObject = $sceneStore.robot;
            } else {
                selectedText = undefined;
                selectedObject = undefined;
            }
        } else {
            selectedText = `Object: ${name}`;
            selectedObject = $sceneStore.objects.find((x) => x.name === name);
        }
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
                action: () => {},
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
        accept=".zip"
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
            <div class="flex-1 h-full">
                {#if selectedText}
                    <div class="absolute right-0 top-0 text-white mx-2 my-1">{selectedText}</div>
                {/if}
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
                    <img alt="Rotate clockwise" width="32" height="32" src="icons/FieldCw.svg" />
                </button>
                <ScenePreview
                    <ScenePreview
                    id="scene_preview"
                    scene={$sceneStore}
                    class="h-full w-full"
                    map={mapFile}
                    {rotate}
                    {camera}
                    {tilt}
                    {select}
                    bind:mapWidth
                    bind:mapHeight
                />
            </div>
        </div>
    </div>
</Modal>
