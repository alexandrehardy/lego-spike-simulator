import * as Blockly from 'blockly/core';

export function registerInputShadowExtension(blockly: typeof Blockly) {
    // This extension sets the block's tooltip to be a function which displays
    // the parent block's tooltip (if it exists).
    if (blockly.Extensions.isRegistered('shadow_input')) {
        blockly.Extensions.unregister('shadow_input');
    }
    blockly.Extensions.register('shadow_input', function (this: Blockly.Block) {
        // this refers to the block that the extension is being run on
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const thisBlock = this;
        if (!thisBlock.inputList) {
            return;
        }
        thisBlock.inputList.forEach((input: Blockly.Input) => {
            if (<number>input.type === <number>blockly.ConnectionType.INPUT_VALUE) {
                if (input.connection) {
                    const checks = input.connection.getCheck();
                    let createShadow = false;
                    if (checks) {
                        if (checks.indexOf('Number') >= 0) {
                            createShadow = true;
                        } else if (checks.indexOf('String') >= 0) {
                            createShadow = true;
                        }
                    } else {
                        createShadow = true;
                    }
                    if (createShadow) {
                        input.setShadowDom(
                            blockly.utils.xml.textToDom(
                                '<shadow type="math_number">' +
                                    '<field name="NUM">1</field>' +
                                    '</shadow>'
                            )
                        );
                    }
                }
            }
        });
    });
}

export function applyInputShadowExtension(blockly: typeof Blockly) {
    for (const key in blockly.Blocks) {
        blockly.Extensions.apply('shadow_input', blockly.Blocks[key], false);
    }
}
