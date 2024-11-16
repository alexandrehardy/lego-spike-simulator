import * as Blockly from 'blockly/core';
import { blocks as blockDefinitions } from '$lib/blockly/blocks';

export interface State {
    type: string;
    id?: string;
    x?: number;
    y?: number;
    collapsed?: boolean;
    deletable?: boolean;
    movable?: boolean;
    editable?: boolean;
    enabled?: boolean;
    disabledReasons?: string[];
    inline?: boolean;
    data?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraState?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icons?: { [key: string]: any };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields?: { [key: string]: any };
}

export interface NamedField {
    name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blockMap = new Map<string, any>();
for (const definition of blockDefinitions) {
    blockMap.set(definition.type, definition);
}

export function registerInputShadowExtension(blockly: typeof Blockly) {
    if (blockly.Extensions.isRegistered('shadow_input')) {
        blockly.Extensions.unregister('shadow_input');
    }
    blockly.Extensions.register('shadow_input', function (this: Blockly.Block) {
        // this refers to the block that the extension is being run on
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const thisBlock = this;
        if (!thisBlock.inputList) {
            return;
        }
        const blockDefinition = blockMap.get(thisBlock.type);
        thisBlock.inputList.forEach((input: Blockly.Input) => {
            if (input.type === Blockly.inputs.inputTypes.VALUE) {
                if (input.connection) {
                    let shadow: Blockly.serialization.blocks.State | undefined;
                    const checks = input.connection.getCheck();
                    let createShadow = false;
                    let isString = false;
                    if (blockDefinition) {
                        let n = 0;
                        while (blockDefinition[`args${n}`]) {
                            const arglist = blockDefinition[`args${n}`];
                            if (arglist) {
                                const def = arglist.find((x: NamedField) => x.name == input.name);
                                if (def) {
                                    if (def.shadow) {
                                        shadow = def.shadow as Blockly.serialization.blocks.State;
                                        createShadow = true;
                                        break;
                                    }
                                }
                            }
                            n++;
                        }
                    }
                    if (!shadow) {
                        if (checks) {
                            if (checks.indexOf('Number') >= 0) {
                                createShadow = true;
                            } else if (checks.indexOf('String') >= 0) {
                                createShadow = true;
                                isString = true;
                            }
                        } else {
                            createShadow = true;
                        }
                    }
                    if (createShadow) {
                        if (!shadow) {
                            if (isString) {
                                shadow = { type: 'text', fields: { TEXT: 'Hello' } };
                            } else {
                                shadow = { type: 'math_number', fields: { NUM: 1 } };
                            }
                        }
                        input.connection.setShadowState(shadow);
                    }
                }
            }
        });
    });
}

export function applyInputShadowExtension(blockly: typeof Blockly) {
    for (const key in blockly.Blocks) {
        blockly.Extensions.apply('shadow_input', blockly.Blocks[key], false);
    }
}
