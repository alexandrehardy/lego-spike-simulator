export function registerInputShadowExtension(Blockly) {
    // This extension sets the block's tooltip to be a function which displays
    // the parent block's tooltip (if it exists).
    if (Blockly.Extensions.isRegistered('shadow_input')) {
        Blockly.Extensions.unregister('shadow_input');
    }
    Blockly.Extensions.register('shadow_input', function () {
        // this refers to the block that the extension is being run on
        const thisBlock = this;
        thisBlock.inputList.forEach((input) => {
            if (input.type === Blockly.ConnectionType.INPUT_VALUE) {
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
                    console.log(thisBlock.type);
                    console.log(input.connection.getCheck());
                    if (createShadow) {
                        input.setShadowDom(
                            Blockly.utils.xml.textToDom(
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
