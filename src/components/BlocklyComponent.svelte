<script lang="ts">
    import { onMount } from 'svelte';
    import * as Blockly from 'blockly/core';
    import * as En from 'blockly/msg/en';
    import '$lib/blockly/field-bitmap';
    import '@blockly/field-grid-dropdown';
    import * as fieldAngle from '@blockly/field-angle';
    import * as shareableProcedures from '@blockly/block-shareable-procedures';
    import { blocks } from '$lib/blockly/blocks';
    import { toolbox } from '$lib/blockly/toolbox';

    onMount(() => {
        fieldAngle.registerFieldAngle();
        shareableProcedures.unregisterProcedureBlocks();
        Blockly.common.defineBlocks(shareableProcedures.blocks);
        Blockly.fieldRegistry.register('field_variable_getter', Blockly.FieldVariable);
        Blockly.setLocale(En);
        Blockly.defineBlocksWithJsonArray(blocks);
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
