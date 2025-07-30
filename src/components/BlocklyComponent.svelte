<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import AudioDialog from '$components/AudioDialog.svelte';
    import VariableDialog from '$components/VariableDialog.svelte';
    import ProcedureDialog from '$components/ProcedureDialog.svelte';
    import PrintDialog from '$components/PrintDialog.svelte';
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
    import { Button, CloseButton, Tooltip } from 'flowbite-svelte';
    import { loadScratchSb3 } from '$lib/scratch/sb3';
    import { createManifest } from '$lib/scratch/manifest';
    import { convertToBlockly, convertToScratch, mergeBlockly } from '$lib/scratch/blockly';
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
    let print = false;
    let printDialogOpen = false;
    let printColour = false;

    function sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

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
        workspace.createVariable('message1', 'broadcast');
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
                    // Clear the workspace to allow procedures to be destroyed
                    workspace.clear();
                    // Wait for workspace events to fire and complete
                    await sleep(100);
                    Blockly.serialization.workspaces.load(state, workspace);
                    const existing = Blockly.Variables.nameUsedWithAnyType('message1', workspace);
                    if (!existing) {
                        // No conflict
                        workspace.createVariable('message1', 'broadcast');
                    }
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

    async function mergeLlsp3(f: File) {
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
                for (const target of project.targets) {
                    for (const sound of target.sounds) {
                        selectAudio(sound.name);
                    }
                }
                if (workspace) {
                    const oldState = Blockly.serialization.workspaces.save(workspace);
                    const newState = mergeBlockly(oldState, state);
                    Blockly.serialization.workspaces.load(newState, workspace);
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

    function mergeState() {
        const element = document.getElementById('load_merge');
        if (element) {
            const fileElement = element as HTMLInputElement;
            if (fileElement.files) {
                if (fileElement.files.length > 0) {
                    const first = fileElement.files[0];
                    numberOfLoads++;
                    mergeLlsp3(first);
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

    function askForMerge() {
        const element = document.getElementById('load_merge');
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

    function togglePrintDialog() {
        printDialogOpen = !printDialogOpen;
    }

    function printCallback(colour: boolean) {
        printColour = colour;
        print = !print;
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

    function closePrint() {
        print = false;
    }

    async function setPrintMode(print: boolean) {
        if (workspace) {
            if (print) {
                const metrics = workspace.getMetricsManager().getContentMetrics(false);
                const blocks = document.getElementsByClassName('blocklyBlockCanvas');
                if (blocks.length > 0) {
                    document.getElementById('blockly-ui')!.classList.add('hidden');
                    const printSvg = document.getElementById('printSvg')!;
                    const clone = blocks[0].cloneNode(true) as Element;
                    printSvg.appendChild(clone);
                    printSvg.style.width = `${Math.ceil(metrics.width) + 100}px`;
                    printSvg.style.height = `${Math.ceil(metrics.height) + 100}px`;
                    clone.setAttribute(
                        'transform',
                        `translate(${-metrics.left} ${-metrics.top}) scale(${workspace.scale} ${workspace.scale})`
                    );
                }
                setTimeout(() => {
                    window.print();
                    const element = document.getElementById('print_close_button');
                    if (element) {
                        element.click();
                    }
                }, 500);
            } else {
                const printSvg = document.getElementById('printSvg')!;
                printSvg.innerHTML = '';
                document.getElementById('blockly-ui')!.classList.remove('hidden');
                printSvg.style.width = '0px';
                printSvg.style.height = '0px';
            }
        }
    }

    $: resizeWorkspace(simulatorOpen);
    $: setPrintMode(print);
</script>

{#key numberOfLoads}
    <input type="file" id="load_project" class="hidden" accept=".llsp3" on:change={loadState} />
    <input type="file" id="load_merge" class="hidden" accept=".llsp3" on:change={mergeState} />
{/key}
<AudioDialog bind:modalOpen={audioDialogOpen} />
<VariableDialog
    bind:modalOpen={variableDialogOpen}
    bind:callback={variableCreateCallback}
    bind:type={variableType}
/>
<ProcedureDialog bind:modalOpen={procedureDialogOpen} bind:callback={procedureCreateCallback} />
<PrintDialog bind:modalOpen={printDialogOpen} callback={printCallback} />

<div class="relative h-full w-full overflow-hidden flex flex-row">
    <!-- flex-col-reverse so that the buttons are higher in z order -->
    <div class="relative {blocklyOpen ? 'flex-1' : 'w-0'} h-full flex flex-col overflow-hidden">
        <div
            class="flex flex-row bg-gray-100 gap-2 p-2 items-center border-r border-r-gray-300 z-10"
        >
            <div class="w-8 h-8 flex flex-col justify-center items-center">
                <img alt="code" width="32" height="32" src="icons/BlocklyIcon.svg" />
            </div>
            <Button color="light" class="!p-2" on:click={askForFile}>
                <div class="w-8 h-8 flex flex-col justify-center items-center">
                    <img alt="open" width="32" height="32" src="icons/FolderMedium.svg" />
                </div>
            </Button>
            <Tooltip>Open a spike program</Tooltip>
            <Button color="light" class="!p-2" on:click={askForMerge}>
                <div class="w-8 h-8 flex flex-col justify-center items-center">
                    <img alt="merge" width="32" height="32" src="icons/FolderMerge.svg" />
                </div>
            </Button>
            <Tooltip>Merge in another spike program</Tooltip>
            <Button color="light" class="!p-2" on:click={saveState}>
                <div class="w-8 h-8 flex flex-col justify-center items-center">
                    <img alt="save" width="32" height="32" src="icons/SaveMedium.svg" />
                </div>
            </Button>
            <Tooltip>Save the spike program</Tooltip>
            <Button id="print_close_button" color="light" class="hidden" on:click={closePrint}>
                Close print
            </Button>
            {#if !simulatorOpen}
                <Button color="light" class="!p-2" on:click={togglePrintDialog}>
                    <div class="w-8 h-8 flex flex-col justify-center items-center">
                        <img alt="print" width="32" height="32" src="icons/Print.svg" />
                    </div>
                </Button>
                <Tooltip>Print the code</Tooltip>
            {/if}
            {#if simulatorOpen}
                <Button color="light" class="!p-2" on:click={toggleSize}>
                    <div class="w-8 h-8 flex flex-row justify-center items-center text-base">
                        1:{split == 1 ? 2 : 1}
                    </div>
                </Button>
                <Tooltip>Adjust the code panel width</Tooltip>
            {/if}
            <Button color="light" class="!p-2" on:click={toggleRobot}>
                <div class="w-8 h-8 flex flex-col justify-center items-center">
                    <img alt="simulator" width="32" height="32" src="icons/Brick.svg" />
                </div>
            </Button>
            <Tooltip>Open the robot simulator panel</Tooltip>
            {#if !simulatorOpen}
                <div class="flex-1" />
                <a href="https://developers.google.com/blockly" target="_blank">
                    <div class="w-24 h-8 flex flex-col justify-center items-center">
                        <img class="w-32" src="icons/blockly.svg" alt="blockly" />
                    </div>
                </a>
            {:else}
                <CloseButton on:click={closeWindow} />
                <Tooltip>Close the code panel without losing code</Tooltip>
            {/if}
        </div>
        <div class="flex-1 w-full overflow-hidden">
            <div id="blocklyDiv" />
        </div>
    </div>
    <SpikeSimulatorWindow bind:modalOpen={simulatorOpen} bind:blocklyOpen {workspace} {split} />
</div>

{#if !print || printColour}
    <style scoped>
        #blocklyDiv {
            height: 100%;
            width: 100%;
        }
        .print-renderer.spike-theme .blocklyText {
            fill: #000;
        }
        .print-renderer.spike-theme .blocklyFieldRect {
            fill: white !important;
            stroke: white !important;
        }
    </style>
{:else}
    <style>
        #blocklyDiv {
            height: 100%;
            width: 100%;
        }
        .blocklyPath {
            stroke-width: 1px !important;
            fill: white !important;
            stroke: black !important;
        }
        .blocklyText {
            fill: #000 !important;
        }
        rect.blocklyMainBackground {
            fill: white !important;
        }
        rect.blocklyBlockBackground {
            stroke: black !important;
            fill: white !important;
        }
        rect.blocklyFieldRect {
            fill: white !important;
            stroke: white !important;
        }
        rect.blocklyDropdownRect {
            stroke: white !important;
            fill: white !important;
        }
        .blocklyDropdownText {
            //stroke: black !important;
            fill: black !important;
        }
        .blocklyNonEditableText > text,
        .blocklyEditableText > text {
            //stroke: black !important;
            fill: black !important;
        }
        image {
            filter: grayscale(1);
        }

        .print-renderer.spike-theme .blocklyText,
        .print-renderer.spike-theme .blocklyFlyoutLabelText {
            font:
                bold 12pt 'Helvetica Neue',
                'Segoe UI',
                Helvetica,
                sans-serif;
        }
        .print-renderer.spike-theme .blocklyTextInputBubble textarea {
            font-weight: normal;
        }
        .print-renderer.spike-theme .blocklyText {
            fill: #fff;
        }
        .print-renderer.spike-theme .blocklyNonEditableText > rect:not(.blocklyDropdownRect),
        .print-renderer.spike-theme .blocklyEditableText > rect:not(.blocklyDropdownRect) {
            fill: #fff;
        }
        .print-renderer.spike-theme .blocklyNonEditableText > text,
        .print-renderer.spike-theme .blocklyEditableText > text,
        .print-renderer.spike-theme .blocklyNonEditableText > g > text,
        .print-renderer.spike-theme .blocklyEditableText > g > text {
            fill: #575e75;
        }
        .print-renderer.spike-theme .blocklyFlyoutLabelText {
            fill: #575e75;
        }
        .print-renderer.spike-theme .blocklyText.blocklyBubbleText {
            fill: #575e75;
        }
        .print-renderer.spike-theme
            .blocklyDraggable:not(.blocklyDisabled)
            .blocklyEditableText:not(.editing):hover
            > rect,
        .print-renderer.spike-theme
            .blocklyDraggable:not(.blocklyDisabled)
            .blocklyEditableText:not(.editing):hover
            > .blocklyPath {
            stroke: #fff;
            stroke-width: 2;
        }
        .print-renderer.spike-theme .blocklyHtmlInput {
            font-family: 'Helvetica Neue', 'Segoe UI', Helvetica, sans-serif;
            font-weight: bold;
            color: #575e75;
        }
        .print-renderer.spike-theme .blocklyDropdownText {
            fill: black !important;
        }
        .print-renderer.spike-theme.blocklyWidgetDiv .goog-menuitem,
        .print-renderer.spike-theme.blocklyDropDownDiv .goog-menuitem {
            font-family: 'Helvetica Neue', 'Segoe UI', Helvetica, sans-serif;
        }
        .print-renderer.spike-theme.blocklyDropDownDiv .goog-menuitem-content {
            color: #fff;
        }
        .print-renderer.spike-theme .blocklyHighlightedConnectionPath {
            stroke: #4eff4e;
        }
        .print-renderer.spike-theme .blocklyDisabled > .blocklyOutlinePath {
            fill: url(#blocklyDisabledPattern2909471669365986);
        }
        .print-renderer.spike-theme .blocklyInsertionMarker > .blocklyPath {
            fill-opacity: 0.2;
            stroke: none;
        }
    </style>
{/if}
