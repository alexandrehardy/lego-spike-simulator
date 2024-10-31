import { variable_blocks, list_variable_blocks } from '$lib/blockly/variable_blocks';
import { browser, building } from '$app/environment';
import * as BlocklyLib from 'blockly/core';

const Blockly = browser ? BlocklyLib : BlocklyLib.default;

function numberButtonClickHandler(button: FlyoutButton) {
    Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), undefined, 'Number');
}

function listButtonClickHandler(button: FlyoutButton) {
    Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), undefined, 'list');
}

// Returns an array of objects.
function variablesFlyoutCallback(workspace: Blockly.Workspace) {
    const blockList = [];

    blockList.push({
        kind: 'button',
        text: 'Make a Variable',
        callbackkey: 'CREATE_SPIKE_NUMBER_VARIABLE'
    });

    let variables = workspace.getVariablesOfType('Number');
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

export function registerVariableFlyout(workspace: Blockly.Workspace) {
    workspace.registerButtonCallback('CREATE_SPIKE_NUMBER_VARIABLE', numberButtonClickHandler);
    workspace.registerButtonCallback('CREATE_SPIKE_LIST_VARIABLE', listButtonClickHandler);
    workspace.registerToolboxCategoryCallback('SPIKE_VARIABLES', variablesFlyoutCallback);
}
