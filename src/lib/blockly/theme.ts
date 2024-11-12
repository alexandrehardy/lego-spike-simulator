import * as Blockly from 'blockly/core';

export const theme = Blockly.Theme.defineTheme('spike', {
    base: Blockly.Themes.Zelos,
    name: 'spike',
    startHats: true,
    blockStyles: {
       procedure_blocks: {
            'hat': 'none'
        }
    }
});
