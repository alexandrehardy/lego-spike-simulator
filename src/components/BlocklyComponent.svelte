<script lang="ts">
    import { onMount } from 'svelte';
    import * as Blockly from 'blockly/core';
    // Import the list of blocks so it gets loaded into blockly
    import 'blockly/blocks';
    import * as En from 'blockly/msg/en';
    import '$lib/blockly/theme';
    import '$lib/blockly/field_variable_getter';
    import '$lib/blockly/field-bitmap';
    import '$lib/blockly/field-grid-dropdown';
    import * as variableFlyout from '$lib/blockly/variable_flyout';
    import * as fieldAngle from '$lib/blockly/field_angle';
    import * as shareableProcedures from '@blockly/block-shareable-procedures';
    import {
        registerInputShadowExtension,
        applyInputShadowExtension
    } from '$lib/blockly/shadow_input';
    import * as colourPkg from '@blockly/field-colour';
    import { blocks } from '$lib/blockly/blocks';
    import { toolbox } from '$lib/blockly/toolbox';
    import { Button } from 'flowbite-svelte';

    let workspace: Blockly.WorkspaceSvg | undefined;
    let numberOfLoads = 0;

    onMount(() => {
        fieldAngle.registerFieldAngle();
        colourPkg.registerFieldColour();
        shareableProcedures.unregisterProcedureBlocks();
        Blockly.common.defineBlocks(shareableProcedures.blocks);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Blockly.setLocale(En as any as Record<string, string>);
        registerInputShadowExtension(Blockly);
        Blockly.defineBlocksWithJsonArray(blocks);
        // Also apply the shadow extension to any blocks that
        // don't declare they use it.
        applyInputShadowExtension(Blockly);
        // Only include procedure defintion, like spike does
        delete Blockly.Blocks['procedures_callreturn'];
        delete Blockly.Blocks['procedures_ifreturn'];
        delete Blockly.Blocks['procedures_defreturn'];
        const element = document.getElementById('blocklyDiv');
        if (element == null) {
            return;
        }
        workspace = Blockly.inject(element, {
            renderer: 'zelos',
            grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
            theme: 'spike',
            toolbox: toolbox
        });
        variableFlyout.registerVariableFlyout(workspace);
    });

    function loadState() {
        const element = document.getElementById('load_project');
        if (element) {
            const fileElement = element as HTMLInputElement;
            if (fileElement.files) {
                if (fileElement.files.length > 0) {
                    const first = fileElement.files[0];
                    console.log(first);
                    numberOfLoads++;
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

    function saveState() {
        if (workspace) {
            const state = Blockly.serialization.workspaces.save(workspace);
            console.log(state);
        }
    }

    function runRobot() {}
</script>

{#key numberOfLoads}
    <input type="file" id="load_project" class="hidden" accept=".llsp3" on:change={loadState} />
{/key}
<div class="relative w-full h-full flex flex-col overflow-hidden">
    <div class="flex flex-row bg-gray-100 gap-2 p-2">
        <Button color="light" class="!p-2" on:click={askForFile}>
            <img alt="open" width="32" height="32" src="icons/FolderMedium.svg" />
        </Button>
        <Button color="light" class="!p-2" on:click={saveState}>
            <img alt="save" width="32" height="32" src="icons/SaveMedium.svg" />
        </Button>
        <Button color="light" class="!p-2" on:click={runRobot}>
            <img alt="play" width="32" height="32" src="icons/GenericPlayIcon.svg" />
        </Button>
    </div>
    <div class="flex-1 w-full overflow-hidden">
        <div id="blocklyDiv" />
        <xml id="toolbox" style="display:none">
            <slot />
        </xml>
    </div>
</div>

<style scoped>
    #blocklyDiv {
        height: 100%;
        width: 100%;
    }
</style>
