<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import AudioDialog from '$components/AudioDialog.svelte';
    import VariableDialog from '$components/VariableDialog.svelte';
    import ProcedureDialog from '$components/ProcedureDialog.svelte';
    import SpikeSimulatorWindow from '$components/SpikeSimulatorWindow.svelte';
    import * as Blockly from 'blockly/core';
    // Import the list of blocks so it gets loaded into blockly
    import 'blockly/blocks';
    import * as En from 'blockly/msg/en';
    import '$lib/blockly/render';
    import '$lib/blockly/theme';
    import '$lib/blockly/field_variable_getter';
    import '$lib/blockly/field-bitmap';
    import '$lib/blockly/field-grid-dropdown';
    import '$lib/blockly/field-ultra-sound';
    import '$lib/blockly/field-sound';
    import '$lib/blockly/field_metadata';
    import { procedureBlocks } from '$lib/blockly/procedure_blocks';
    import * as procedureFlyout from '$lib/blockly/procedure_flyout';
    import * as variableFlyout from '$lib/blockly/variable_flyout';
    import * as fieldAngle from '$lib/blockly/field_angle';
    import {
        registerInputShadowExtension,
        applyInputShadowExtension
    } from '$lib/blockly/shadow_input';
    import { registerProcedureCallExtension } from '$lib/blockly/procedure_call_extension';
    import * as colourPkg from '@blockly/field-colour';
    import { ZoomToFitControl } from '@blockly/zoom-to-fit';
    import { blocks } from '$lib/blockly/blocks';
    import { toolbox } from '$lib/blockly/toolbox';
    import { type BlocklyState } from '$lib/blockly/state';
    import { Button, CloseButton } from 'flowbite-svelte';
    import { loadScratchSb3 } from '$lib/scratch/sb3';
    import { createManifest } from '$lib/scratch/manifest';
    import { convertToBlockly, convertToScratch } from '$lib/scratch/blockly';
    import { cat, clearSelectedAudio, selectAudio, registerAudioDialog } from '$lib/blockly/audio';
    import JSZip from 'jszip';
    import FileSaver from 'file-saver';

    let workspace: Blockly.WorkspaceSvg | undefined;
    let zoomToFit: ZoomToFitControl | undefined;
    let numberOfLoads = 0;
    let variableType = '';
    let audioDialogOpen = false;
    let variableDialogOpen = false;
    let variableCreateCallback: variableFlyout.VariableCreateCallback | undefined = undefined;
    let procedureDialogOpen = false;
    let procedureCreateCallback: procedureFlyout.ProcedureCreateCallback | undefined = undefined;
    let simulatorOpen = false;
    let blocklyOpen = true;
    let split = 2;
    let observer = new ResizeObserver(onBlocklyResize);

    function createAudioDialog() {
        audioDialogOpen = true;
    }

    function createProcedureDialog(callback: procedureFlyout.ProcedureCreateCallback) {
        procedureCreateCallback = callback;
        procedureDialogOpen = true;
    }

    function createVariableDialog(type: string, callback: variableFlyout.VariableCreateCallback) {
        variableCreateCallback = callback;
        variableType = type;
        variableDialogOpen = true;
    }

    onMount(() => {
        fieldAngle.registerFieldAngle();
        colourPkg.registerFieldColour();
        Blockly.common.defineBlocksWithJsonArray(procedureBlocks);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Blockly.setLocale(En as any as Record<string, string>);
        registerInputShadowExtension(Blockly);
        registerProcedureCallExtension(Blockly);
        Blockly.defineBlocksWithJsonArray(blocks);
        // Also apply the shadow extension to any blocks that
        // don't declare they use it.
        applyInputShadowExtension(Blockly);
        // Only include procedure defintion, like spike does
        const element = document.getElementById('blocklyDiv');
        if (element == null) {
            return;
        }
        Blockly.ContextMenuItems.registerCommentOptions();
        workspace = Blockly.inject(element, {
            renderer: 'spike_renderer',
            grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
            theme: 'spike',
            media: 'blockly/media/',
            comments: true,
            zoom: {
                controls: true,
                wheel: false,
                startScale: 0.675,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2,
                pinch: true
            },
            toolbox: toolbox
        });
        variableFlyout.registerVariableFlyout(workspace, createVariableDialog);
        procedureFlyout.registerProcedureFlyout(workspace, createProcedureDialog);
        registerAudioDialog(workspace, createAudioDialog);
        selectAudio('Cat Meow 1');
        const zoomToFit = new ZoomToFitControl(workspace);
        zoomToFit.init();
        observer.observe(element);
    });

    onDestroy(() => {
        if (zoomToFit) {
            zoomToFit.dispose();
        }
        observer.disconnect();
    });

    function onBlocklyResize() {
        if (!workspace) {
            return;
        }
        Blockly.svgResize(workspace);
    }

    async function loadLlsp3(f: File) {
        const zip = new JSZip();
        const zipFile = await zip.loadAsync(f);
        const file = zipFile.file('scratch.sb3');
        if (!file) {
            console.log('Missing scratch.sb3');
            return;
        }
        const content = await file.async('arraybuffer');
        const project = await loadScratchSb3(content);
        if (project) {
            const state = convertToBlockly(project);
            if (state) {
                clearSelectedAudio();
                selectAudio('Cat Meow 1');
                for (const target of project.targets) {
                    for (const sound of target.sounds) {
                        selectAudio(sound.name);
                    }
                }
                selectAudio('Cat Meow 1');
                if (workspace) {
                    Blockly.serialization.workspaces.load(state, workspace);
                    try {
                        const manifestFile = zipFile.file('manifest.json');
                        if (manifestFile) {
                            const manifest = JSON.parse(await manifestFile.async('string'));
                            if (manifest.zoomLevel) {
                                workspace.setScale(manifest.zoomLevel);
                            }
                            if (manifest.workspaceX && manifest.workspaceY) {
                                workspace.scroll(manifest.workspaceX, manifest.workspaceY);
                            }
                        }
                    } catch {
                        // ignore failures
                    }
                }
            } else {
                // TODO: Display an error
                console.log('Failed to convert project');
            }
        } else {
            // TODO: Display an error
            console.log('Failed to load project');
        }
    }

    function loadState() {
        const element = document.getElementById('load_project');
        if (element) {
            const fileElement = element as HTMLInputElement;
            if (fileElement.files) {
                if (fileElement.files.length > 0) {
                    const first = fileElement.files[0];
                    numberOfLoads++;
                    loadLlsp3(first);
                }
            }
        }
    }

    function askForFile() {
        const element = document.getElementById('load_project');
        if (element) {
            element.click();
        }
    }

    async function saveState() {
        if (workspace) {
            let robotSvg = `<svg xmlns="http://www.w3.org/2000/svg" 
                                 id="mdi-robot-outline"
                                 viewBox="0 0 24 24">
                            <path d="M17.5 15.5C17.5 16.61 16.61 17.5 
                                    15.5 17.5S13.5 16.61 13.5 15.5 14.4 
                                    13.5 15.5 13.5 17.5 14.4 17.5 
                                    15.5M8.5 13.5C7.4 13.5 6.5 14.4 6.5 
                                    15.5S7.4 17.5 8.5 17.5 10.5 16.61 
                                    10.5 15.5 9.61 13.5 8.5 13.5M23 
                                    15V18C23 18.55 22.55 19 22 19H21V20C21 
                                    21.11 20.11 22 19 22H5C3.9 22 3 21.11 
                                    3 20V19H2C1.45 19 1 18.55 1 18V15C1 14.45 
                                    1.45 14 2 14H3C3 10.13 6.13 7 10 
                                    7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 
                                    10.9 2 12 2S14 2.9 14 4C14 4.74 13.6 
                                    5.39 13 5.73V7H14C17.87 7 21 10.13 21 
                                    14H22C22.55 14 23 14.45 23 15M21 
                                    16H19V14C19 11.24 16.76 9 14 9H10C7.24
                                    9 5 11.24 5 14V16H3V17H5V20H19V17H21V16Z"/>
                             </svg>`;

            const state = Blockly.serialization.workspaces.save(workspace);
            const sb3 = convertToScratch(state as BlocklyState);
            const zip = new JSZip();
            zip.file('project.json', JSON.stringify(sb3));
            zip.file('deadc057000000000000000000000000.svg', '');
            zip.file('1b8b032b06360a6cf7c31d86bddd144b.wav', cat, { base64: true });
            const sb3content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
            const llsp3Zip = new JSZip();
            llsp3Zip.file(
                'manifest.json',
                JSON.stringify(createManifest(workspace, sb3.extensions))
            );
            llsp3Zip.file('scratch.sb3', sb3content);
            llsp3Zip.file('icon.svg', robotSvg);
            const content = await llsp3Zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
            FileSaver.saveAs(content, 'project.llsp3');
            // TODO: Save audio as well, we don't add new audio
        }
    }

    function toggleRobot() {
        simulatorOpen = !simulatorOpen;
    }

    function toggleSize() {
        split = 2 - split + 1;
    }

    function resizeWorkspace(open: boolean) {
        if (!open && !blocklyOpen) {
            blocklyOpen = true;
        }
        setTimeout(() => {
            if (workspace) {
                Blockly.svgResize(workspace);
            }
        }, 50);
    }

    function closeWindow() {
        blocklyOpen = false;
    }

    $: resizeWorkspace(simulatorOpen);
</script>

{#key numberOfLoads}
    <input type="file" id="load_project" class="hidden" accept=".llsp3" on:change={loadState} />
{/key}
<AudioDialog bind:modalOpen={audioDialogOpen} />
<VariableDialog
    bind:modalOpen={variableDialogOpen}
    bind:callback={variableCreateCallback}
    bind:type={variableType}
/>
<ProcedureDialog bind:modalOpen={procedureDialogOpen} bind:callback={procedureCreateCallback} />
<div class="relative h-full w-full overflow-hidden flex flex-row">
    <div class="relative {blocklyOpen ? 'flex-1' : 'w-0'} h-full flex flex-col overflow-hidden">
        <div class="flex flex-row bg-gray-100 gap-2 p-2 items-center border-r border-r-gray-300">
            <img alt="code" width="32" height="32" src="icons/BlocklyIcon.svg" />
            <Button color="light" class="!p-2" on:click={askForFile}>
                <img alt="open" width="32" height="32" src="icons/FolderMedium.svg" />
            </Button>
            <Button color="light" class="!p-2" on:click={saveState}>
                <img alt="save" width="32" height="32" src="icons/SaveMedium.svg" />
            </Button>
            <Button color="light" class="!p-2" on:click={toggleRobot}>
                <img alt="play" width="32" height="32" src="icons/Brick.svg" />
            </Button>
            {#if simulatorOpen}
                <Button color="light" class="!p-2" on:click={toggleSize}>
                    <div class="w-8 h-8 flex flex-row justify-center items-center text-base">
                        1:{split == 1 ? 2 : 1}
                    </div>
                </Button>
            {/if}
            {#if !simulatorOpen}
                <div class="flex-1" />
                <a href="https://developers.google.com/blockly" target="_blank">
                    <img class="w-32" src="icons/blockly.svg" alt="blockly" />
                </a>
            {:else}
                <CloseButton on:click={closeWindow} />
            {/if}
        </div>
        <div class="flex-1 w-full overflow-hidden">
            <div id="blocklyDiv" />
        </div>
    </div>
    <SpikeSimulatorWindow bind:modalOpen={simulatorOpen} bind:blocklyOpen {workspace} {split} />
</div>

<style scoped>
    #blocklyDiv {
        height: 100%;
        width: 100%;
    }
</style>
