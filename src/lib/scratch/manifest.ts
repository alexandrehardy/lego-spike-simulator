import * as Blockly from 'blockly/core';

export function createManifest(workspace: Blockly.WorkspaceSvg, extensions: string[]) {
    const created = new Date().toISOString();
    return {
        autoDelete: false,
        created: created,
        extensions: extensions,
        extraFiles: [],
        hardware: {
            '~;262S4m.SF7HwvP43*j': {
                type: 'flipper'
            }
        },
        id: workspace.id,
        lastsaved: created,
        name: 'Project1',
        showAllBlocks: false,
        size: 0,
        slotIndex: 0,
        state: {
            canvasDrawerOpen: true,
            canvasDrawerTab: 'monitorTab',
            playMode: 'download'
        },
        type: 'word-blocks',
        version: 38,
        workspaceX: workspace.scrollX,
        workspaceY: workspace.scrollY,
        zoomLevel: workspace.getScale()
    };
}
