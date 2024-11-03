import * as BlocklyLib from 'blockly/core';

const Blockly = BlocklyLib.default ? BlocklyLib.default : BlocklyLib;

/**
 * Class for a variable's dropdown field.
 */

const NONE_AVAILABLE = 'NONE_AVAILABLE';

export class FieldVariableGetter extends Blockly.FieldVariable {
    constructor(
        varName: string | null | typeof Field.SKIP_SETUP,
        validator?: FieldVariableValidator,
        variableTypes?: string[],
        defaultType?: string,
        config?: FieldVariableConfig
    ) {
        super(varName, validator, variableTypes, defaultType, config);
        this.menuGenerator_ = FieldVariableGetter.dropdownCreate as Blockly.MenuGenerator;
    }

    override initModel() {
        const block = this.getSourceBlock();
        if (!block) {
            throw new Blockly.UnattachedFieldError();
        }
        if (this.variable) {
            return; // Initialization already happened.
        }
        const variable = Blockly.Variables.getVariable(
            block.workspace,
            null,
            this.defaultVariableName,
            this.defaultType
        );
        if (variable) {
            // Don't call setValue because we don't want to cause a rerender.
            this.doValueUpdate_(variable.getId());
        }
    }

    override toXml(fieldElement: Element): Element {
        // Make sure the variable is initialized.
        this.initModel();

        if (this.variable) {
            fieldElement.id = this.variable.getId();
            fieldElement.textContent = this.variable.name;
            if (this.variable.type) {
                fieldElement.setAttribute('variabletype', this.variable.type);
            }
        } else {
            fieldElement.id = '';
            fieldElement.textContent = 'none';
        }
        return fieldElement;
    }

    override saveState(doFullSerialization?: boolean): AnyDuringMigration {
        // Make sure the variable is initialized.
        this.initModel();
        if (this.variable) {
            const state = { id: this.variable!.getId() };
            if (doFullSerialization) {
                (state as AnyDuringMigration)['name'] = this.variable!.name;
                (state as AnyDuringMigration)['type'] = this.variable!.type;
            }
            return state;
        } else {
            const state = {};
            if (doFullSerialization) {
                (state as AnyDuringMigration)['name'] = 'none';
                (state as AnyDuringMigration)['type'] = 'Number';
            }
            return state;
        }
    }

    static override fromJson(options: FieldVariableFromJsonConfig): FieldVariable {
        const varName = options.variable;
        // `this` might be a subclass of FieldVariable if that class doesn't
        // override the static fromJson method.
        return new this(varName, undefined, undefined, undefined, options);
    }

    static dropdownCreate(this: FieldVariable): Blockly.MenuOption[] {
        const copy = Object.create(this);
        for (let attribut in this) {
            copy[attribut] = this[attribut];
        }
        // Set variable to something so that the drop down list can
        // be created. Otherwise it errors out
        if (!copy.variable) {
            copy.variable = new Blockly.VariableModel(this.sourceBlock_.workspace, 'x');
        }
        copy.variableMenuGenerator = Blockly.FieldVariable.dropdownCreate;
        const options = copy.variableMenuGenerator(copy);
        if (options.length == 2) {
            return [['No variables available', NONE_AVAILABLE]];
        }
        return options;
    }

    protected override onItemSelected_(menu: Menu, menuItem: MenuItem) {
        const id = menuItem.getValue();
        // Handle special cases.
        if (id === NONE_AVAILABLE) {
            return;
        }
        return super.onItemSelected_(menu, menuItem);
    }

    override fromXml(fieldElement: Element) {
        return super.fromXml(element);
    }

    override loadState(state: AnyDuringMigration) {
        return super.loadState(state);
    }
}

if (window) {
    Blockly.fieldRegistry.register('field_variable_getter', FieldVariableGetter);
}
