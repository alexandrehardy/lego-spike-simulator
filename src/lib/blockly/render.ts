import * as Blockly from 'blockly/core';

class CustomPathObject extends Blockly.zelos.PathObject {
    override applyColour(block: Blockly.BlockSvg) {
        super.applyColour(block);

        // Set shadow fill colour to match parent; stroke already set by super.
        const parent = block.getParent();
        if (block.isShadow() && parent) {
            this.svgPath.setAttribute('fill', parent.style.colourSecondary);
        }
    }
}

export const spikeRendererName = 'spike_renderer';

class SpikeRenderer extends Blockly.zelos.Renderer {
    constructor() {
        super(spikeRendererName);
    }

    override makePathObject(root: SVGElement, style: Blockly.Theme.BlockStyle): CustomPathObject {
        return new CustomPathObject(root, style, this.getConstants());
    }
}

Blockly.blockRendering.register(spikeRendererName, SpikeRenderer);

// In the renderer, we make shadow blocks inherit their fill from their parent.
// This doesn't address the borderrect, so we have to monkey patch it. This
// is used to patch each of the fields we use below.
const updateBorderRect = (source: Blockly.BlockSvg, borderRect: SVGRectElement) => {
    const parent = source.getParent();
    if (borderRect && parent && source.isShadow()) {
        borderRect.setAttribute('stroke', parent.style.colourTertiary);
    }
};

const originalFieldTextApplyColor = Blockly.FieldTextInput.prototype.applyColour;

Blockly.FieldTextInput.prototype.applyColour = function () {
    originalFieldTextApplyColor.call(this);
    if (this.sourceBlock_ && this.borderRect_) {
        updateBorderRect(this.sourceBlock_ as Blockly.BlockSvg, this.borderRect_);
    }
};

const originalFieldNumberApplyColor = Blockly.FieldNumber.prototype.applyColour;

Blockly.FieldNumber.prototype.applyColour = function () {
    originalFieldNumberApplyColor.call(this);
    if (this.sourceBlock_ && this.borderRect_) {
        updateBorderRect(this.sourceBlock_ as Blockly.BlockSvg, this.borderRect_);
    }
};
