import * as Blockly from 'blockly/core';
// Patch blockly to get access to private members
import '$lib/blockly/patch';
import * as variableFlyout from '$lib/blockly/variable_flyout';

/**
 * Class for a variable's dropdown field.
 */

const NONE_AVAILABLE = 'NONE_AVAILABLE';
const ADD_NEW_VARIABLE = 'ADD_NEW_VARIABLE';

interface FieldVariableGetterConfig extends Blockly.FieldVariableConfig {
    fixed?: boolean;
    create?: boolean;
}

interface FieldVariableGetterFromJsonConfig extends FieldVariableGetterConfig {
    variable?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDuringMigration = any;

export class FieldVariableGetter extends Blockly.FieldVariable {
    protected fixed: boolean = false;
    protected create: boolean = false;
    constructor(
        varName: string | null | typeof Blockly.Field.SKIP_SETUP,
        validator?: Blockly.FieldVariableValidator,
        variableTypes?: string[],
        defaultType?: string,
        config?: FieldVariableGetterConfig
    ) {
        super(varName, validator, variableTypes, defaultType, config);
        this.menuGenerator_ = FieldVariableGetter.dropdownCreate as Blockly.MenuGenerator;
        if (config && config.fixed !== undefined) {
            this.fixed = config.fixed;
        }
        if (config && config.create !== undefined) {
            this.create = config.create;
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

    static override fromJson(options: FieldVariableGetterFromJsonConfig): FieldVariableGetter {
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
        if (this.create) {
            options.push([`Create ${this.getDefaultType()} variable...`, ADD_NEW_VARIABLE]);
        }
        if (options.length == 2) {
            return [['No variables available', NONE_AVAILABLE]];
        }
        return options;
    }

    protected override onItemSelected_(menu: Blockly.Menu, menuItem: Blockly.MenuItem) {
        const block = this.getSourceBlock();
        if (!block) {
            throw new Blockly.UnattachedFieldError();
        }
        const workspace = block.workspace;

        function onCreateVariable(v: variableFlyout.VariableDefinition) {
            const existing = Blockly.Variables.nameUsedWithAnyType(v.name, workspace);
            if (!existing) {
                // No conflict
                workspace.createVariable(v.name, v.type);
                return true;
            }

            let msg;
            if (existing.type === v.type) {
                msg = Blockly.Msg['VARIABLE_ALREADY_EXISTS'].replace('%1', existing.name);
            } else {
                msg = Blockly.Msg['VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE'];
                msg = msg.replace('%1', existing.name).replace('%2', existing.type);
            }
            Blockly.dialog.alert(msg);
            return false;
        }

        const id = menuItem.getValue();
        // Handle special cases.
        if (id === NONE_AVAILABLE) {
            return;
        }
        if (id === ADD_NEW_VARIABLE) {
            if (variableFlyout.variableCreateDialog) {
                variableFlyout.variableCreateDialog(this.getDefaultType(), onCreateVariable);
            }
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

    public override shouldAddBorderRect_(): boolean {
        if (!this.fixed) {
            return super.shouldAddBorderRect_();
        }
        return false;
    }
}

if (window) {
    Blockly.fieldRegistry.register('field_variable_getter', FieldVariableGetter);
}
