/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

Blockly.Msg['BUTTON_LABEL_RANDOMIZE'] = 'Randomize';
Blockly.Msg['BUTTON_LABEL_CLEAR'] = 'Clear';

export const DEFAULT_HEIGHT = 5;
export const DEFAULT_WIDTH = 5;
const DEFAULT_PIXEL_SIZE = 30;
const DEFAULT_PALETTE_HEIGHT = 15;
const DEFAULT_PALETTE_WIDTH = 40;
const DEFAULT_PIXEL_COLOURS = [
    '#571cc1',
    '#6a35c8',
    '#7c4ec4',
    '#8f68d6',
    '#a281dd',
    '#b49ae3',
    '#c7b3ea',
    '#dacdf1',
    '#e8e2f4',
    '#ffffff'
];
const DEFAULT_BUTTONS: Buttons = {
    randomize: true,
    clear: true
};
/**
 * Field for inputting a small bitmap image.
 * Includes a grid of clickable pixels that's exported as a bitmap.
 */
export class FieldBitmap extends Blockly.Field<string> {
    private initialValue: string | null = null;
    private imgHeight: number;
    private imgWidth: number;
    /**
     * Array holding info needed to unbind events.
     * Used for disposing.
     */
    private boundEvents: Blockly.browserEvents.Data[] = [];
    /** References to UI elements */
    private editorPixels: HTMLElement[][] | null = null;
    private paletteEntries: HTMLElement[] | null = null;
    private blockDisplayPixels: SVGElement[][] | null = null;
    /** Stateful variables */
    private mouseIsDown = false;
    private valToPaintWith?: number;
    buttonOptions: Buttons;
    pixelSize: number;
    pixelColours: string[];
    fieldHeight?: number;
    selectedColour = 9;
    showPalette = true;

    /**
     * Constructor for the bitmap field.
     *
     * @param value 2D rectangular array of 1s and 0s.
     * @param validator A function that is called to validate.
     * @param config Config A map of options used to configure the field.
     */
    constructor(
        value: string | typeof Blockly.Field.SKIP_SETUP,
        validator?: Blockly.FieldValidator<string>,
        config?: FieldBitmapFromJsonConfig
    ) {
        super(value, validator, config);

        this.SERIALIZABLE = true;
        this.CURSOR = 'default';
        this.buttonOptions = { ...DEFAULT_BUTTONS, ...config?.buttons };
        this.pixelColours = config?.colours ?? [];
        this.showPalette = config?.showPalette === undefined ? true : config?.showPalette;
        while (this.pixelColours.length < DEFAULT_PIXEL_COLOURS.length) {
            this.pixelColours.push(DEFAULT_PIXEL_COLOURS[this.pixelColours.length]);
        }

        // Configure value, height, and width
        const currentValue = this.getValue();
        if (currentValue === null) {
            // Set a default empty value
            this.setValue(this.getEmptyBitmap());
        }
        this.imgHeight = config?.height ?? DEFAULT_HEIGHT;
        this.imgWidth = config?.width ?? DEFAULT_WIDTH;
        this.fieldHeight = config?.fieldHeight;
        if (this.fieldHeight) {
            this.pixelSize = this.fieldHeight / this.imgHeight;
        } else {
            this.pixelSize = DEFAULT_PIXEL_SIZE;
        }
    }

    /**
     * Constructs a FieldBitmap from a JSON arg object.
     *
     * @param options A JSON object with options.
     * @returns The new field instance.
     */
    static fromJson(options: FieldBitmapFromJsonConfig) {
        // `this` might be a subclass of FieldBitmap if that class doesn't override the static fromJson method.
        return new this(options.value ?? Blockly.Field.SKIP_SETUP, undefined, options);
    }

    /**
     * Returns the width of the image in pixels.
     *
     * @returns The width in pixels.
     */
    getImageWidth() {
        return this.imgWidth;
    }

    /**
     * Returns the height of the image in pixels.
     *
     * @returns The height in pixels.
     */
    getImageHeight() {
        return this.imgHeight;
    }

    /**
     * Validates that a new value meets the requirements for a valid bitmap array.
     *
     * @param newValue The new value to be tested.
     * @returns The new value if it's valid, or null.
     */
    protected override doClassValidation_(newValue: string): string | null | undefined;
    protected override doClassValidation_(newValue?: string): string | null;
    protected override doClassValidation_(newValue?: string): string | null | undefined {
        if (!newValue) {
            return null;
        }

        if (typeof newValue !== 'string') {
            return null;
        }

        if (newValue.length !== this.imgHeight * this.imgWidth) {
            return null;
        }

        // Check if all contents of the string are 0 to 9
        for (let i = 0; i < newValue.length; i++) {
            const char = newValue.charAt(i);
            if (!('0' <= char && char <= '9')) {
                return null;
            }
        }
        return newValue;
    }

    /**
     * Called when a new value has been validated and is about to be set.
     *
     * @param newValue The value that's about to be set.
     */
    protected override doValueUpdate_(newValue: string) {
        super.doValueUpdate_(newValue);
        if (newValue) {
            // If the field height is static, adjust the pixel size to fit.
            if (this.fieldHeight) {
                this.pixelSize = this.fieldHeight / this.imgHeight;
            } else {
                this.pixelSize = DEFAULT_PIXEL_SIZE;
            }
        }
    }

    /**
     * Show the bitmap editor dialog.
     *
     * @param e Optional mouse event that triggered the field to open, or
     *    undefined if triggered programmatically.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected override showEditor_(e?: Event) {
        const editor = this.dropdownCreate();
        Blockly.DropDownDiv.getContentDiv().appendChild(editor);
        Blockly.DropDownDiv.showPositionedByField(this, this.dropdownDispose.bind(this));
    }

    /**
     * Updates the block display and editor dropdown when the field re-renders.
     */
    protected override render_() {
        super.render_();

        if (!this.getValue()) {
            return;
        }

        if (this.blockDisplayPixels) {
            this.forAllCells((r, c) => {
                const pixel = this.getPixel(r, c);

                if (this.blockDisplayPixels) {
                    this.blockDisplayPixels[r][c].style.fill = this.pixelColours[pixel];
                }
                if (this.editorPixels) {
                    this.editorPixels[r][c].style.background = this.pixelColours[pixel];
                }
            });
        }
    }

    /**
     * Determines whether the field is editable.
     *
     * @returns True since it is always editable.
     */
    override updateEditable() {
        const editable = super.updateEditable();
        // Blockly.Field's implementation sets these classes as appropriate, but
        // since this field has no text they just mess up the rendering of the grid
        // lines.
        const svgRoot = this.getSvgRoot();
        if (svgRoot) {
            Blockly.utils.dom.removeClass(svgRoot, 'blocklyNonEditableText');
            Blockly.utils.dom.removeClass(svgRoot, 'blocklyEditableText');
        }
        return editable;
    }

    /**
     * Gets the rectangle built out of dimensions matching SVG's <g> element.
     *
     * @returns The newly created rectangle of same size as the SVG element.
     */
    override getScaledBBox() {
        const boundingBox = this.getSvgRoot()?.getBoundingClientRect();
        if (!boundingBox) {
            throw new Error('Tried to retrieve a bounding box without a rect');
        }
        return new Blockly.utils.Rect(
            boundingBox.top,
            boundingBox.bottom,
            boundingBox.left,
            boundingBox.right
        );
    }

    /**
     * Creates the bitmap editor and add event listeners.
     *
     * @returns The newly created dropdown menu.
     */
    private dropdownCreate() {
        const dropdownEditor = this.createElementWithClassname('div', 'dropdownEditor');
        if (this.buttonOptions.randomize || this.buttonOptions.clear) {
            dropdownEditor.classList.add('has-buttons');
        }
        const layout = this.createElementWithClassname('div', 'layout');
        dropdownEditor.appendChild(layout);
        const pixelContainer = this.createElementWithClassname('div', 'pixelContainer');
        layout.appendChild(pixelContainer);

        // This prevents the normal max-height from adding a scroll bar for large images.
        Blockly.DropDownDiv.getContentDiv().classList.add('contains-bitmap-editor');

        this.bindEvent(dropdownEditor, 'mouseup', this.onMouseUp);
        this.bindEvent(dropdownEditor, 'mouseleave', this.onMouseUp);
        this.bindEvent(dropdownEditor, 'dragstart', (e: Event) => {
            e.preventDefault();
        });

        this.editorPixels = [];
        for (let r = 0; r < this.imgHeight; r++) {
            this.editorPixels.push([]);
            const rowDiv = this.createElementWithClassname('div', 'pixelRow');
            for (let c = 0; c < this.imgWidth; c++) {
                // Add the button to the UI and save a reference to it
                const button = this.createElementWithClassname('div', 'pixelButton');
                this.editorPixels[r].push(button);
                rowDiv.appendChild(button);

                // Load the current pixel colour
                const brightness = this.getPixel(r, c);
                button.style.background = this.pixelColours[brightness];

                // Handle clicking a pixel
                this.bindEvent(button, 'mousedown', () => {
                    this.onMouseDownInPixel(r, c);
                    return true;
                });

                // Handle dragging into a pixel when mouse is down
                this.bindEvent(button, 'mouseenter', () => {
                    this.onMouseEnterPixel(r, c);
                });
            }
            pixelContainer.appendChild(rowDiv);
        }

        if (this.showPalette) {
            this.paletteEntries = [];
            // Add palette
            const paletteContainer = this.createElementWithClassname('div', 'palette');
            for (let i = 0; i < this.pixelColours.length; i++) {
                const entry = this.createElementWithClassname('div', 'paletteEntry');
                this.paletteEntries.push(entry);
            }
            for (let i = this.pixelColours.length - 1; i >= 0; i--) {
                const entry = this.paletteEntries[i];
                entry.style.background = this.pixelColours[i];
                // Handle clicking a pixel
                this.bindEvent(entry, 'mousedown', () => {
                    this.onMouseDownInPalette(i);
                    return true;
                });
                paletteContainer.appendChild(entry);
            }
            layout.appendChild(paletteContainer);
        }

        // Add control buttons below the pixel grid
        if (this.buttonOptions.randomize) {
            this.addControlButton(
                dropdownEditor,
                Blockly.Msg['BUTTON_LABEL_RANDOMIZE'],
                this.randomizePixels
            );
        }
        if (this.buttonOptions.clear) {
            this.addControlButton(
                dropdownEditor,
                Blockly.Msg['BUTTON_LABEL_CLEAR'],
                this.clearPixels
            );
        }

        if (this.blockDisplayPixels) {
            this.forAllCells((r, c) => {
                const pixel = this.getPixel(r, c);
                if (this.editorPixels) {
                    this.editorPixels[r][c].style.background = this.pixelColours[pixel];
                }
            });
        }

        // Store the initial value at the start of the edit.
        this.initialValue = this.getValue();

        return dropdownEditor;
    }

    /**
     * Initializes the on-block display.
     */
    override initView() {
        this.blockDisplayPixels = [];
        for (let r = 0; r < this.imgHeight; r++) {
            const row = [];
            for (let c = 0; c < this.imgWidth; c++) {
                const square = Blockly.utils.dom.createSvgElement(
                    'rect',
                    {
                        x: c * this.pixelSize,
                        y: r * this.pixelSize,
                        width: this.pixelSize,
                        height: this.pixelSize,
                        fill: this.pixelColours[0],
                        stroke: '#000',
                        fill_opacity: 1
                    },
                    this.getSvgRoot()
                );
                row.push(square);
            }
            this.blockDisplayPixels.push(row);
        }
    }

    /**
     * Updates the size of the block based on the size of the underlying image.
     */
    protected override updateSize_() {
        {
            const newWidth = this.pixelSize * this.imgWidth;
            const newHeight = this.pixelSize * this.imgHeight;
            if (this.borderRect_) {
                this.borderRect_.setAttribute('width', String(newWidth));
                this.borderRect_.setAttribute('height', String(newHeight));
            }

            this.size_.width = newWidth;
            this.size_.height = newHeight;
        }
    }

    /**
     * Create control button.
     *
     * @param parent Parent HTML element to which control button will be added.
     * @param buttonText Text of the control button.
     * @param onClick Callback that will be attached to the control button.
     */
    private addControlButton(parent: HTMLElement, buttonText: string, onClick: () => void) {
        const button = this.createElementWithClassname('button', 'controlButton');
        button.innerText = buttonText;
        parent.appendChild(button);
        this.bindEvent(button, 'click', onClick);
    }

    /**
     * Disposes of events belonging to the bitmap editor.
     */
    private dropdownDispose() {
        if (
            this.getSourceBlock() &&
            this.initialValue !== null &&
            this.initialValue !== this.getValue()
        ) {
            Blockly.Events.fire(
                new (Blockly.Events.get(Blockly.Events.BLOCK_CHANGE))(
                    this.sourceBlock_,
                    'field',
                    this.name || null,
                    this.initialValue,
                    this.getValue()
                )
            );
        }

        for (const event of this.boundEvents) {
            Blockly.browserEvents.unbind(event);
        }
        this.boundEvents.length = 0;
        this.editorPixels = null;
        // Set this.initialValue back to null.
        this.initialValue = null;

        Blockly.DropDownDiv.getContentDiv().classList.remove('contains-bitmap-editor');
    }

    /**
     * Constructs an array of zeros with the specified width and height.
     *
     * @returns The new value.
     */
    private getEmptyBitmap(): string {
        let newVal: string = '';
        for (let r = 0; r < this.imgHeight; r++) {
            for (let c = 0; c < this.imgWidth; c++) {
                newVal = newVal + '0';
            }
        }
        return newVal;
    }

    /**
     * Called when a mousedown event occurs within the bounds of a palette entry.
     *
     * @param index Index of palette entry.
     */
    private onMouseDownInPalette(index: number) {
        this.selectedColour = index;
        if (this.paletteEntries) {
            for (let i = 0; i < this.paletteEntries.length; i++) {
                this.paletteEntries[i].classList.remove('paletteEntrySelected');
                this.paletteEntries[i].classList.add('paletteEntry');
            }
            this.paletteEntries[index].classList.remove('paletteEntry');
            this.paletteEntries[index].classList.add('paletteEntrySelected');
        }
    }

    /**
     * Called when a mousedown event occurs within the bounds of a pixel.
     *
     * @param r Row number of grid.
     * @param c Column number of grid.
     */
    private onMouseDownInPixel(r: number, c: number) {
        // Toggle that pixel to the opposite of its value
        const colour = this.getPixel(r, c);
        const newPixelValue = colour == this.selectedColour ? 0 : this.selectedColour;
        this.setPixel(r, c, newPixelValue);
        this.mouseIsDown = true;
        this.valToPaintWith = newPixelValue;
    }

    /**
     * Called when the mouse drags over a pixel in the editor.
     *
     * @param r Row number of grid.
     * @param c Column number of grid.
     */
    private onMouseEnterPixel(r: number, c: number) {
        if (!this.mouseIsDown) {
            return;
        }
        if (this.valToPaintWith !== undefined && this.getPixel(r, c) !== this.valToPaintWith) {
            this.setPixel(r, c, this.valToPaintWith);
        }
    }

    /**
     * Resets mouse state (e.g. After either a mouseup event or if the mouse
     * leaves the editor area).
     */
    private onMouseUp() {
        this.mouseIsDown = false;
        this.valToPaintWith = undefined;
    }

    /**
     * Sets all the pixels in the image to a random value.
     */
    private randomizePixels() {
        const getRandBinary = () => Math.floor(Math.random() * 2);
        this.forAllCells((r, c) => {
            this.setPixel(r, c, getRandBinary());
        });
    }

    /**
     * Sets all the pixels to 0.
     */
    private clearPixels() {
        const cleared = this.getEmptyBitmap();
        this.fireIntermediateChangeEvent(cleared);
        this.setValue(cleared, false);
    }

    /**
     * Sets the value of a particular pixel.
     *
     * @param r Row number of grid.
     * @param c Column number of grid.
     * @param newValue Value of the pixel.
     */
    private setPixel(r: number, c: number, newValue: number) {
        let oldValue = this.getValue();
        if (!oldValue) {
            oldValue = this.getEmptyBitmap();
        }
        const grid = oldValue.split('');
        grid[r * this.imgHeight + c] = newValue.toString();
        const newString = grid.join('');
        this.fireIntermediateChangeEvent(newString);
        this.setValue(newString, false);
    }

    private getPixel(row: number, column: number): number {
        const value = this.getValue();
        if (!value) {
            throw new Error('Attempted to retrieve a pixel value when no value is set');
        }

        const char = value.charAt(row * this.imgHeight + column);
        return +char;
    }

    /**
     * Calls a given function for all cells in the image, with the cell
     * coordinates as the arguments.
     *
     * @param func A function to be applied.
     */
    private forAllCells(func: (row: number, col: number) => void) {
        for (let r = 0; r < this.imgHeight; r++) {
            for (let c = 0; c < this.imgWidth; c++) {
                func(r, c);
            }
        }
    }

    /**
     * Creates a new element with the specified type and class.
     *
     * @param elementType Type of html element.
     * @param className ClassName of html element.
     * @returns The created element.
     */
    private createElementWithClassname(elementType: string, className: string) {
        const newElt = document.createElement(elementType);
        newElt.className = className;
        return newElt;
    }

    /**
     * Binds an event listener to the specified element.
     *
     * @param element Specified element.
     * @param eventName Name of the event to bind.
     * @param callback Function to be called on specified event.
     */
    private bindEvent(element: HTMLElement, eventName: string, callback: (e: Event) => void) {
        this.boundEvents.push(
            Blockly.browserEvents.conditionalBind(element, eventName, this, callback)
        );
    }

    private fireIntermediateChangeEvent(newValue: string) {
        if (this.getSourceBlock()) {
            Blockly.Events.fire(
                new (Blockly.Events.get(Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE))(
                    this.getSourceBlock(),
                    this.name || null,
                    this.getValue(),
                    newValue
                )
            );
        }
    }
}

interface Buttons {
    readonly randomize: boolean;
    readonly clear: boolean;
}

export interface FieldBitmapFromJsonConfig extends Blockly.FieldConfig {
    value?: string;
    width?: number;
    height?: number;
    buttons?: Buttons;
    fieldHeight?: number;
    colours?: string[];
    showPalette?: boolean;
}

if (window) {
    Blockly.fieldRegistry.register('field_bitmap', FieldBitmap);

    /**
     * CSS for bitmap field.
     */
    Blockly.Css.register(`
.dropdownEditor {
  align-items: center;
  flex-direction: column;
  display: flex;
  justify-content: center;
}
.dropdownEditor.has-buttons {
  margin-bottom: 20px;
}
.pixelContainer {
  margin: 20px;
}
.pixelRow {
  display: flex;
  flex-direction: row;
  padding: 0;
  margin: 0;
  height: ${DEFAULT_PIXEL_SIZE}
}
.pixelButton {
  width: ${DEFAULT_PIXEL_SIZE}px;
  height: ${DEFAULT_PIXEL_SIZE}px;
  border: 1px solid #000;
}
.pixelDisplay {
  white-space:pre-wrap;
}
.layout {
    display: flex;
    flex-direction: row;
    gap: 2px;
}
.palette {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 20px;
}
.paletteEntry {
    width: ${DEFAULT_PALETTE_WIDTH}px;
    height: ${DEFAULT_PALETTE_HEIGHT}px;
    border: 2px solid #000;
}
.paletteEntrySelected {
    width: ${DEFAULT_PALETTE_WIDTH}px;
    height: ${DEFAULT_PALETTE_HEIGHT}px;
    border: 2px solid #dfff00;
}
.controlButton {
  margin: 5px 0;
}
.blocklyDropDownContent.contains-bitmap-editor {
  max-height: none;
}
`);
}
