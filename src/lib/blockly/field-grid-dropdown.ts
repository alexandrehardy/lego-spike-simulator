/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Grid dropdown field.
 * @author kozbial@google.com (Monica Kozbial)
 */

import * as Blockly from 'blockly/core';
// Patch blockly to get access to private members
import '$lib/blockly/patch';

export interface ImageProperties {
    src: string;
    alt: string;
    width: number;
    height: number;
}

/**
 * A config object for defining a field grid dropdown.
 */
export interface FieldGridDropdownConfig extends Blockly.FieldDropdownConfig {
    columns?: string | number;
    primaryColour?: string;
    borderColour?: string;
    maxItems?: number;
    minItems?: number;
    sorted?: boolean;
    separator?: string;
    contentSize?: string;
}

/**
 * Construct a FieldGridDropdown from a JSON arg object.
 */
export interface FieldGridDropdownFromJsonConfig extends FieldGridDropdownConfig {
    options?: Blockly.MenuGenerator;
}

type FieldGridDropdownValidator = Blockly.FieldDropdownValidator;

/**
 * Grid dropdown field.
 */
export class FieldGridDropdown extends Blockly.FieldDropdown {
    /**
     * The number of columns in the dropdown grid. Must be an integer value
     * greater than 0. Defaults to 3.
     */
    protected columns = 3;

    protected primaryColour?: string;

    protected borderColour?: string;

    protected maxItems = 1;

    protected minItems = 1;

    protected selected: Array<string | ImageProperties> = [];

    protected sorted = true;

    protected separator = ',';

    protected contentSize = 'min-content';

    /**
     * Class for an grid dropdown field.
     *
     * @param menuGenerator A non-empty array of options for a dropdown list,
     *   or a function which generates these options.
     * @param validator A function that is called to validate
     *  changes to the field's value. Takes in a language-neutral dropdown
     *  option & returns a validated language-neutral dropdown option, or null
     *  to abort the change.
     * @param config A map of options used to configure the field.
     *  See the [field creation documentation]{@link
     * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/dropdown#creation}
     *  for a list of properties this parameter supports.
     * @extends {Blockly.Field}
     * @constructor
     * @throws {TypeError} If `menuGenerator` options are incorrectly structured.
     */
    constructor(
        menuGenerator: Blockly.MenuGenerator,
        validator?: FieldGridDropdownValidator,
        config?: FieldGridDropdownConfig
    ) {
        super(menuGenerator, validator, config);
        // Monkey patch private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any).handleMenuActionEvent = this.newHandleMenuActionEvent;

        if (config?.columns) {
            this.setColumnsInternal(config.columns);
        }

        if (config && config.primaryColour) {
            this.primaryColour = config.primaryColour;
        }

        if (config && config.borderColour) {
            this.borderColour = config.borderColour;
        }

        if (config && config.minItems !== undefined) {
            this.minItems = config.minItems;
        }

        if (config && config.maxItems) {
            this.maxItems = config.maxItems;
        }

        if (config && config.sorted !== undefined) {
            this.sorted = config.sorted;
        }

        if (config && config.separator !== undefined) {
            this.separator = config.separator;
        }

        if (config && config.contentSize !== undefined) {
            this.contentSize = config.contentSize;
        }

        this.selected = this.getOptions(false)
            .slice(0, this.minItems)
            .map((v) => v[1]);
    }

    /**
     * Constructs a FieldGridDropdown from a JSON arg object.
     *
     * @param config A JSON object with options.
     * @returns The new field instance.
     * @package
     * @nocollapse
     */
    static fromJson(config: FieldGridDropdownFromJsonConfig) {
        if (!config.options) {
            throw new Error(
                'options are required for the dropdown field. The ' +
                    'options property must be assigned an array of ' +
                    '[humanReadableValue, languageNeutralValue] tuples.'
            );
        }
        // `this` might be a subclass of FieldDropdown if that class doesn't
        // override the static fromJson method.
        return new this(config.options, undefined, config);
    }

    override fromXml(fieldElement: Element) {
        super.fromXml(fieldElement);
        this.selected = this.fromStringValue(this.getValue()) ?? [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    override loadState(state: any) {
        super.loadState(state);
        this.selected = this.fromStringValue(this.getValue()) ?? [];
    }

    /**
     * Sets the number of columns on the grid. Updates the styling to reflect.
     *
     * @param columns The number of columns. Is rounded to
     *    an integer value and must be greater than 0. Invalid
     *    values are ignored.
     */
    setColumns(columns: number) {
        this.setColumnsInternal(columns);
        this.updateColumnsStyling_();
    }

    /**
     * Sets the number of columns on the grid.
     *
     * @param columns The number of columns. Is rounded to an integer value and
     *  must be greater than 0. Invalid values are ignored.
     */
    private setColumnsInternal(columns: string | number) {
        const cols = typeof columns === 'string' ? parseInt(columns) : columns;
        if (!isNaN(cols) && cols >= 1) {
            this.columns = cols;
        }
    }

    /**
     * Create a dropdown menu under the text.
     *
     * @param e Optional mouse event that triggered the field to open, or
     *  undefined if triggered programmatically.
     */
    protected showEditor_(e?: MouseEvent) {
        super.showEditor_(e);
        const colours = this.getColours();
        if (colours && colours.border) {
            Blockly.DropDownDiv.setColour(colours.primary, colours.border);
        }

        const menuElement = this.menu_?.getElement() ?? null;
        if (menuElement) {
            Blockly.utils.dom.addClass(menuElement, 'fieldGridDropDownContainer');
        }
        this.updateColumnsStyling_();

        Blockly.DropDownDiv.showPositionedByField(this, this.dropdownDispose_.bind(this));
    }

    /**
     * Updates the styling for number of columns on the dropdown.
     */
    protected updateColumnsStyling_() {
        const menuElement = this.menu_ ? this.menu_.getElement() : null;
        if (menuElement) {
            menuElement.style.gridTemplateColumns = `repeat(${this.columns}, ${this.contentSize})`;
        }
    }

    /**
     * Determine the colours for the dropdowndiv. The dropdown should match block
     * colour unless other colours are specified in the config.
     *
     * @returns The colours to set for the dropdowndiv.
     */
    private getColours() {
        if (this.primaryColour && this.borderColour) {
            return {
                primary: this.primaryColour,
                border: this.borderColour
            };
        }

        const sourceBlock = this.getSourceBlock();
        if (!(sourceBlock instanceof Blockly.BlockSvg)) return;

        const colourSource = sourceBlock.isShadow() ? sourceBlock.getParent() : sourceBlock;
        if (!colourSource) return;

        return {
            primary: this.primaryColour ?? colourSource.getColour(),
            border: this.borderColour ?? colourSource.getColourTertiary()
        };
    }

    newHandleMenuActionEvent(menuItem: Blockly.MenuItem) {
        if (this.maxItems == 1) {
            Blockly.DropDownDiv.hideIfOwner(this, true);
        }
        this.onItemSelected_(this.menu_ as Blockly.Menu, menuItem);
    }

    setChecked(menuItem: Blockly.MenuItem, checked: boolean) {
        menuItem.setChecked(checked);
        const el = menuItem.getElement();
        if (el && menuItem.isEnabled()) {
            const name = 'blocklyMenuItemSelected';
            const nameDep = 'goog-option-selected';
            if (checked) {
                Blockly.utils.dom.addClass(el, name);
                Blockly.utils.dom.addClass(el, nameDep);
            } else {
                Blockly.utils.dom.removeClass(el, name);
                Blockly.utils.dom.removeClass(el, nameDep);
            }
        }
    }

    protected override onItemSelected_(menu: Blockly.Menu, menuItem: Blockly.MenuItem) {
        if (this.maxItems == 1) {
            this.setValue(menuItem.getValue());
        } else {
            if (menuItem.isChecked()) {
                if (this.selected.length > this.minItems) {
                    const value = menuItem.getValue();
                    this.selected = this.selected.filter((v) => v !== value);
                    this.setChecked(menuItem, false);
                }
            } else {
                const value = menuItem.getValue();
                if (value !== null) {
                    if (this.selected.length >= this.maxItems) {
                        this.selected = this.selected.slice(this.maxItems - 1);
                        menu.getItems().forEach((item: Blockly.MenuItem) =>
                            this.setChecked(
                                item,
                                this.selected.some((v) => v === item.getValue())
                            )
                        );
                    }
                    this.selected.push(value);
                    if (this.sorted) {
                        this.selected.sort();
                    }
                    this.setChecked(menuItem, true);
                }
            }
            this.setValue(this.getStringValue());
        }
    }

    protected override doClassValidation_(newValue: string): string | null | undefined;
    protected override doClassValidation_(newValue?: string): string | null;
    protected override doClassValidation_(newValue?: string): string | null | undefined {
        const options = this.getOptions(true);
        let isValueValid = false;

        if (this.maxItems == 1) {
            isValueValid = options.some((option) => option[1] === newValue);
        } else {
            const selected = this.fromStringValue(newValue);
            if (selected === undefined) {
                return null;
            }
            const itemsValid = selected.map((v) => options.some((option) => option[1] === v));
            isValueValid = itemsValid.every((v) => v);
            if (selected.length > this.maxItems) {
                console.warn(
                    'Too many items selected.' +
                        ' Block type: ' +
                        this.sourceBlock_?.type?.toString() +
                        ', Field name: ' +
                        this.name +
                        ', Value: ' +
                        newValue
                );
            }
        }

        if (!isValueValid) {
            if (this.sourceBlock_) {
                console.warn(
                    "Cannot set the dropdown's value to an unavailable option." +
                        ' Block type: ' +
                        this.sourceBlock_?.type?.toString() +
                        ', Field name: ' +
                        this.name +
                        ', Value: ' +
                        newValue
                );
            }
            return null;
        }
        return newValue;
    }

    protected getStringValue(): string {
        return this.selected.join(this.separator);
    }

    protected fromStringValue(value: string | undefined | null): string[] | undefined {
        return value?.split(this.separator) ?? [];
    }

    override getText(): string {
        if (this.maxItems == 1) {
            return super.getText();
        }
        const options = this.getOptions(false);
        const selectedValues = this.selected.map((k) => {
            const entry = options.find((v) => v[1] == k);
            if (entry) {
                return entry[0];
            }
        });
        return selectedValues.join(this.separator);
    }

    override applyColour() {
        // We override this to setup the dropdown menu
        super.applyColour();
        const menu = this.getMenu();
        if (this.maxItems !== 1 && menu) {
            menu.getItems().forEach((item: Blockly.MenuItem) =>
                this.setChecked(
                    item,
                    this.selected.some((v) => v === item.getValue())
                )
            );
        }
    }
}

if (window) {
    Blockly.fieldRegistry.register('field_grid_dropdown', FieldGridDropdown);

    /**
     * CSS for slider field.
     */
    Blockly.Css.register(`
 /** Setup grid layout of DropDown */
 .fieldGridDropDownContainer.blocklyMenu {
   display: grid;
   grid-gap: 7px;
   }
 /* Change look of cells (add border, sizing, padding, and text color) */
 .fieldGridDropDownContainer.blocklyMenu .blocklyMenuItem {
   border: 1px solid rgba(1, 1, 1, 0.5);
   border-radius: 4px;
   color: white;
   min-width: auto;
   padding-left: 15px; /* override padding-left now that checkmark is hidden */
 }
 /* Change look of selected cell */
 .fieldGridDropDownContainer .blocklyMenuItem .blocklyMenuItemCheckbox {
   display: none; /* Hide checkmark */
 }
 .fieldGridDropDownContainer .blocklyMenuItem.blocklyMenuItemSelected {
   background-color: rgba(1, 1, 1, 0.25);
 }
 /* Change look of focus/highlighted cell */
 .fieldGridDropDownContainer .blocklyMenuItem.blocklyMenuItemHighlight {
   box-shadow: 0 0 0 4px hsla(0, 0%, 100%, .2);
 }
 .fieldGridDropDownContainer .blocklyMenuItemHighlight {
   /* Uses less selectors so as to not affect blocklyMenuItemSelected */
   background-color: inherit;
 }
 .fieldGridDropDownContainer {
   margin: 7px; /* needed for highlight */
 }
 `);
}
