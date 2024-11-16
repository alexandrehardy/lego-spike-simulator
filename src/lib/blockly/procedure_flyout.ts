import * as Blockly from 'blockly/core';

export interface ParameterDefinition {
    id?: string;
    name: string;
    type: string[];
}

export interface ProcedureDefinition {
    id?: string;
    name: string;
    label?: string;
    parameters: ParameterDefinition[];
    returnType?: string[];
}

export interface BlockProcedure {
    id: string;
    block: Blockly.Block;
    definition: ProcedureDefinition;
}

export type ProcedureCreateCallback = (proc: ProcedureDefinition) => boolean;
export type ProcedureDialog = (callback: ProcedureCreateCallback) => void;

let procedureCreateDialog: ProcedureDialog | undefined;
const procedureMap: Record<string, BlockProcedure> = {};

export function getProcedureById(id: string): BlockProcedure | undefined {
    return procedureMap[id];
}

export function setupProtototypeBlock(prototype: Blockly.Block, proc: ProcedureDefinition) {
    if (!proc.id) {
        proc.id = prototype.id;
    }
    prototype.data = prototype.id;
    Object.assign(prototype, { procedureDefinition: proc });
    procedureMap[prototype.id] = { id: prototype.id, block: prototype, definition: proc };
    prototype.setMovable(false);
    let lastInput: Blockly.Input | undefined;
    for (let i = 0; i < proc.parameters.length; i++) {
        if (!proc.parameters[i].id) {
            proc.parameters[i].id = Blockly.utils.idGenerator.genUid();
        }
        lastInput = prototype.appendValueInput(proc.parameters[i].name);
        lastInput.setCheck(proc.parameters[i].type);
        if (proc.parameters[i].type.length > 0 && proc.parameters[i].type[0] == 'Boolean') {
            if (lastInput.connection) {
                lastInput.connection.setShadowState({
                    type: 'argument_reporter_boolean',
                    fields: { VALUE: proc.parameters[i].name }
                });
            }
            const argBlock = Blockly.serialization.blocks.append(
                {
                    type: 'argument_reporter_boolean',
                    fields: { VALUE: proc.parameters[i].name }
                },
                prototype.workspace
            );
            if (lastInput.connection && argBlock.outputConnection) {
                lastInput.connection.connect(argBlock.outputConnection);
            }
        } else {
            if (lastInput.connection) {
                lastInput.connection.setShadowState({
                    type: 'argument_reporter_string_number',
                    fields: { VALUE: proc.parameters[i].name }
                });
            }
            const argBlock = Blockly.serialization.blocks.append(
                {
                    type: 'argument_reporter_string_number',
                    fields: { VALUE: proc.parameters[i].name }
                },
                prototype.workspace
            );
            if (lastInput.connection && argBlock.outputConnection) {
                lastInput.connection.connect(argBlock.outputConnection);
            }
        }
    }
    if (proc.label) {
        prototype
            .appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable(proc.label), 'LABEL');
    }
}

function blockButtonClickHandler(button: Blockly.FlyoutButton) {
    const workspace = button.getTargetWorkspace();

    function onCreateProcedure(proc: ProcedureDefinition) {
        const newBlock = Blockly.serialization.blocks.append(
            {
                type: 'procedures_definition',
                inputs: {
                    custom_block: {
                        block: {
                            type: 'procedures_prototype',
                            fields: {
                                NAME: proc.name
                            }
                        }
                    }
                }
            },
            workspace
        );
        if (!newBlock || !newBlock.inputList || newBlock.inputList.length == 0) {
            return false;
        }
        const prototype = newBlock.inputList[0].connection?.targetBlock();
        if (!prototype) {
            return false;
        }
        setupProtototypeBlock(prototype, proc);
        const newBlockSvg = newBlock as Blockly.BlockSvg;
        newBlockSvg.moveBy(300, 100);
        workspace.refreshToolboxSelection();
        return true;
    }
    if (procedureCreateDialog) {
        procedureCreateDialog(onCreateProcedure);
    }
}

// Returns an array of objects.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function proceduresFlyoutCallback(workspace: Blockly.Workspace) {
    const blockList = [];

    blockList.push({
        kind: 'button',
        text: 'Make a Block',
        callbackkey: 'CREATE_SPIKE_BLOCK'
    });

    for (const value of Object.values(procedureMap)) {
        blockList.push({
            kind: 'block',
            type: 'procedures_call',
            fields: {},
            extraState: value.definition
        });
    }

    return blockList;
}

export function registerProcedureFlyout(
    workspace: Blockly.WorkspaceSvg,
    dialogCreator: ProcedureDialog
) {
    function onDeleteProcedure(event: Blockly.Events.Abstract) {
        if (event.type == Blockly.Events.BLOCK_DELETE) {
            const deleteEvent = event as Blockly.Events.BlockDelete;
            if (deleteEvent.oldJson?.type === 'procedures_definition') {
                const blockId = deleteEvent.blockId;
                if (blockId) {
                    delete procedureMap[blockId];
                    workspace.refreshToolboxSelection();
                }
            }
        }
    }

    function onDragArgument(event: Blockly.Events.Abstract) {
        if (event.type == Blockly.Events.BLOCK_MOVE) {
            const moveEvent = event as Blockly.Events.BlockMove;
            if (moveEvent.reason) {
                if (!moveEvent.oldParentId) {
                    return;
                }
                if (!moveEvent.oldInputName) {
                    return;
                }
                if (!moveEvent.blockId) {
                    return;
                }
                if (moveEvent.reason.find((x) => x == 'disconnect')) {
                    const movingBlock = workspace.getBlockById(moveEvent.blockId);
                    if (!movingBlock) {
                        return;
                    }
                    const block = workspace.getBlockById(moveEvent.oldParentId);
                    if (!block) {
                        return;
                    }
                    if (block.type != 'procedures_prototype') {
                        return;
                    }
                    const input = block.getInput(moveEvent.oldInputName);
                    if (!input) {
                        return;
                    }
                    const argBlock = Blockly.serialization.blocks.append(
                        {
                            type: movingBlock.type,
                            fields: { VALUE: moveEvent.oldInputName }
                        },
                        workspace
                    );
                    if (argBlock.outputConnection && input.connection) {
                        input.connection.connect(argBlock.outputConnection);
                    }
                }
            }
        }
    }

    workspace.registerButtonCallback('CREATE_SPIKE_BLOCK', blockButtonClickHandler);
    workspace.registerToolboxCategoryCallback('SPIKE_BLOCKS', proceduresFlyoutCallback);
    procedureCreateDialog = dialogCreator;
    workspace.addChangeListener(onDeleteProcedure);
    workspace.addChangeListener(onDragArgument);
}
