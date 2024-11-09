import { type Sb3Project, type Sb3Block } from '$lib/scratch/sb3';
import { blocks as blockDefinitions } from '$lib/blockly/blocks';

import {
    type BlocklyState,
    type BlocklyStateBlock,
    type BlocklyStateVariable
} from '$lib/blockly/state';

export interface ConstBlock {
    scratchType: number;
    type: 'Number' | 'String' | 'Variable';
    numberValue?: number;
    stringValue?: string;
    varName?: string;
    varId?: string;
    x?: number;
    y?: number;
}

export interface BlocklyInterface {
    type: string;
    fields: string[];
    inputs: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getConst(array: any[]): ConstBlock {
    const type = array[0] as number;
    let numberValue: number | undefined;
    let stringValue: string | undefined;
    let varName: string | undefined;
    let varId: string | undefined;
    let x: number | undefined;
    let y: number | undefined;
    let blockType: 'Number' | 'String' | 'Variable' = 'String';
    switch (type) {
        case 4:
            // number
            numberValue = array[1];
            blockType = 'Number';
            break;
        case 5:
            // positive number
            numberValue = array[1];
            blockType = 'Number';
            break;
        case 6:
            // positive integer
            numberValue = array[1];
            blockType = 'Number';
            break;
        case 7:
            // integer
            numberValue = array[1];
            blockType = 'Number';
            break;
        case 8:
            // angle
            numberValue = array[1];
            blockType = 'Number';
            break;
        case 9:
            // colour
            stringValue = array[1];
            blockType = 'String';
            break;
        case 10:
            // string
            stringValue = array[1];
            blockType = 'String';
            break;
        case 11:
            // broadcast
            varName = array[1];
            varId = array[2];
            blockType = 'Variable';
            break;
        case 12:
            // variable
            varName = array[1];
            varId = array[2];
            x = array[3];
            y = array[4];
            blockType = 'Variable';
            break;
        case 13:
            // list
            varName = array[1];
            varId = array[2];
            x = array[3];
            y = array[4];
            blockType = 'Variable';
            break;
    }
    return {
        scratchType: type,
        type: blockType,
        numberValue: numberValue,
        stringValue: stringValue,
        varName: varName,
        varId: varId,
        x: x,
        y: y
    };
}

export function convertToBlockly(project: Sb3Project): BlocklyState | undefined {
    const allBlocks = new Map<string, Sb3Block>();
    const variables: BlocklyStateVariable[] = [];
    const blocks: BlocklyStateBlock[] = [];
    const definitions = new Map<string, BlocklyInterface>();

    if (!project.targets) {
        return undefined;
    }

    for (const block of blockDefinitions) {
        const b: BlocklyInterface = { type: block.type, fields: [], inputs: [] };
        for (const key of Object.keys(block)) {
            if (key.startsWith('args')) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const arglist = (block as Record<string, any>)[key];
                if (arglist) {
                    for (const arg of arglist) {
                        const type = arg.type;
                        const name = arg.name;
                        if (!name || !type) {
                            continue;
                        }
                        if (type.startsWith('input_')) {
                            b.inputs.push(name);
                        } else if (type.startsWith('field_')) {
                            b.fields.push(name);
                        }
                    }
                }
            }
        }
        definitions.set(block.type, b);
    }

    for (const target of project.targets) {
        if (target.variables) {
            for (const key of Object.keys(target.variables)) {
                const variable = target.variables[key];
                const id = key;
                const varName = variable[0];
                // TODO: Figure out what to do with value
                const varValue = variable[1];
                let type = 'String';
                if (typeof varValue === 'number') {
                    type = 'Number';
                } else if (typeof varValue === 'boolean') {
                    type = 'Boolean';
                } else if (Array.isArray(varValue)) {
                    type = 'list';
                }
                variables.push({ id: id, name: varName, type: type });
            }
        }

        if (!target.blocks) {
            continue;
        }
        for (const key of Object.keys(target.blocks)) {
            const block = target.blocks[key];
            if (block.opcode) {
                allBlocks.set(key, block);
            } else {
                // Must be an array.
                if (Array.isArray(block)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const array = block as any as any[];
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const value = getConst(array);
                    // TODO: We will figure out what to do with this later.
                }
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function addField(block: BlocklyStateBlock, key: string, field: any[]) {
        const value = field[0];
        const id = field[1];
        if (id === undefined) {
            block.fields[key] = value;
        } else if (id === null) {
            block.fields[key] = value;
        } else if (typeof id === 'string') {
            block.fields[key] = { id: id };
        } else if (Array.isArray(id)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const value = getConst(id as any[]);
            if (value.type === 'Number') {
                block.fields[key] = value.numberValue;
            } else if (value.type === 'String') {
                block.fields[key] = value.stringValue;
            } else if (value.type === 'Variable') {
                block.fields[key] = { id: value.varId };
            }
        } else {
            console.log(field);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function addInput(block: BlocklyStateBlock, key: string, input: any[]) {
        const value = input[0];
        const id = input[1];
        if (id === 'undefined') {
            if (typeof value === 'number') {
                block.inputs[key] = {
                    shadow: { type: 'math_number', fields: { NUM: value } }
                };
            } else if (typeof value === 'string') {
                block.inputs[key] = {
                    shadow: { type: 'text', fields: { TEXT: value } }
                };
            }
        } else if (id === 'null') {
            if (typeof value === 'number') {
                block.inputs[key] = {
                    shadow: { type: 'math_number', fields: { NUM: value } }
                };
            } else if (typeof value === 'string') {
                block.inputs[key] = {
                    shadow: { type: 'text', fields: { TEXT: value } }
                };
            }
        } else if (typeof id === 'string') {
            // refers to a shadow, or a block
            const ref = allBlocks.get(id);
            if (ref) {
                const refBlock = buildBlock(id, ref);
                if (ref.shadow) {
                    block.inputs[key] = { shadow: refBlock };
                } else {
                    block.inputs[key] = { block: refBlock };
                }
            }
        } else if (Array.isArray(id)) {
            const value = getConst(id);
            if (value.type === 'Number') {
                block.inputs[key] = {
                    shadow: { type: 'math_number', fields: { NUM: value.numberValue } }
                };
            } else if (value.type === 'String') {
                block.inputs[key] = {
                    shadow: { type: 'text', fields: { TEXT: value.stringValue } }
                };
            } else if (value.type === 'Variable') {
                block.inputs[key] = {
                    block: {
                        type: 'data_variable',
                        fields: {
                            VARIABLE: { id: value.varId }
                        }
                    }
                };
            }
        } else {
            console.log(input);
        }
    }

    function buildBlock(id: string, scratchBlock: Sb3Block): BlocklyStateBlock {
        const block: BlocklyStateBlock = {
            id: id,
            type: scratchBlock.opcode,
            fields: {},
            inputs: {}
        };
        const definition = definitions.get(block.type);
        if (scratchBlock.fields) {
            for (const key of Object.keys(scratchBlock.fields)) {
                const field = scratchBlock.fields[key];
                if (definition) {
                    if (definition.fields.indexOf(key) < 0) {
                        console.log(`BLOCK: ${block.type}, ${key} is not a field`);
                    }
                }
                addField(block, key, field);
            }
        }
        if (scratchBlock.inputs) {
            for (const key of Object.keys(scratchBlock.inputs)) {
                const input = scratchBlock.inputs[key];
                addInput(block, key, input);
                if (definition) {
                    if (definition.inputs.indexOf(key) < 0) {
                        console.log(`BLOCK: ${block.type}, ${key} is not an INPUT`);
                    }
                }
                addInput(block, key, input);
            }
        }
        if (scratchBlock.x) {
            block.x = scratchBlock.x;
        }
        if (scratchBlock.y) {
            block.y = scratchBlock.y;
        }
        if (scratchBlock.next) {
            const nextId = scratchBlock.next;
            const nextBlock = allBlocks.get(nextId);
            if (nextBlock) {
                block.next = { block: buildBlock(nextId, nextBlock) };
            }
        }
        return block;
    }

    const iter = allBlocks.keys();
    let value = iter.next();
    while (!value.done) {
        const scratchBlockId = value.value;
        const scratchBlock = allBlocks.get(scratchBlockId);
        if (scratchBlock && scratchBlock.topLevel) {
            const block = buildBlock(scratchBlockId, scratchBlock);
            blocks.push(block);
        }
        value = iter.next();
    }

    const state = { variables: variables, blocks: { languageVersion: 0, blocks: blocks } };
    console.log(state);
    return state;
}
