import * as Blockly from 'blockly/core';
import { getProcedureById, setupProtototypeBlock } from '$lib/blockly/procedure_flyout';

export function registerProcedureCallExtension(blockly: typeof Blockly) {
    if (blockly.Extensions.isRegistered('procedures_call_mutator')) {
        blockly.Extensions.unregister('procedures_call_mutator');
    }
    blockly.Extensions.register('procedures_call_mutator', function (this: Blockly.Block) {
        // this refers to the block that the extension is being run on
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const thisBlock = this;
        if (thisBlock.type !== 'procedures_call') {
            return;
        }
        Object.assign(thisBlock, {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            loadExtraState: function (this: Blockly.Block, state: any) {
                Object.assign(this, { procedureDefinition: state });
                const definition = state;
                let lastInput = this.appendDummyInput();
                lastInput.appendField(new Blockly.FieldLabel(definition.name), 'NAME');
                for (let i = 0; i < definition.parameters.length; i++) {
                    lastInput = thisBlock.appendValueInput(definition.parameters[i].id);
                    lastInput.setCheck(definition.parameters[i].type);
                }
                if (definition.label) {
                    lastInput = this.appendDummyInput();
                    lastInput.appendField(new Blockly.FieldLabel(definition.label), 'LABEL');
                }
                Blockly.Extensions.apply('shadow_input', this, false);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
            saveExtraState: function (this: Blockly.Block, doFullSerialization: boolean): any {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (this as any).procedureDefinition;
            }
        });
    });

    if (blockly.Extensions.isRegistered('procedures_prototype_mutator')) {
        blockly.Extensions.unregister('procedures_prototype_mutator');
    }
    blockly.Extensions.register('procedures_prototype_mutator', function (this: Blockly.Block) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const thisBlock = this;
        if (thisBlock.type !== 'procedures_prototype') {
            return;
        }
        Object.assign(thisBlock, {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            loadExtraState: function (this: Blockly.Block, state: any) {
                setupProtototypeBlock(this, state);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
            saveExtraState: function (this: Blockly.Block, doFullSerialization: boolean): any {
                const procedureId = this.data;
                if (!procedureId) {
                    return null;
                }
                const proc = getProcedureById(procedureId);
                if (proc) {
                    return proc.definition;
                }
                return null;
            }
        });
    });
}
