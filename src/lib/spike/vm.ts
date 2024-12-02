export class Node {
    opcode: string;
    blocklyId: string;
    constructor(opcode: string, blocklyId: string) {
        this.opcode = opcode;
        this.blocklyId = blocklyId;
    }
}

export class Statement extends Node {
    constructor(opcode: string, blocklyId: string) {
        super(opcode, blocklyId);
    }
}

export class ActionStatement extends Statement {
    arguments: Expression[];

    constructor(opcode: string, blocklyId: string, args: Expression[]) {
        super(opcode, blocklyId);
        this.arguments = args;
    }
}

export class EventStatement extends Statement {
    arguments: Expression[];
    statements: StatementBlock;

    constructor(opcode: string, blocklyId: string, args: Expression[], statements: StatementBlock) {
        super(opcode, blocklyId);
        this.arguments = args;
        this.statements = statements;
    }
}

export class CallStatement extends ActionStatement {
    name: string;

    constructor(blocklyId: string, name: string, args: Expression[]) {
        super('call', blocklyId, args);
        this.name = name;
    }
}

export class Expression extends Node {
    constructor(opcode: string, blocklyId: string) {
        super(opcode, blocklyId);
    }
}

export class UnaryExpression extends Expression {
    value: Expression;

    constructor(opcode: string, blocklyId: string, value: Expression) {
        super(opcode, blocklyId);
        this.value = value;
    }
}

export class BinaryExpression extends Expression {
    left: Expression;
    right: Expression;

    constructor(opcode: string, blocklyId: string, left: Expression, right: Expression) {
        super(opcode, blocklyId);
        this.left = left;
        this.right = right;
    }
}

export class Value extends Expression {
    value: string;

    constructor(opcode: string, blocklyId: string, value: string) {
        super(opcode, blocklyId);
        this.value = value;
    }
}

export class Variable extends Expression {
    name: string;
    local: boolean;

    constructor(opcode: string, blocklyId: string, name: string, local: boolean) {
        super(opcode, blocklyId);
        this.name = name;
        this.local = local;
    }
}

export class StatementBlock extends Statement {
    statements: Statement[];

    constructor(statements: Statement[]) {
        super('{}', '');
        this.statements = statements;
    }
}

export class ProcedureBlock extends Node {
    name: string;
    arguments: Variable[];
    statements: StatementBlock;

    constructor(blocklyId: string, name: string, args: Variable[], statements: StatementBlock) {
        super('def', blocklyId);
        this.name = name;
        this.arguments = args;
        this.statements = statements;
    }
}

export class ControlStatement extends Statement {
    condition: Expression;
    statement: Statement;
    alternative?: Statement;
    constructor(
        opcode: string,
        blocklyId: string,
        condition: Expression,
        statement: Statement,
        alternative?: Statement
    ) {
        super(opcode, blocklyId);
        this.condition = condition;
        this.statement = statement;
        this.alternative = alternative;
    }
}

export class RepeatStatement extends Statement {
    times: Expression;
    statements: Statement;
    constructor(opcode: string, blocklyId: string, times: Expression, statements: Statement) {
        super(opcode, blocklyId);
        this.times = times;
        this.statements = statements;
    }
}

export class Motor {
    //54696 medium
    //68488 small
    //54675 large
}

export class LightSensor {
    //37308
}

export class UltraSoundSensor {
    //37316
}

export class ForceSensor {
    //37312
}

export class Port {
    type: 'none' | 'force' | 'distance' | 'light' | 'motor';
    motor?: Motor;
    light?: LightSensor;
    ultra?: UltraSoundSensor;
    force?: ForceSensor;
}

export class Hub {
    //67718
    //45601
    leftPressed: boolean;
    rightPressed: boolean;
    screen: string;
    screenBrightness: number;
    ports: Port[];
}

export type Namespace = Record<string, string>;

export class ThreadState {
    stack: Namespace[];
    current: Statement;
    next: Statement | undefined;
    parent: ThreadState | undefined;
}

export class Thread {
    vm: VM;
    stack: Namespace[];
    currentState: ThreadState;

    executeStep() {
    }
}

export class VM {
    hub: Hub;
    globals: Namespace;
    events: Map<string, EventStatement>;
    thread: Map<string, Thread>;

    executeEvent();
    //workspace.getBlockById(id).select()
    //workspace.getBlockById(id).unselect()
}
