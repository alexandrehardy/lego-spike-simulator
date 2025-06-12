import * as Blockly from 'blockly/core';

export const spikeRendererName = 'spike_renderer';

class SpikeRenderer extends Blockly.zelos.Renderer {
    constructor() {
        super(spikeRendererName);
    }

    protected override makeConstants_(): Blockly.zelos.ConstantProvider {
        const constants = super.makeConstants_();
        // Default flow colour is '#fff200'
        constants.SELECTED_GLOW_COLOUR = '#4eff4e';
        return constants;
    }
}

Blockly.blockRendering.register(spikeRendererName, SpikeRenderer);

const originalBlockSetParent = Blockly.Block.prototype.setParent;

Blockly.Block.prototype.setParent = function (newParent: Blockly.Block | null) {
    originalBlockSetParent.call(this, newParent);
    if (this.isShadow() && this.getParent()) {
        this.setStyle(this.getParent()!.getStyleName());
    }
};
