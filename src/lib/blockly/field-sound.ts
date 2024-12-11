import * as Blockly from 'blockly/core';
import { selectedAudio, type AudioDialog } from '$lib/blockly/audio';

export type MenuOption = [string, string];

export class FieldSound extends Blockly.FieldDropdown {
    constructor() {
        super(FieldSound.soundMenu, undefined, {});
    }

    static soundMenu(this: Blockly.FieldDropdown): Blockly.MenuOption[] {
        const menu = selectedAudio.map(
            (x) => [x.name, `{"name":"${x.name}","location":"device"}`] as MenuOption
        );
        menu.push(['Add sound ...', '$add'] as MenuOption);
        return menu;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
    static fromJson(config: Record<string, any>) {
        return new this();
    }

    protected onItemSelected_(menu: Blockly.Menu, menuItem: Blockly.MenuItem) {
        if (menuItem.getValue() === '$add') {
            if (!this.sourceBlock_) {
                return;
            }
            if (!this.sourceBlock_.workspace) {
                return;
            }
            const workspace = this.sourceBlock_.workspace as Blockly.WorkspaceSvg;
            const callback = workspace.getButtonCallback('ADD_SPIKE_AUDIO') as AudioDialog;
            if (callback) {
                callback();
            }
        } else {
            this.setValue(menuItem.getValue());
        }
    }
}

if (window) {
    Blockly.fieldRegistry.register('field_sound', FieldSound);
}
