import * as Blockly from 'blockly/core';
// Patch blockly to get access to private members
import '$lib/blockly/patch';

/**
 * Class for a variable's dropdown field.
 */

const NONE_AVAILABLE = 'NONE_AVAILABLE';

interface FieldVariableGetterConfig extends Blockly.FieldVariableConfig {
    fixed?: bool;
}

interface FieldVariableGetterFromJsonConfig extends FieldVariableGetterConfig {
    variable?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDuringMigration = any;

export class FieldVariableGetter extends Blockly.FieldVariable {
    protected fixed: bool = false;
    constructor(
        varName: string | null | typeof Blockly.Field.SKIP_SETUP,
        validator?: Blockly.FieldVariableValidator,
        variableTypes?: string[],
        defaultType?: string,
        config?: Blockly.FieldVariableGetterConfig
    ) {
        super(varName, validator, variableTypes, defaultType, config);
        this.menuGenerator_ = FieldVariableGetter.dropdownCreate as Blockly.MenuGenerator;
        if (config.fixed !== undefined) {
            this.fixed = config.fixed;
        }
    }

    override initModel() {
        const block = this.getSourceBlock();
        if (!block) {
            throw new Blockly.UnattachedFieldError();
        }
        if (this.getVariable()) {
            return; // Initialization already happened.
        }
        const variable = Blockly.Variables.getVariable(
            block.workspace,
            null,
            this.defaultVariableName,
            this.getDefaultType()
        );
        if (variable) {
            // Don't call setValue because we don't want to cause a rerender.
            this.doValueUpdate_(variable.getId());
        }
    }

    override toXml(fieldElement: Element): Element {
        // Make sure the variable is initialized.
        this.initModel();

        const variable = this.getVariable();
        if (variable) {
            fieldElement.id = variable.getId();
            fieldElement.textContent = variable.name;
            if (variable.type) {
                fieldElement.setAttribute('variabletype', variable.type);
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
        const variable = this.getVariable();
        if (variable) {
            const state = { id: variable!.getId() };
            if (doFullSerialization) {
                (state as AnyDuringMigration)['name'] = variable!.name;
                (state as AnyDuringMigration)['type'] = variable!.type;
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

    static override fromJson(
        options: Blockly.FieldVariableGetterFromJsonConfig
    ): Blockly.FieldVariable {
        const varName = options.variable;
        // `this` might be a subclass of FieldVariable if that class doesn't
        // override the static fromJson method.
        if (varName === undefined) {
            return new this(null, undefined, undefined, undefined, options);
        } else {
            return new this(varName, undefined, undefined, undefined, options);
        }
    }

    static dropdownCreate(this: FieldVariableGetter): Blockly.MenuOption[] {
        const copy = Object.create(this);

        if (!this.sourceBlock_) {
            return [];
        }

        // Set variable to something so that the drop down list can
        // be created. Otherwise it errors out
        if (!copy.variable) {
            copy.variable = new Blockly.VariableModel(this.sourceBlock_!.workspace, 'x');
        }
        copy.variableMenuGenerator = Blockly.FieldVariable.dropdownCreate;
        const options = copy.variableMenuGenerator(copy);
        if (options.length == 2) {
            return [['No variables available', NONE_AVAILABLE]];
        }
        return options;
    }

    protected override onItemSelected_(menu: Blockly.Menu, menuItem: Blockly.MenuItem) {
        const id = menuItem.getValue();
        // Handle special cases.
        if (id === NONE_AVAILABLE) {
            return;
        }
        return super.onItemSelected_(menu, menuItem);
    }

    override fromXml(fieldElement: Element) {
        return super.fromXml(fieldElement);
    }

    override loadState(state: AnyDuringMigration) {
        return super.loadState(state);
    }

    protected override createTextArrow_() {
        if (!this.fixed) {
            super.createTextArrow_();
        }
    }

    protected override createSVGArrow_() {
        if (!this.fixed) {
            super.createSVGArrow_();
        }
    }

    protected override shouldAddBorderRect_(): boolean {
        if (!this.fixed) {
            return super.shouldAddBorderRect_();
        }
        return false;
    }
}

if (window) {
    Blockly.fieldRegistry.register('field_variable_getter', FieldVariableGetter);
}
