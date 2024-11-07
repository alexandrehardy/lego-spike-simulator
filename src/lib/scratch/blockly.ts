import { type Sb3Project, type Sb3Block } from '$lib/scratch/sb3';
import {
    type BlocklyState,
    type BlocklyStateBlock,
    type BlocklyStateVariable
} from '$lib/blockly/state';

export function convertToBlockly(project: Sb3Project): BlocklyState | undefined {
    const allBlocks = new Map<string, Sb3Block>();
    const variables: BlocklyStateVariable[] = [];
    const blocks: BlocklyStateBlock[] = [];

    if (!project.targets) {
        return undefined;
    }

    for (const target of project.targets) {
        if (target.variables) {
            for (const key of Object.keys(target.variables)) {
                const variable = target.variables[key];
                const id = key;
                const varName = variable[0];
                // TODO: Figure out what to do with value
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const varValue = variable[1];
                variables.push({ id: id, name: varName });
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const array = block as any as any[];
                const type = array[0] as number;
                // TODO: We will figure out what to do with this later.
                let numberValue: number;
                let stringValue: string;
                let varName: string;
                let varId: string;
                let x: number;
                let y: number;
                switch (type) {
                    case 4:
                        // number
                        numberValue = array[1];
                        break;
                    case 5:
                        // positive number
                        numberValue = array[1];
                        break;
                    case 6:
                        // positive integer
                        numberValue = array[1];
                        break;
                    case 7:
                        // integer
                        numberValue = array[1];
                        break;
                    case 8:
                        // angle
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        numberValue = array[1];
                        break;
                    case 9:
                        // colour
                        stringValue = array[1];
                        break;
                    case 10:
                        // string
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        stringValue = array[1];
                        break;
                    case 11:
                        // broadcast
                        varName = array[1];
                        varId = array[2];
                        break;
                    case 12:
                        // variable
                        varName = array[1];
                        varId = array[2];
                        x = array[3];
                        y = array[4];
                        break;
                    case 13:
                        // list
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        varName = array[1];
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        varId = array[2];
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        x = array[3];
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        y = array[4];
                        break;
                }
            }
        }
    }

    function buildBlock(id: string, scratchBlock: Sb3Block): BlocklyStateBlock {
        const block: BlocklyStateBlock = {
            id: id,
            type: scratchBlock.opcode,
            fields: {},
            inputs: {}
        };
        if (scratchBlock.fields) {
            for (const key of Object.keys(scratchBlock.fields)) {
                const field = scratchBlock.fields[key];
                const value = field[0];
                const id = field[1];
                if (!id) {
                    block.fields[key] = value;
                } else if (value === 'variable') {
                    block.fields[key] = { id: id };
                } else {
                    console.log(field);
                }
            }
        }
        if (scratchBlock.inputs) {
            for (const key of Object.keys(scratchBlock.inputs)) {
                const input = scratchBlock.inputs[key];
                console.log(input);
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
