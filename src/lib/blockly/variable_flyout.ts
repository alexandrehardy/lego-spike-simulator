import { variable_blocks, list_variable_blocks } from '$lib/blockly/variable_blocks';
import * as Blockly from 'blockly/core';

export interface VariableDefinition {
    name: string;
    type: string;
}

export type VariableCreateCallback = (v: VariableDefinition) => boolean;
export type VariableDialog = (type: string, callback: VariableCreateCallback) => void;

export let variableCreateDialog: VariableDialog | undefined;

function numberButtonClickHandler(button: Blockly.FlyoutButton) {
    const workspace = button.getTargetWorkspace();
    function onCreateVariable(v: VariableDefinition) {
        const existing = Blockly.Variables.nameUsedWithAnyType(v.name, workspace);
        if (!existing) {
            // No conflict
            workspace.createVariable(v.name, v.type);
            return true;
        }

        let msg;
        if (existing.type === v.type) {
            msg = Blockly.Msg['VARIABLE_ALREADY_EXISTS'].replace('%1', existing.name);
        } else {
            msg = Blockly.Msg['VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE'];
            msg = msg.replace('%1', existing.name).replace('%2', existing.type);
        }
        Blockly.dialog.alert(msg);
        return false;
    }
    if (variableCreateDialog) {
        variableCreateDialog('String', onCreateVariable);
    }
}

function listButtonClickHandler(button: Blockly.FlyoutButton) {
    const workspace = button.getTargetWorkspace();
    function onCreateVariable(v: VariableDefinition) {
        const existing = Blockly.Variables.nameUsedWithAnyType(v.name, workspace);
        if (!existing) {
            // No conflict
            workspace.createVariable(v.name, v.type);
            return true;
        }

        let msg;
        if (existing.type === v.type) {
            msg = Blockly.Msg['VARIABLE_ALREADY_EXISTS'].replace('%1', existing.name);
        } else {
            msg = Blockly.Msg['VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE'];
            msg = msg.replace('%1', existing.name).replace('%2', existing.type);
        }
        Blockly.dialog.alert(msg);
        return false;
    }
    if (variableCreateDialog) {
        variableCreateDialog('list', onCreateVariable);
    }
}

// Returns an array of objects.
function variablesFlyoutCallback(workspace: Blockly.Workspace) {
    const blockList = [];

    blockList.push({
        kind: 'button',
        text: 'Make a Variable',
        callbackkey: 'CREATE_SPIKE_NUMBER_VARIABLE'
    });

    let variables = workspace.getVariablesOfType('String');
    const numberVariables = workspace.getVariablesOfType('Number');
    variables = variables.concat(numberVariables);
    variables = variables.sort(Blockly.VariableModel.compareByName);
    if (variables.length > 0) {
        for (let i = 0; i < variables.length; i++) {
            blockList.push({
                ...variable_blocks[0],
                fields: {
                    VARIABLE: { id: variables[i].getId(), name: variables[i].name }
                }
            });
        }
        for (let j = 1; j < variable_blocks.length; j++) {
            blockList.push({
                ...variable_blocks[j],
                fields: {
                    VARIABLE: { id: variables[0].getId(), name: variables[0].name }
                }
            });
        }
    }

    blockList.push({
        kind: 'button',
        text: 'Make a List',
        callbackkey: 'CREATE_SPIKE_LIST_VARIABLE'
    });

    variables = workspace.getVariablesOfType('list');
    variables = variables.sort(Blockly.VariableModel.compareByName);
    if (variables.length > 0) {
        for (let i = 0; i < variables.length; i++) {
            blockList.push({
                ...list_variable_blocks[0],
                fields: {
                    LIST: { id: variables[i].getId(), name: variables[i].name }
                }
            });
        }
        for (let j = 1; j < list_variable_blocks.length; j++) {
            blockList.push({
                ...list_variable_blocks[j],
                fields: {
                    LIST: { id: variables[0].getId(), name: variables[0].name }
                }
            });
        }
    }
    return blockList;
}

export function registerVariableFlyout(
    workspace: Blockly.WorkspaceSvg,
    dialogCreator: VariableDialog
) {
    workspace.registerButtonCallback('CREATE_SPIKE_NUMBER_VARIABLE', numberButtonClickHandler);
    workspace.registerButtonCallback('CREATE_SPIKE_LIST_VARIABLE', listButtonClickHandler);
    workspace.registerToolboxCategoryCallback('SPIKE_VARIABLES', variablesFlyoutCallback);
    variableCreateDialog = dialogCreator;
}
