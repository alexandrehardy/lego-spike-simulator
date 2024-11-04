import { FieldDropdown } from 'blockly/core';
import { FieldVariable } from 'blockly/core';
import { Menu } from 'blockly/core';
import { MenuItem } from 'blockly/core';
import { VariableModel } from 'blockly/core';

// Monkey patch to get access to some items that are private
// and for which no accessors have been provided.

declare module 'blockly/core' {
    interface FieldDropdown {
        getMenu(): Menu | null;
    }
    interface FieldVariable {
        getVariable(): VariableModel | null;
        getDefaultType(): string;
    }
    interface Menu {
        getItems(): MenuItem[];
    }
    interface MenuItem {
        isChecked(): boolean;
    }
}

interface HasMenu {
    menu_: Menu | null;
}

interface HasMenuItems {
    menuItems: MenuItem[];
}

interface HasChecked {
    checked: boolean;
}

interface HasVariable {
    variable: VariableModel | null;
    defaultType: string;
}

FieldDropdown.prototype.getMenu = function (): Menu | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any as HasMenu).menu_;
};

FieldVariable.prototype.getVariable = function (): VariableModel | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any as HasVariable).variable;
};

FieldVariable.prototype.getDefaultType = function (): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any as HasVariable).defaultType;
};

Menu.prototype.getItems = function (): MenuItem[] {
    // We should copy this, since it is separate to the menu
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any as HasMenuItems).menuItems;
};

MenuItem.prototype.isChecked = function (): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any as HasChecked).checked;
};
