import * as Blockly from 'blockly/core';
import { writable } from 'svelte/store';

export interface CompiledCode {
    events: Map<string, EventStatement>;
}

export const codeStore = writable<CompiledCode>({
    events: new Map<string, EventStatement>()
});

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    async execute(thread: Thread) {
        try {
            this.highlight(thread);
            await sleep(1000);
            await this._execute(thread);
        } finally {
            this.removeHighlight(thread);
        }
    }

    async _execute(thread: Thread) {
        console.log('Execute not implemented on...');
        console.log(this);
    }

    highlight(thread: Thread) {
        // Mark the block being executed
        const workspace = thread.vm.workspace;
        if (workspace) {
            const block = workspace.getBlockById(this.blocklyId);
            if (block) {
                block.select();
            }
        }
    }

    removeHighlight(thread: Thread) {
        // Unmark the block again
        const workspace = thread.vm.workspace;
        if (workspace) {
            const block = workspace.getBlockById(this.blocklyId);
            if (block) {
                block.unselect();
            }
        }
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

    override async _execute(thread: Thread) {
        await this.statements.execute(thread);
    }

    satisfied(thread: Thread): boolean {
        if (this.opcode == 'event_whenbroadcastreceived') {
            console.log(`Need code ${this.opcode}`);
        } else if (this.opcode == 'flipperevents_whenButton') {
            console.log(`Need code ${this.opcode}`);
        } else if (this.opcode == 'flipperevents_whenColor') {
            console.log(`Need code ${this.opcode}`);
        } else if (this.opcode == 'flipperevents_whenCondition') {
            console.log(`Need code ${this.opcode}`);
        } else if (this.opcode == 'flipperevents_whenDistance') {
            console.log(`Need code ${this.opcode}`);
        } else if (this.opcode == 'flipperevents_whenGesture') {
            console.log(`Need code ${this.opcode}`);
        } else if (this.opcode == 'flipperevents_whenOrientation') {
            console.log(`Need code ${this.opcode}`);
        } else if (this.opcode == 'flipperevents_whenPressed') {
            console.log(`Need code ${this.opcode}`);
        } else if (this.opcode == 'flipperevents_whenProgramStarts') {
            return thread.vm.first;
        } else if (this.opcode == 'flipperevents_whenTilted') {
            console.log(`Need code ${this.opcode}`);
        } else if (this.opcode == 'flipperevents_whenTimer') {
            console.log(`Need code ${this.opcode}`);
        }
        return false;
    }
}

export class CallStatement extends ActionStatement {
    name: string;

    constructor(blocklyId: string, name: string, args: Expression[]) {
        super('call', blocklyId, args);
        this.name = name;
    }

    override async _execute(thread: Thread) {}
}

export class Expression extends Node {
    constructor(opcode: string, blocklyId: string) {
        super(opcode, blocklyId);
    }

    evaluate(thread: Thread): TypedValue {
        console.log('Expression not implemented ...');
        console.log(this);
        return new StringValue('');
    }
}

export class UnaryExpression extends Expression {
    value: Expression;

    constructor(opcode: string, blocklyId: string, value: Expression) {
        super(opcode, blocklyId);
        this.value = value;
    }

    override evaluate(thread: Thread): TypedValue {
        const value = this.value.evaluate(thread);
        if (this.opcode == 'lstlen') {
            return new NumberValue(value.getList().length);
        } else if (this.opcode == 'len') {
            return new NumberValue(value.getString().length);
        } else if (this.opcode == 'not') {
            return new BooleanValue(!value.getBoolean());
        } else if (this.opcode == 'round') {
            return new NumberValue(Math.round(value.getNumber()));
        } else if (this.opcode == 'op_abs') {
            return new NumberValue(Math.abs(value.getNumber()));
        } else if (this.opcode == 'op_floor') {
            return new NumberValue(Math.floor(value.getNumber()));
        } else if (this.opcode == 'op_ceiling') {
            return new NumberValue(Math.ceil(value.getNumber()));
        } else if (this.opcode == 'op_sqrt') {
            return new NumberValue(Math.sqrt(value.getNumber()));
        } else if (this.opcode == 'op_sin') {
            return new NumberValue(Math.sin(value.getNumber()));
        } else if (this.opcode == 'op_cos') {
            return new NumberValue(Math.cos(value.getNumber()));
        } else if (this.opcode == 'op_tan') {
            return new NumberValue(Math.tan(value.getNumber()));
        } else if (this.opcode == 'op_asin') {
            return new NumberValue(Math.asin(value.getNumber()));
        } else if (this.opcode == 'op_acos') {
            return new NumberValue(Math.acos(value.getNumber()));
        } else if (this.opcode == 'op_atan') {
            return new NumberValue(Math.sqrt(value.getNumber()));
        } else if (this.opcode == 'op_ln') {
            return new NumberValue(Math.log(value.getNumber()));
        } else if (this.opcode == 'op_log') {
            return new NumberValue(Math.log10(value.getNumber()));
        } else if (this.opcode == 'op_e ^') {
            return new NumberValue(Math.exp(value.getNumber()));
        } else if (this.opcode == 'op_10 ^') {
            return new NumberValue(Math.pow(10, value.getNumber()));
        }
        return super.evaluate(thread);
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

    override evaluate(thread: Thread): TypedValue {
        const left = this.left.evaluate(thread);
        const right = this.right.evaluate(thread);
        if (this.opcode == 'indexof') {
            const item = left.getString();
            const l = right.getList();
            return new NumberValue(l.findIndex((x) => x == item));
        } else if (this.opcode == 'item') {
            const index = left.getNumber();
            const l = right.getList();
            if (index < 0 || index >= l.length) {
                return new StringValue('');
            }
            return new StringValue(l[index]);
        } else if (this.opcode == 'contains') {
            const item = left.getString();
            const l = right.getList();
            return new BooleanValue(l.findIndex((x) => x == item) >= 0);
        } else if (this.opcode == '+') {
            return new NumberValue(left.getNumber() + right.getNumber());
        } else if (this.opcode == '-') {
            return new NumberValue(left.getNumber() - right.getNumber());
        } else if (this.opcode == '*') {
            return new NumberValue(left.getNumber() * right.getNumber());
        } else if (this.opcode == '/') {
            return new NumberValue(left.getNumber() / right.getNumber());
        } else if (this.opcode == '%') {
            return new NumberValue(left.getNumber() % right.getNumber());
        } else if (this.opcode == '==') {
            if (left.type == 'string') {
                return new BooleanValue(left.getString() === right.getString());
            } else {
                return new BooleanValue(left.getNumber() === right.getNumber());
            }
        } else if (this.opcode == '>') {
            return new BooleanValue(left.getNumber() > right.getNumber());
        } else if (this.opcode == '<') {
            return new BooleanValue(left.getNumber() < right.getNumber());
        } else if (this.opcode == 'and') {
            return new BooleanValue(left.getBoolean() && right.getBoolean());
        } else if (this.opcode == 'or') {
            return new BooleanValue(left.getBoolean() || right.getBoolean());
        } else if (this.opcode == 'in') {
            return new BooleanValue(right.getString().includes(left.getString()));
        } else if (this.opcode == 'join') {
            return new StringValue(left.getString() + right.getString());
        } else if (this.opcode == 'letter') {
            const index = left.getNumber();
            const s = right.getString();
            if (index < 0 || index >= s.length) {
                return new StringValue('');
            }
            return new StringValue(s.charAt(index));
        } else if (this.opcode == 'rnd') {
            const min = left.getNumber();
            const max = right.getNumber();
            if (min >= max) {
                return new NumberValue(max);
            }
            // TODO: If integers, then this should be an integer
            return new NumberValue(Math.random() * (max - min) + min);
        }
        return super.evaluate(thread);
    }
}

export class Value extends Expression {
    value: string;

    constructor(opcode: string, blocklyId: string, value: string) {
        super(opcode, blocklyId);
        this.value = value;
    }

    override evaluate(thread: Thread): TypedValue {
        // TODO: Make it the correct type based on block context
        return new StringValue(this.value);
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

    override evaluate(thread: Thread): TypedValue {
        return thread.getVar(this.name, this.local);
    }
}

export class StatementBlock extends Statement {
    statements: Statement[];

    constructor(statements: Statement[]) {
        super('{}', '');
        this.statements = statements;
    }

    override async _execute(thread: Thread) {
        this.removeHighlight(thread);
        for (const statement of this.statements) {
            await statement.execute(thread);
        }
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

    override async _execute(thread: Thread) {}
}

export class RepeatStatement extends Statement {
    times: Expression;
    statements: Statement;
    constructor(opcode: string, blocklyId: string, times: Expression, statements: Statement) {
        super(opcode, blocklyId);
        this.times = times;
        this.statements = statements;
    }

    override async _execute(thread: Thread) {}
}

export class Motor {
    //54696 medium
    //68488 small
    //54675 large
    constructor() {}
}

export class LightSensor {
    //37308
    constructor() {}
}

export class UltraSoundSensor {
    //37316
    constructor() {}
}

export class ForceSensor {
    //37312
    constructor() {}
}

export class Port {
    type: 'none' | 'force' | 'distance' | 'light' | 'motor';
    motor?: Motor;
    light?: LightSensor;
    ultra?: UltraSoundSensor;
    force?: ForceSensor;

    constructor(type: 'none' | 'force' | 'distance' | 'light' | 'motor') {
        this.type = type;
    }
}

export class Hub {
    //67718
    //45601
    leftPressed: boolean;
    rightPressed: boolean;
    screen: string;
    screenBrightness: number;
    ports: Record<string, Port>;

    constructor() {
        this.leftPressed = false;
        this.rightPressed = false;
        this.screen = '0000000000000000000000000';
        this.screenBrightness = 0;
        this.ports = {
            A: new Port('none'),
            B: new Port('none'),
            C: new Port('none'),
            D: new Port('none'),
            E: new Port('none'),
            F: new Port('none')
        };
    }
}

export class TypedValue {
    type: string;

    constructor(type: string) {
        this.type = type;
    }

    getString(): string {
        return '';
    }

    getNumber(): number {
        return 0;
    }

    getBoolean(): boolean {
        return false;
    }

    getList(): string[] {
        return [];
    }
}

export class StringValue extends TypedValue {
    value: string;
    constructor(value: string) {
        super('string');
        this.value = value;
    }

    override getString(): string {
        return this.value;
    }

    override getNumber(): number {
        return +this.value;
    }

    override getBoolean(): boolean {
        return this.value === 'true';
    }

    override getList(): string[] {
        return [this.value];
    }
}

export class NumberValue extends TypedValue {
    value: number;
    constructor(value: number) {
        super('number');
        this.value = value;
    }

    override getString(): string {
        return this.value.toString();
    }

    override getNumber(): number {
        return this.value;
    }

    override getBoolean(): boolean {
        return this.value !== 0;
    }

    override getList(): string[] {
        return [this.value.toString()];
    }
}

export class BooleanValue extends TypedValue {
    value: boolean;
    constructor(value: boolean) {
        super('boolean');
        this.value = value;
    }

    override getString(): string {
        return this.value.toString();
    }

    override getNumber(): number {
        return this.value ? 1 : 0;
    }

    override getBoolean(): boolean {
        return this.value;
    }

    override getList(): string[] {
        return [this.value.toString()];
    }
}

export class ListValue extends TypedValue {
    value: string[];
    constructor(value: string[]) {
        super('list');
        this.value = value;
    }

    override getString(): string {
        return this.value.toString();
    }

    override getNumber(): number {
        return 0;
    }

    override getBoolean(): boolean {
        return this.value.length > 0;
    }

    override getList(): string[] {
        return this.value;
    }
}

export type Namespace = Record<string, TypedValue>;

export type Canceller = (obj: object) => void;

export class ThreadStopped extends Error {}

export class Thread {
    vm: VM;
    globals: Namespace;
    locals: Namespace;
    state: 'running' | 'stopped';
    cancels: Map<number, Canceller>;
    nextCancel: number;
    event: EventStatement;

    constructor(vm: VM, event: EventStatement, globals: Namespace) {
        this.vm = vm;
        this.globals = globals;
        this.locals = {};
        this.state = 'stopped';
        this.nextCancel = 0;
        this.cancels = new Map<number, Canceller>();
        this.event = event;
    }

    async _execute() {
        try {
            await this.event.execute(this);
        } catch (e) {
            if (e instanceof ThreadStopped) {
                // all good
            } else if (e instanceof Error) {
                console.error(e, e.stack);
            } else {
                console.log(e);
            }
        }
    }

    checkConditionAndExecute() {
        if (this.state === 'running') {
            return;
        }
        if (this.event.satisfied(this)) {
            this.execute();
        }
    }

    execute() {
        if (this.state === 'running') {
            // Already running
            return;
        }
        this.locals = {};
        this.state = 'running';
        this._execute();
    }

    getVar(id: string, local: boolean): TypedValue {
        if (local) {
            return this.locals[id]!;
        } else {
            return this.globals[id]!;
        }
    }

    setVar(id: string, value: TypedValue, local: boolean) {
        if (local) {
            this.locals[id] = value;
        } else {
            this.globals[id] = value;
        }
    }

    cancellable<T>(promise: Promise<T>): Promise<T> {
        const id = this.nextCancel;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const threadThis = this;
        this.nextCancel++;

        const newPromise = new Promise<T>((resolve, reject) => {
            try {
                threadThis.cancels.set(id, reject);
                promise.then(
                    (value) => {
                        threadThis.removeCancel(id);
                        resolve(value);
                    },
                    (reason) => {
                        threadThis.removeCancel(id);
                        reject(reason);
                    }
                );
            } catch (e) {
                threadThis.removeCancel(id);
                reject(e);
            }
        });
        return newPromise;
    }

    removeCancel(id: number) {
        this.cancels.delete(id);
    }

    stop() {
        if (this.state === 'stopped') {
            return;
        }
        this.state = 'stopped';
        const cancels = this.cancels;
        // Clear the map, so we don't cancel twice
        this.cancels = new Map<number, Canceller>();
        for (const entry of Array.from(cancels.entries())) {
            const value = entry[1];
            value(new ThreadStopped());
        }
    }
}

export class VM {
    hub: Hub;
    globals: Namespace;
    events: Map<string, EventStatement>;
    threads: Map<string, Thread>;
    workspace: Blockly.WorkspaceSvg | undefined;
    state: 'running' | 'stopped';
    first: boolean;

    constructor(
        hub: Hub,
        globals: Namespace,
        events: Map<string, EventStatement>,
        workspace: Blockly.WorkspaceSvg | undefined
    ) {
        this.hub = hub;
        this.globals = globals;
        this.events = events;
        this.threads = new Map<string, Thread>();
        this.workspace = workspace;
        this.state = 'running';
        this.first = true;
        for (const entry of Array.from(events.entries())) {
            const key = entry[0];
            const event = entry[1];
            this.threads.set(key, new Thread(this, event, this.globals));
        }
    }

    runThreads() {
        for (const entry of Array.from(this.threads.entries())) {
            const thread = entry[1];
            thread.checkConditionAndExecute();
        }
        this.first = false;
    }

    stop() {
        this.state = 'stopped';
        for (const entry of Array.from(this.threads.entries())) {
            const thread = entry[1];
            thread.stop();
        }
    }

    start() {
        this.state = 'running';
        this.first = true;
        this.runThreads();
    }
}
