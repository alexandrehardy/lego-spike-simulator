import * as Blockly from 'blockly/core';
import {
    type IProcedureBlock,
    ObservableParameterModel
} from '@blockly/block-shareable-procedures';

function blockButtonClickHandler(button: Blockly.FlyoutButton) {
    const workspace = button.getTargetWorkspace();
    const newBlock = Blockly.serialization.blocks.append(
        { type: 'procedures_defnoreturn' },
        workspace
    );
    const newBlockSvg = newBlock as Blockly.BlockSvg;
    newBlockSvg.moveBy(300, 100);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const procedure = (newBlock as any as IProcedureBlock).getProcedureModel();
    procedure.setName('Flyout');
    procedure.insertParameter(new ObservableParameterModel(workspace, 'x'), 0);
    procedure.insertParameter(new ObservableParameterModel(workspace, 'y'), 1);
}

// Returns an array of objects.
function proceduresFlyoutCallback(workspace: Blockly.Workspace) {
    const blockList = [];

    blockList.push({
        kind: 'button',
        text: 'Make a Block',
        callbackkey: 'CREATE_SPIKE_BLOCK'
    });

    const tuple = Blockly.Procedures.allProcedures(workspace);
    const procedureList = tuple[0];
    for (let i = 0; i < procedureList.length; i++) {
        const name = procedureList[i][0];
        const args = procedureList[i][1];
        blockList.push({
            kind: 'block',
            type: 'procedures_callnoreturn',
            extraState: {
                name: name,
                params: args
            },
            fields: {}
        });
    }

    return blockList;
}

export function registerProcedureFlyout(workspace: Blockly.WorkspaceSvg) {
    workspace.registerButtonCallback('CREATE_SPIKE_BLOCK', blockButtonClickHandler);
    workspace.registerToolboxCategoryCallback('SPIKE_BLOCKS', proceduresFlyoutCallback);
}
