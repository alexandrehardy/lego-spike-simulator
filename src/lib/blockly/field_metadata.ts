import * as Blockly from 'blockly/core';

// Hidden data added to the model, but not visible to the user
export class FieldMetadata extends Blockly.FieldLabelSerializable {
    override initView() {}
    protected render_() {
        this.updateSize_(0);
    }
}

if (window) {
    Blockly.fieldRegistry.register('field_metadata', FieldMetadata);
}
