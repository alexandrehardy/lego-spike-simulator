<script lang="ts">
    import { onMount } from 'svelte';
    import * as Blockly from 'blockly/core';
    import * as BlocklyBlocks from 'blockly/blocks';
    import * as En from 'blockly/msg/en';
    import '$lib/blockly/field_variable_getter';
    import '$lib/blockly/field-bitmap';
    import '$lib/blockly/field-grid-dropdown';
    import * as fieldAngle from '$lib/blockly/field_angle';
    import * as shareableProcedures from '@blockly/block-shareable-procedures';
    import {
        registerInputShadowExtension,
        applyInputShadowExtension
    } from '$lib/blockly/shadow_input';
    import * as colourPkg from '@blockly/field-colour';
    import { blocks } from '$lib/blockly/blocks';
    import { toolbox } from '$lib/blockly/toolbox';

    onMount(() => {
        fieldAngle.registerFieldAngle();
        colourPkg.registerFieldColour();
        shareableProcedures.unregisterProcedureBlocks();
        Blockly.common.defineBlocks(shareableProcedures.blocks);
        Blockly.setLocale(En);
        registerInputShadowExtension(Blockly);
        Blockly.defineBlocksWithJsonArray(blocks);
        // Also apply the shadow extension to any blocks that
        // don't declare they use it.
        applyInputShadowExtension(Blockly);
        Blockly.inject(document.getElementById('blocklyDiv'), {
            renderer: 'zelos',
            grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
            theme: 'zelos',
            toolbox: toolbox
        });
    });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<div>
    <div id="blocklyDiv" />
    <xml id="toolbox" style="display:none">
        <slot />
    </xml>
</div>

<style scoped>
    #blocklyDiv {
        height: 100%;
        width: 100%;
        position: absolute;
        bottom: 0;
        text-align: left;
    }
</style>
