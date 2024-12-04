import {
    type Sb3Project,
    type Sb3Block,
    type Sb3Comment,
    type Sb3Stage,
    type Sb3Sprite
} from '$lib/scratch/sb3';
import { blocks as blockDefinitions } from '$lib/blockly/blocks';

import {
    type BlocklyState,
    type BlocklyStateBlock,
    type BlocklyStateComment,
    type BlocklyStateVariable
} from '$lib/blockly/state';

export interface ConstBlock {
    scratchType: number;
    type: 'Number' | 'String' | 'Variable' | 'VariableBroadcast' | 'VariableList';
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
export function decodeConst(array: any[]): ConstBlock {
    const type = array[0] as number;
    let numberValue: number | undefined;
    let stringValue: string | undefined;
    let varName: string | undefined;
    let varId: string | undefined;
    let x: number | undefined;
    let y: number | undefined;
    let blockType: 'Number' | 'String' | 'Variable' | 'VariableBroadcast' | 'VariableList' =
        'String';
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
            blockType = 'VariableBroadcast';
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
            blockType = 'VariableList';
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
    const comments: BlocklyStateComment[] = [];

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
        if (target.lists) {
            for (const key of Object.keys(target.lists)) {
                const variable = target.lists[key];
                const id = key;
                const varName = variable[0];
                // TODO: Figure out what to do with value
                // const varValue = variable[1];
                const type = 'list';
                variables.push({ id: id, name: varName, type: type });
            }
        }
        if (target.broadcasts) {
            for (const key of Object.keys(target.broadcasts)) {
                const variable = target.broadcasts[key];
                const id = key;
                const type = 'broadcast';
                variables.push({ id: id, name: variable, type: type });
            }
        }
        if (target.comments) {
            for (const key of Object.keys(target.comments)) {
                const comment = target.comments[key];
                const id = key;
                comments.push({
                    id: id,
                    x: comment.x,
                    y: comment.y,
                    width: comment.width,
                    height: comment.height,
                    text: comment.text,
                    collapsed: comment.minimized
                });
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
                    const value = decodeConst(array);
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
            const value = decodeConst(id as any[]);
            if (value.type === 'Number') {
                block.fields[key] = value.numberValue;
            } else if (value.type === 'String') {
                block.fields[key] = value.stringValue;
            } else if (value.type === 'Variable') {
                block.fields[key] = { id: value.varId };
            } else if (value.type === 'VariableList') {
                block.fields[key] = { id: value.varId };
            } else if (value.type === 'VariableBroadcast') {
                block.fields[key] = { id: value.varId };
            }
        } else {
            console.log('Unsupported field');
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
                if (ref.shadow && ref.opcode != 'procedures_prototype') {
                    block.inputs[key] = { shadow: refBlock };
                } else {
                    block.inputs[key] = { block: refBlock };
                }
            }
        } else if (Array.isArray(id)) {
            const value = decodeConst(id);
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
                        },
                        inputs: {}
                    }
                };
            } else if (value.type === 'VariableBroadcast') {
                block.inputs[key] = {
                    shadow: {
                        type: 'event_broadcast_menu',
                        fields: {
                            BROADCAST_OPTION: { id: value.varId }
                        }
                    }
                };
            } else if (value.type === 'VariableList') {
                block.inputs[key] = {
                    block: {
                        type: 'data_listcontents',
                        fields: {
                            LIST: { id: value.varId }
                        },
                        inputs: {}
                    }
                };
            }
        } else {
            console.log('Unsupported input');
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
        if (scratchBlock.mutation) {
            if (scratchBlock.opcode == 'procedures_prototype') {
                //const argumentDefaults = JSON.parse(scratchBlock.mutation.argumentdefaults);
                const argumentIds = JSON.parse(scratchBlock.mutation.argumentids!);
                const argumentNames = JSON.parse(scratchBlock.mutation.argumentnames!);
                const procCode = scratchBlock.mutation.proccode;
                const parts = procCode.split(' ');
                const name = parts.shift();
                const params = [];
                let label = '';
                while (parts.length > 0) {
                    const nextPart = parts.shift();
                    if (nextPart == '%s') {
                        //const default = argumentDefaults.shift();
                        const id = argumentIds.shift();
                        const argName = argumentNames.shift();
                        params.push({ id: id, name: argName, type: ['String', 'Number'] });
                    } else if (nextPart == '%b') {
                        //const default = argumentDefaults.shift();
                        const id = argumentIds.shift();
                        const argName = argumentNames.shift();
                        params.push({ id: id, name: argName, type: ['Boolean'] });
                    } else {
                        if (label.length > 0) {
                            label = label + ' ' + nextPart;
                        } else {
                            label = nextPart ?? '';
                        }
                    }
                }
                block.extraState = {
                    id: id,
                    name: name,
                    label: label.length > 0 ? label : undefined,
                    parameters: params
                };
            } else if (scratchBlock.opcode == 'procedures_call') {
                const argumentIds = JSON.parse(scratchBlock.mutation.argumentids);
                const procCode = scratchBlock.mutation.proccode;
                const parts = procCode.split(' ');
                const name = parts.shift();
                const params = [];
                let label = '';
                let count = 0;
                while (parts.length > 0) {
                    const nextPart = parts.shift();
                    if (nextPart == '%s') {
                        const id = argumentIds.shift();
                        const argName = 'p' + count.toString();
                        count++;
                        params.push({ id: id, name: argName, type: ['String', 'Number'] });
                    } else if (nextPart == '%b') {
                        const id = argumentIds.shift();
                        const argName = 'p' + count.toString();
                        count++;
                        params.push({ id: id, name: argName, type: ['Boolean'] });
                    } else {
                        if (label.length > 0) {
                            label = label + ' ' + nextPart;
                        } else {
                            label = nextPart ?? '';
                        }
                    }
                }
                block.extraState = {
                    id: id,
                    name: name,
                    label: label.length > 0 ? label : undefined,
                    parameters: params
                };
            }
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

    const state = {
        variables: variables,
        blocks: { languageVersion: 0, blocks: blocks },
        workspaceComments: comments
    };
    return state;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function encodeConst(value: any, variables: BlocklyStateVariable[]) {
    if (typeof value === 'number') {
        return [value, null];
    } else if (typeof value === 'string') {
        return [value, null];
    } else if (typeof value === 'boolean') {
        return [value, null];
    } else if (Array.isArray(value)) {
        return [value, null];
    } else {
        // A variable, we need to get the list of
        // variables to figure out if it is a
        // broadcast or normal variable
        const variable = variables.find((x) => value?.id === x?.id);
        if (variable) {
            if (variable.type === 'broadcast') {
                return [1, [11, variable.name, variable.id]];
            } else if (variable.type === 'list') {
                return [1, [13, variable.name, variable.id]];
            } else {
                return [1, [12, variable.name, variable.id]];
            }
        } else {
            console.log(`Variable not found in encoding: ${value?.id}`);
            return ['', null];
        }
    }
    return ['', null];
}

export function convertToScratch(state: BlocklyState): Sb3Project {
    const linearBlocks: Record<string, Sb3Block> = {};
    const comments: Record<string, Sb3Comment> = {};
    const extensions: string[] = [];

    if (state.workspaceComments) {
        for (const comment of state.workspaceComments) {
            comments[comment.id] = {
                blockId: undefined,
                x: comment.x,
                y: comment.y,
                width: comment.width,
                height: comment.height,
                minimized: comment.collapsed ?? false,
                text: comment.text
            };
        }
    }

    function recurseBlock(
        block: BlocklyStateBlock,
        topLevel: boolean,
        parent: BlocklyStateBlock | null,
        shadow: boolean
    ): Sb3Block {
        const sb3Block: Sb3Block = {
            opcode: block.type,
            next: block.next?.block?.id,
            parent: parent?.id,
            inputs: {},
            fields: {},
            shadow: shadow,
            topLevel: topLevel,
            x: block.x,
            y: block.y,
            mutation: undefined
        };
        if (block.fields) {
            for (const key of Object.keys(block.fields)) {
                const value = block.fields[key];
                sb3Block.fields[key] = encodeConst(value, state.variables ?? []);
            }
        }
        if (block.inputs) {
            for (const key of Object.keys(block.inputs)) {
                const value = block.inputs[key];
                if (value.block) {
                    recurseBlock(value.block, false, block, false);
                    sb3Block.inputs[key] = [1, value.block.id];
                } else if (value.shadow) {
                    const shadowId = value.shadow.id!;
                    const shadowBlock = recurseBlock(
                        {
                            id: shadowId,
                            type: value.shadow.type,
                            fields: value.shadow.fields,
                            inputs: {}
                        },
                        false,
                        block,
                        true
                    );
                    if (shadowBlock.opcode == 'math_number') {
                        sb3Block.inputs[key] = [1, [4, shadowBlock.fields.NUM[0].toString()]];
                        delete linearBlocks[shadowId];
                    } else if (shadowBlock.opcode == 'math_whole_number') {
                        sb3Block.inputs[key] = [1, [4, shadowBlock.fields.NUM[0].toString()]];
                        delete linearBlocks[shadowId];
                    } else if (shadowBlock.opcode == 'math_integer') {
                        sb3Block.inputs[key] = [1, [7, shadowBlock.fields.NUM[0].toString()]];
                        delete linearBlocks[shadowId];
                    } else if (shadowBlock.opcode == 'math_positive_number') {
                        sb3Block.inputs[key] = [1, [5, shadowBlock.fields.NUM[0].toString()]];
                        delete linearBlocks[shadowId];
                    } else if (shadowBlock.opcode == 'text') {
                        sb3Block.inputs[key] = [1, [10, shadowBlock.fields.TEXT[0]]];
                        delete linearBlocks[shadowId];
                    } else {
                        sb3Block.inputs[key] = [1, value.shadow.id];
                    }
                }
            }
        }
        if (block.next?.block) {
            recurseBlock(block.next.block, false, block, false);
        }
        if (block.type == 'procedures_prototype') {
            sb3Block.shadow = true;
            const proccodeParts = [block.extraState.name];
            const argumentids: string[] = [];
            const argumentdefaults: string[] = [];
            const argumentnames: string[] = [];
            for (const param of block.extraState.parameters) {
                if (param.type[0] == 'Boolean') {
                    proccodeParts.push('%b');
                    argumentdefaults.push('false');
                } else {
                    proccodeParts.push('%s');
                    argumentdefaults.push('');
                }
                argumentids.push(param.id);
                argumentnames.push(param.name);
            }
            if (block.extraState.label) {
                proccodeParts.push(block.extraState.label);
            }
            sb3Block.mutation = {
                tagName: 'mutation',
                children: [],
                proccode: proccodeParts.join(' '),
                argumentids: JSON.stringify(argumentids),
                argumentdefaults: JSON.stringify(argumentdefaults),
                argumentnames: JSON.stringify(argumentnames),
                warp: 'false'
            };
        } else if (block.type == 'procedures_call') {
            const proccodeParts = [block.extraState.name];
            const argumentids: string[] = [];
            for (const param of block.extraState.parameters) {
                if (param.type[0] == 'Boolean') {
                    proccodeParts.push('%b');
                } else {
                    proccodeParts.push('%s');
                }
                argumentids.push(param.id);
            }
            if (block.extraState.label) {
                proccodeParts.push(block.extraState.label);
            }
            sb3Block.mutation = {
                tagName: 'mutation',
                children: [],
                proccode: proccodeParts.join(' '),
                argumentids: JSON.stringify(argumentids),
                warp: 'false'
            };
        }
        linearBlocks[block.id!] = sb3Block;
        return sb3Block;
    }

    if (state.blocks) {
        for (const block of state.blocks.blocks) {
            recurseBlock(block, true, null, false);
        }
    }

    for (const key of Object.keys(linearBlocks)) {
        const sblock = linearBlocks[key];
        if (sblock.opcode.startsWith('flipper')) {
            const extension = sblock.opcode.split('_')[0];
            if (extensions.findIndex((x) => x === extension) < 0) {
                extensions.push(extension);
            }
        }
    }

    const project: Sb3Project = {
        meta: {
            // Don't put in the real agent. Spike says it only works on Chrome...
            agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
            semver: '3.0.0',
            vm: '0.2.0-prerelease.20200512204241'
        },
        monitors: [],
        extensions: extensions,
        targets: []
    };

    const broadcasts: Record<string, string> = {};
    (state.variables ?? [])
        .filter((v) => v.type === 'broadcast')
        .forEach((v) => {
            broadcasts[v.id] = v.name;
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lists: Record<string, any[]> = {};
    (state.variables ?? [])
        .filter((v) => v.type === 'list')
        .forEach((v) => {
            lists[v.id] = [v.name, []];
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variables: Record<string, any[]> = {};
    // TODO: We should choose a constant to set the type
    (state.variables ?? [])
        .filter((v) => v.type !== 'list' && v.type !== 'broadcast')
        .forEach((v) => {
            variables[v.id] = [v.name, 0];
        });
    const stage: Sb3Stage = {
        blocks: {},
        broadcasts: broadcasts,
        comments: {},
        costumes: [
            {
                assetId: 'deadc057000000000000000000000000',
                bitmapResolution: 1,
                dataFormat: 'svg',
                md5ext: 'deadc057000000000000000000000000.svg',
                name: 'backdrop1',
                rotationCenterX: 47,
                rotationCenterY: 55
            }
        ],
        currentCostume: 0,
        isStage: true,
        lists: {},
        name: 'Stage',
        sounds: [],
        tempo: 60,
        textToSpeechLanguage: null,
        variables: {},
        videoState: 'on',
        videoTransparency: 50,
        volume: 0
    };

    const program: Sb3Sprite = {
        blocks: linearBlocks,
        broadcasts: {},
        comments: comments,
        costumes: [
            {
                assetId: 'deadc057000000000000000000000000',
                bitmapResolution: 1,
                dataFormat: 'svg',
                md5ext: 'deadc057000000000000000000000000.svg',
                name: 'T7Tg7VPJio4kLVAkfc1U',
                rotationCenterX: 240,
                rotationCenterY: 180
            }
        ],
        currentCostume: 0,
        direction: 90,
        draggable: false,
        isStage: false,
        lists: lists,
        name: 'u4SmFFIrPo7OMzBF9aJQ',
        rotationStyle: 'all around',
        size: 100,
        sounds: [
            {
                assetId: '1b8b032b06360a6cf7c31d86bddd144b',
                dataFormat: 'wav',
                md5ext: '1b8b032b06360a6cf7c31d86bddd144b.wav',
                name: 'Cat Meow 1',
                rate: 44100,
                sampleCount: 55125
            }
        ],
        variables: variables,
        visible: true,
        volume: 100,
        x: 0,
        y: 0
    };
    project.targets.push(stage);
    project.targets.push(program);
    return project;
}
