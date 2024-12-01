import * as Blockly from 'blockly/core';

function genCompatibleManifestId() {
    const soup = '_-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 12;
    const soupLength = soup.length;
    const id = [];
    for (let i = 0; i < length; i++) {
        id[i] = soup.charAt(Math.random() * soupLength);
    }
    return id.join('');
}

export function createManifest(
    workspace: Blockly.WorkspaceSvg,
    extensions: string[],
    name: string | undefined = undefined
) {
    const now = new Date();
    const created = now.toISOString();
    if (!name) {
        name = `Project-${now.toLocaleDateString('en-US')}`;
    }
    extensions.sort();
    return {
        autoDelete: false,
        created: created,
        extensions: extensions,
        extraFiles: [],
        hardware: {
            'M5I;mUjN!?Xw59f|6DcO': {
                type: 'flipper'
            }
        },
        id: genCompatibleManifestId(),
        lastsaved: created,
        name: name,
        showAllBlocks: false,
        size: 0,
        slotIndex: 0,
        state: {
            canvasDrawerOpen: false,
            canvasDrawerTab: 'monitorTab',
            playMode: 'download'
        },
        type: 'word-blocks',
        version: 38,
        workspaceX: Math.round(workspace.scrollX),
        workspaceY: Math.round(workspace.scrollY),
        zoomLevel: workspace.getScale()
    };
}
