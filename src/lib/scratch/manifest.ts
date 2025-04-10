import * as Blockly from 'blockly/core';
import { genId } from '$lib/blockly/genid';

function genCompatibleManifestId() {
    return genId();
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
