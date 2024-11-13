import * as Blockly from 'blockly/core';
import { type ImageProperties, FieldGridDropdown } from '$lib/blockly/field-grid-dropdown';

export interface SelectedImage {
    selected: boolean;
    image: ImageProperties;
}

type FieldUltraSoundValidator = Blockly.FieldDropdownValidator;

const IMAGE_Y_OFFSET = 0;
const IMAGE_Y_PADDING: number = IMAGE_Y_OFFSET * 2;

export class FieldUltraSound extends FieldGridDropdown {
    private imageElements: SVGImageElement[] | null = null;

    constructor(validator?: FieldUltraSoundValidator) {
        super(
            [
                [{ src: 'icons/halfCircleTop.svg', width: 25, height: 12, alt: 'TL' }, '1'],
                [{ src: 'icons/halfCircleTop.svg', width: 25, height: 12, alt: 'TR' }, '2'],
                [{ src: 'icons/halfCircleBottom.svg', width: 25, height: 12, alt: 'BL' }, '3'],
                [{ src: 'icons/halfCircleBottom.svg', width: 25, height: 12, alt: 'BR' }, '4']
            ],
            validator,
            {
                columns: 2,
                maxItems: 4,
                minItems: 0,
                sorted: true,
                separator: ' '
            }
        );
    }

    protected updateColumnsStyling_() {
        const menuElement = this.menu_ ? this.menu_.getElement() : null;
        if (menuElement) {
            menuElement.style.gridTemplateColumns = `repeat(${this.columns}, max-content)`;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
    static fromJson(config: Record<string, any>) {
        return new this(undefined);
    }

    /**
     * Create the block UI for this dropdown.
     */
    override initView() {
        if (this.shouldAddBorderRect_()) {
            this.createBorderRect_();
        } else {
            this.clickTarget_ = (this.sourceBlock_ as Blockly.BlockSvg).getSvgRoot();
        }

        this.imageElements = [];
        for (let i = 0; i < 4; i++) {
            this.imageElements.push(
                Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.IMAGE, {}, this.fieldGroup_)
            );
        }

        if (this.borderRect_) {
            Blockly.utils.dom.addClass(this.borderRect_, 'blocklyDropdownRect');
        }
    }

    override setChecked(menuItem: Blockly.MenuItem, checked: boolean) {
        super.setChecked(menuItem, checked);
        const el = menuItem.getElement();
        if (el && menuItem.isEnabled()) {
            if (checked) {
                Blockly.utils.dom.removeClass(el, 'lightOff');
                Blockly.utils.dom.addClass(el, 'lightOn');
            } else {
                Blockly.utils.dom.removeClass(el, 'lightOn');
                Blockly.utils.dom.addClass(el, 'lightOff');
            }
        }
    }
    protected override getStringValue(): string {
        const options = this.getOptions(false);
        const value: string[] = [];
        for (const option of options) {
            if (this.selected.findIndex((v) => v == option[1]) >= 0) {
                value.push('100');
            } else {
                value.push('0');
            }
        }
        return value.join(this.separator);
    }

    protected override fromStringValue(value: string | undefined | null): string[] | undefined {
        const options = this.getOptions(false);
        const values = value?.split(this.separator) ?? [];
        if (values.length != 4) {
            return undefined;
        }

        const selected = [];
        for (let i = 0; i < values.length; i++) {
            if (values[i] == '100') {
                if (i < options.length) {
                    selected.push(options[i][1]);
                } else {
                    selected.push('N/A');
                }
            }
        }
        return selected;
    }

    protected override render_() {
        const lights: SelectedImage[] = [];

        for (const option of this.getOptions(false)) {
            if (this.selected.findIndex((v) => v == option[1]) >= 0) {
                lights.push({ selected: true, image: option[0] as ImageProperties });
            } else {
                lights.push({ selected: false, image: option[0] as ImageProperties });
            }
        }
        this.renderImages(lights);
        this.positionBorderRect_();
    }

    private renderImages(lights: SelectedImage[]) {
        const block = this.getSourceBlock();
        if (!block) {
            throw new Blockly.UnattachedFieldError();
        }

        const scale = 1;
        const imageJson = lights[0].image;
        const imageHeight = Number(imageJson.height) * scale;
        const imageWidth = Number(imageJson.width) * scale;

        // Height and width include the border rect.
        const hasBorder = !!this.borderRect_;
        const height = Math.max(
            hasBorder ? this.getConstants()!.FIELD_DROPDOWN_BORDER_RECT_HEIGHT : 0,
            imageHeight * 2 + IMAGE_Y_PADDING
        );
        const xPadding = hasBorder ? this.getConstants()!.FIELD_BORDER_RECT_X_PADDING : 0;
        this.size_.width = (imageWidth + xPadding * 2) * 2;
        this.size_.height = height;

        let xOffset = 0;
        let yOffset = 0;
        for (let i = 0; i < 4; i++) {
            const imageElement = this.imageElements![i];
            const imageJson = lights[i].image;
            imageElement.style.display = '';
            imageElement.style.filter = lights[i].selected ? '' : 'brightness(60%)';
            imageElement.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href', imageJson.src);
            imageElement.setAttribute('height', String(Number(imageJson.height) * scale));
            imageElement.setAttribute('width', String(Number(imageJson.width) * scale));
            imageElement.setAttribute('x', `${xPadding + imageWidth * xOffset}`);
            imageElement.setAttribute('y', String(imageHeight * yOffset));
            xOffset++;
            if (xOffset >= 2) {
                xOffset = 0;
                yOffset++;
            }
        }

        this.positionTextElement_(xPadding, imageWidth);
    }
}

if (window) {
    Blockly.fieldRegistry.register('field_ultra_sound', FieldUltraSound);
    Blockly.Css.register(`
 .fieldGridDropDownContainer .blocklyMenuItem.lightOn {
   color: rgba(255, 255, 255, 1);
 }
 .fieldGridDropDownContainer .blocklyMenuItem.lightOff {
   color: rgba(255, 255, 255, 1);
   filter: brightness(80%);
 }
 `);
}
