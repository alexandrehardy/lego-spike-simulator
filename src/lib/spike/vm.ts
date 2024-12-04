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

    execute(): 'waiting' | 'stop' | 'done' {
        //workspace.getBlockById(id).select()
        //workspace.getBlockById(id).unselect()
        return 'done';
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

    evaluate(): string {
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
    constructor() {
    }
}

export class LightSensor {
    //37308
    constructor() {
    }
}

export class UltraSoundSensor {
    //37316
    constructor() {
    }
}

export class ForceSensor {
    //37312
    constructor() {
    }
}

export class Port {
    type: 'none' | 'force' | 'distance' | 'light' | 'motor';
    motor?: Motor;
    light?: LightSensor;
    ultra?: UltraSoundSensor;
    force?: ForceSensor;

    constructor() {
    }
}

export class Hub {
    //67718
    //45601
    leftPressed: boolean;
    rightPressed: boolean;
    screen: string;
    screenBrightness: number;
    ports: Port[];

    constructor() {
    }
}

export type Namespace = Record<string, string>;

export class ThreadState {
    thread: Thread;
    block: StatementBlock;
    ip: number;
    state: 'running' | 'stopped' | 'waiting';

    constructor(block: StatementBlock, thread: Thread) {
        this.block = block;
        this.ip = 0;
        this.thread = thread;
        this.state = 'running';
        if (block.statements.length == 0) {
            this.state = 'stopped';
        }
    }

    execute() {
        if (this.state == 'stopped') {
            return;
        }
        if (this.ip >= block.statements.length) {
            this.state = 'stopped';
            return;
        }
        const statement = block.statements[this.ip];
        const result = statement.execute();
        if (result === 'done') {
            this.ip++;
            if (this.ip >= block.statements.length) {
                this.state = 'stopped';
                return;
            }
        } else if (result === 'stop') {
            this.state = 'stopped';
            this.thread.stop();
        }
        return;
    }
}

export class Thread {
    vm: VM;
    globals: Namespace;
    stack: Namespace[];
    executionStack: ThreadState[];
    currentState?: ThreadState;
    state: 'running' | 'stopped';

    constructor(vm: VM, event: EventStatement, globals: Namespace) {
        this.vm = vm;
        this.globals = globals;
        this.stack = [];
        this.executionStack = [];
        this.currentState = new ThreadState(event.statements, this);
        this.state = 'running';
    }

    executeStep(): bool {
        if (this.state === 'stopped') {
            return false;
        }

        // returns true if running, false if complete
        while (this.currentState && this.currentState.state === 'running') {
            const state = this.currentState;
            state.execute();
            if (this.state === 'stopped') {
                break;
            }
            if (state.state === 'stopped') {
                // A state should never set to stopped and modify
                // currentState through pushState. That will
                // break things
                this.currentState = executionStack.pop();
            }
        }
        if (this.state === 'stopped') {
            return false;
        }
        if (!this.currentState) {
            return false;
        }
        if (this.currentState === undefined) {
            this.state = 'stopped';
            return false;
        }
        return true;
    }

    pushState(state: ThreadState) {
        if (this.currentState) {
            this.executionStack.push(this.currentState);
        }
        this.currentState = state;
    }

    pushStack() {
        this.stack.push({});
    }

    popStack() {
        this.stack.pop();
    }

    getVar(id: string, local: boolean): string {
        if (local) {
            for (let i=this.stack.length-1; i>=0; i--) {
                const value = this.stack[i][id];
                if (value !== undefined) {
                    return value;
                }
            }
            return this.globals[id]!;
        } else {
            return this.globals[id]!;
        }
    }

    setVar(id:string, value: string, local:boolean) {
        if (local) {
            if (this.stack.length > 0) {
                this.stack[this.stack.length - 1][id] = value;
            } else {
                this.globals[id] = value;
            }
        } else {
            this.globals[id] = value;
        }
    }

    stop() {
        state = 'stopped';
    }
}

export class VM {
    hub: Hub;
    globals: Namespace;
    events: Map<string, EventStatement>;
    threads: Map<string, Thread>;

    constructor(hub: Hub, globals: Namespace, events: Map<string, EventStatement>) {
        this.hub = hub;
        this.globals = globals;
        this.events = events;
        this.threads = new Map<string, Thread>();
    }

    scheduleEvent(id: string) {
        // We should already know that this should be executed
        const thread = threads.get(id);
        if (thread) {
            // already executing
            return;
        }
        const event = events.get(id);
        if (event) {
            threads.set(id, new Thread(this, event, this.globals));
        }
    }

    execute() {
        const done: string[] = [];
        for (const entry of Array.from(this.threads.entries())) {
            const key = entry[0];
            const thread = entry[1];
            thread.executeStep();
        }
    }
}
