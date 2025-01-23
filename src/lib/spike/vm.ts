import * as Blockly from 'blockly/core';
import { writable } from 'svelte/store';
import { mbitfont } from '$lib/spike/font';
import { SoundLibrary } from '$lib/blockly/audio';
import { hexColor } from '$lib/ldraw/components';

export type PortType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export const allPorts: PortType[] = ['A', 'B', 'C', 'D', 'E', 'F'];
export const fontEmbedsSpace = false;
let stepSleep = 1000;
let timeFactor = 1.0;

const colours: Record<string, string> = {
    '1': '#901f76', // Bright reddish violet // Magenta
    '3': '#1e5aa8', // Blue
    '4': '#68c3e2', // Medium Azure
    '6': '#00852b', // Green
    '7': '#fac80a', // Yellow
    '9': '#b40000', // Red
    '10': '#f4f4f4', // White
    '0': '#000000', // Black
    '-1': '#330033'
};

const coloursRev: Record<string, string> = {};
coloursRev[colours['1']] = '1';
coloursRev[colours['3']] = '3';
coloursRev[colours['4']] = '4';
coloursRev[colours['6']] = '6';
coloursRev[colours['7']] = '7';
coloursRev[colours['9']] = '9';
coloursRev[colours['10']] = '10';
coloursRev[colours['0']] = '0';

export interface CompiledCode {
    events: Map<string, EventStatement>;
    procedures: Map<string, ProcedureBlock>;
}

export const codeStore = writable<CompiledCode>({
    events: new Map<string, EventStatement>(),
    procedures: new Map<string, ProcedureBlock>()
});

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function vmSleep(ms: number): Promise<void> {
    return sleep(Math.round(ms * timeFactor));
}

export function setStepSleep(time: number) {
    if (time > 0) {
        stepSleep = time;
    } else {
        stepSleep = 0;
    }
}

export function setTimeFactor(factor: number) {
    if (factor < 0.001) {
        timeFactor = 0.001;
    } else if (factor > 10) {
        timeFactor = 10;
    } else {
        timeFactor = factor;
    }
}

export function getStepSleep() {
    return stepSleep;
}

export function getTimeFactor() {
    return timeFactor;
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
        while (thread.paused) {
            // We should do a callback, but this should be rare
            // so we poll at 50ms interval
            await sleep(50);
        }
        if (thread.state == 'stopped') {
            return;
        }
        try {
            this.highlight(thread);
            await sleep(stepSleep);
            await this._execute(thread);
        } finally {
            this.removeHighlight(thread);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    async execute_bargraphmonitor(thread: Thread, op: string) {
        return super._execute(thread);
    }
    async execute_data(thread: Thread, op: string) {
        if (op == 'setvariableto') {
            const variable = this.arguments[0] as Variable;
            const value = this.arguments[1].evaluate(thread);
            thread.setVar(variable.name, value, variable.local);
        } else if (op == 'changevariableby') {
            const variable = this.arguments[0] as Variable;
            const oldValue = variable.evaluate(thread);
            const value = this.arguments[1].evaluate(thread);
            thread.setVar(
                variable.name,
                new NumberValue(oldValue.getNumber() + value.getNumber()),
                variable.local
            );
        } else if (op == 'addtolist') {
            const variable = this.arguments[1] as Variable;
            const oldValue = variable.evaluate(thread);
            const value = this.arguments[0].evaluate(thread);
            const list = oldValue.getList();
            list.push(value.getString());
            thread.setVar(variable.name, new ListValue(list), variable.local);
        } else if (op == 'deleteoflist') {
            const variable = this.arguments[1] as Variable;
            const list = variable.evaluate(thread).getList();
            const index = this.arguments[0].evaluate(thread).getNumber();
            if (index < 1) {
                return;
            }
            if (index > list.length) {
                return;
            }
            const newList = list.toSpliced(index - 1, 1);
            thread.setVar(variable.name, new ListValue(newList), variable.local);
        } else if (op == 'deletealloflist') {
            const variable = this.arguments[0] as Variable;
            thread.setVar(variable.name, new ListValue([]), variable.local);
        } else if (op == 'insertatlist') {
            const variable = this.arguments[2] as Variable;
            const list = variable.evaluate(thread).getList();
            const index = this.arguments[0].evaluate(thread).getNumber();
            if (index < 1) {
                return;
            }
            if (index > list.length) {
                return;
            }
            const value = this.arguments[1].evaluate(thread).getString();
            const newList = list.toSpliced(index - 1, 0, value);
            thread.setVar(variable.name, new ListValue(newList), variable.local);
        } else if (op == 'replaceitemoflist') {
            const variable = this.arguments[2] as Variable;
            const list = variable.evaluate(thread).getList();
            const index = this.arguments[0].evaluate(thread).getNumber();
            if (index < 1) {
                return;
            }
            if (index > list.length) {
                return;
            }
            const value = this.arguments[1].evaluate(thread).getString();
            const newList = list.toSpliced(index - 1, 1, value);
            thread.setVar(variable.name, new ListValue(newList), variable.local);
        } else {
            return super._execute(thread);
        }
    }
    async execute_displaymonitor(thread: Thread, op: string) {
        return super._execute(thread);
    }
    async execute_event(thread: Thread, op: string) {
        return super._execute(thread);
    }
    async execute_flippercontrol(thread: Thread, op: string) {
        if (op == 'stop') {
            thread.stop();
            return;
        } else if (op == 'stopOtherStacks') {
            thread.vm.stopAllThreadsExcept(thread.id);
            return;
        }
        return super._execute(thread);
    }
    async execute_flipperlight(thread: Thread, op: string) {
        if (op == 'lightDisplayImageOn') {
            const value = this.arguments[0].evaluate(thread);
            thread.vm.hub.setScreen(value.getString());
        } else if (op == 'lightDisplayImageOnForTime') {
            const screen = this.arguments[0].evaluate(thread);
            const duration = this.arguments[1].evaluate(thread);
            thread.vm.hub.setScreen(screen.getString());
            const delay = duration.getNumber();
            if (delay > 0) {
                await thread.cancellable(vmSleep(delay * 1000));
            }
            thread.vm.hub.setScreen('0000000000000000000000000');
        } else if (op == 'lightDisplayOff') {
            thread.vm.hub.setScreen('0000000000000000000000000');
        } else if (op == 'lightDisplayText') {
            const textValue = this.arguments[0].evaluate(thread);
            const text = textValue.getString();
            let row0 = '';
            let row1 = '';
            let row2 = '';
            let row3 = '';
            let row4 = '';
            thread.vm.hub.setScreen('0000000000000000000000000');
            for (let i = 0; i < text.length; i++) {
                let char = mbitfont[text.charAt(i)];
                if (!char) {
                    char = '0000000000000000000000000';
                }
                if (i != 0 && !fontEmbedsSpace) {
                    // Add a space between characters
                    row0 += '0';
                    row1 += '0';
                    row2 += '0';
                    row3 += '0';
                    row4 += '0';
                }
                row0 += char.substring(0, 5);
                row1 += char.substring(5, 10);
                row2 += char.substring(10, 15);
                row3 += char.substring(15, 20);
                row4 += char.substring(20, 25);
            }
            // Add a screen of buffer, to let the text
            // flow off the screen
            row0 += '00000';
            row1 += '00000';
            row2 += '00000';
            row3 += '00000';
            row4 += '00000';
            // iterate through rows to scroll text
            // with a short delay between
            let offset = 0;
            while (offset < row0.length - 4) {
                const screen =
                    row0.substring(offset, offset + 5) +
                    row1.substring(offset, offset + 5) +
                    row2.substring(offset, offset + 5) +
                    row3.substring(offset, offset + 5) +
                    row4.substring(offset, offset + 5);
                offset++;
                thread.vm.hub.setScreen(screen);
                await thread.cancellable(vmSleep(200));
            }
        } else if (op == 'lightDisplaySetBrightness') {
            return super._execute(thread);
        } else if (op == 'lightDisplaySetOrientation') {
            return super._execute(thread);
        } else if (op == 'lightDisplayRotate') {
            return super._execute(thread);
        } else if (op == 'lightDisplaySetPixel') {
            return super._execute(thread);
        } else if (op == 'ultrasonicLightUp') {
            return super._execute(thread);
        } else if (op == 'centerButtonLight') {
            const colourIndex = this.arguments[0].evaluate(thread).getString();
            const colourMap: Record<string, string> = {
                '1': '#e700a7',
                '2': '#c061f1',
                '3': '#0090f5',
                '4': '#77e8ff',
                '5': '#00cb54',
                '6': '#00a845',
                '7': '#f5da5d',
                '8': '#fcac00',
                '9': '#ff000c',
                '10': '#ffffff',
                '0': '#571cc1'
            };
            const colour = colourMap[colourIndex];
            if (colour) {
                thread.vm.hub.setButtonColour(colour);
            }
            return;
        } else {
            return super._execute(thread);
        }
    }
    async execute_flippermoremotor(thread: Thread, op: string) {
        if (op == 'motorGoToRelativePosition') {
        } else if (op == 'motorSetAcceleration') {
        } else if (op == 'motorSetStopMethod') {
        } else if (op == 'motorStartPower') {
        }
        return super._execute(thread);
    }
    async execute_flippermoremove(thread: Thread, op: string) {
        return super._execute(thread);
    }
    async execute_flippermoresensors(thread: Thread, op: string) {
        return super._execute(thread);
    }
    async execute_flippermotor(thread: Thread, op: string) {
        if (op == 'motorGoDirectionToPosition') {
        } else if (op == 'motorSetSpeed') {
        } else if (op == 'motorStartDirection') {
        } else if (op == 'motorStop') {
        } else if (op == 'motorTurnForDirection') {
        }
        return super._execute(thread);
    }
    async execute_flippermove(thread: Thread, op: string) {
        if (op == 'move') {
        } else if (op == 'movementSpeed') {
        } else if (op == 'setDistance') {
        } else if (op == 'setMovementPair') {
        } else if (op == 'startMove') {
        } else if (op == 'stopMove') {
        } else if (op == 'startSteer') {
        } else if (op == 'steer') {
        }
        return super._execute(thread);
    }
    async execute_flippermusic(thread: Thread, op: string) {
        return super._execute(thread);
    }
    async execute_flippersensors(thread: Thread, op: string) {
        if (op == 'resetTimer') {
            thread.vm.resetTimer();
            return;
        } else if (op == 'resetYaw') {
        }
        return super._execute(thread);
    }
    async execute_flippersound(thread: Thread, op: string) {
        if (op == 'playSound') {
            const sourceString = this.arguments[0].evaluate(thread).getString();
            if (!sourceString) {
                return;
            }
            const source = JSON.parse(sourceString);
            if (!source?.name) {
                return;
            }
            // TODO: Support recordings and sound embedded in save files.
            const id = SoundLibrary.get(source.name);
            thread.vm.audio.pause();
            thread.vm.audio.defaultPlaybackRate = timeFactor;
            thread.vm.audio.src = `https://spike.legoeducation.com/sounds/${id}.mp3`;
            thread.vm.audio.play();
        } else if (op == 'playSoundUntilDone') {
            const sourceString = this.arguments[0].evaluate(thread).getString();
            if (!sourceString) {
                return;
            }
            const source = JSON.parse(sourceString);
            if (!source?.name) {
                return;
            }
            // TODO: Support recordings and sound embedded in save files.
            const id = SoundLibrary.get(source.name);
            thread.vm.audio.pause();
            thread.vm.audio.defaultPlaybackRate = timeFactor;
            thread.vm.audio.src = `https://spike.legoeducation.com/sounds/${id}.mp3`;
            thread.vm.audio.play();
            while (!thread.vm.audio.ended) {
                await thread.cancellable(sleep(100));
            }
        } else if (op == 'beepForTime') {
            const note = this.arguments[0].evaluate(thread).getNumber();
            const duration = this.arguments[1].evaluate(thread).getNumber();
            thread.vm.stopNote();
            const freq = Math.pow(2.0, (note - 69.0) / 12.0) * 440;
            thread.vm.startNote(freq, duration * timeFactor);
            try {
                await thread.cancellable(vmSleep(duration * 1000));
            } finally {
                thread.vm.stopNote();
            }
        } else if (op == 'beep') {
            const note = this.arguments[0].evaluate(thread).getNumber();
            thread.vm.stopNote();
            const freq = Math.pow(2.0, (note - 69.0) / 12.0) * 440;
            thread.vm.startNote(freq, 0);
        } else if (op == 'stopSound') {
            thread.vm.stopNote();
            thread.vm.audio.pause();
        } else {
            return super._execute(thread);
        }
    }
    async execute_linegraphmonitor(thread: Thread, op: string) {
        return super._execute(thread);
    }
    async execute_sound(thread: Thread, op: string) {
        if (op == 'changeeffectby') {
        } else if (op == 'changevolumeby') {
        } else if (op == 'cleareffects') {
        } else if (op == 'seteffectto') {
        } else if (op == 'setvolumeto') {
        }
        return super._execute(thread);
    }
    async execute_weather(thread: Thread, op: string) {
        return super._execute(thread);
    }

    override async _execute(thread: Thread) {
        const parts = this.opcode.split('_');
        if (parts.length < 2) {
            super._execute(thread);
            return;
        }
        const module = parts[0];
        const op = parts[1];
        if (module == 'bargraphmonitor') {
            await this.execute_bargraphmonitor(thread, op);
        } else if (module == 'data') {
            await this.execute_data(thread, op);
        } else if (module == 'displaymonitor') {
            await this.execute_displaymonitor(thread, op);
        } else if (module == 'event') {
            await this.execute_event(thread, op);
        } else if (module == 'flippercontrol') {
            await this.execute_flippercontrol(thread, op);
        } else if (module == 'flipperlight') {
            await this.execute_flipperlight(thread, op);
        } else if (module == 'flippermoremotor') {
            await this.execute_flippermoremotor(thread, op);
        } else if (module == 'flippermoremove') {
            await this.execute_flippermoremove(thread, op);
        } else if (module == 'flippermoresensors') {
            await this.execute_flippermoresensors(thread, op);
        } else if (module == 'flippermotor') {
            await this.execute_flippermotor(thread, op);
        } else if (module == 'flippermove') {
            await this.execute_flippermove(thread, op);
        } else if (module == 'flippermusic') {
            await this.execute_flippermusic(thread, op);
        } else if (module == 'flippersensors') {
            await this.execute_flippersensors(thread, op);
        } else if (module == 'flippersound') {
            await this.execute_flippersound(thread, op);
        } else if (module == 'linegraphmonitor') {
            await this.execute_linegraphmonitor(thread, op);
        } else if (module == 'sound') {
            await this.execute_sound(thread, op);
        } else if (module == 'weather') {
            await this.execute_weather(thread, op);
        } else {
            super._execute(thread);
        }
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
            const buttonArg = this.arguments[0].evaluate(thread);
            const eventArg = this.arguments[1].evaluate(thread);
            const button = buttonArg.getString();
            const event = eventArg.getString();
            if (button == 'left') {
                if (event == 'pressed') {
                    return thread.vm.hub.leftPressed;
                } else if (event == 'released') {
                    return !thread.vm.hub.leftPressed;
                }
            } else if (button == 'right') {
                if (event == 'pressed') {
                    return thread.vm.hub.rightPressed;
                } else if (event == 'released') {
                    return !thread.vm.hub.rightPressed;
                }
            }
            return false;
        } else if (this.opcode == 'flipperevents_whenColor') {
            const portString = this.arguments[0].evaluate(thread).getString();
            const value = this.arguments[1].evaluate(thread).getString();
            const port = portString as PortType;
            const attachment = thread.vm.hub.ports[port];
            if (attachment && attachment.type == 'light') {
                // Correct sensor on the correct port
                if (colours[value] === attachment.measure.colour) {
                    return true;
                }
            }
            return false;
        } else if (this.opcode == 'flipperevents_whenCondition') {
            const condition = this.arguments[0].evaluate(thread).getBoolean();
            return condition;
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

    override async _execute(thread: Thread) {
        const procedureBlock = thread.vm.procedures.get(this.name)!;
        if (procedureBlock.arguments.length != this.arguments.length) {
            console.log('Argument mismatch');
            console.log(procedureBlock);
            console.log(this);
            return;
        }

        const oldLocals = thread.locals;
        thread.locals = {};
        for (let i = 0; i < this.arguments.length; i++) {
            const argName = procedureBlock.arguments[i].name;
            const value = this.arguments[i].evaluate(thread);
            thread.locals[argName] = value;
        }
        await procedureBlock.statements.execute(thread);
        thread.locals = oldLocals;
    }
}

export class Expression extends Node {
    constructor(opcode: string, blocklyId: string) {
        super(opcode, blocklyId);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        } else if (this.opcode == 'data_lengthoflist') {
            return new NumberValue(value.getList().length);
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
        } else if (this.opcode == 'data_itemnumoflist') {
            const variable = this.right as Variable;
            const list = variable.evaluate(thread).getList();
            const value = this.left.evaluate(thread).getString();
            return new NumberValue(list.findIndex((x) => x == value) + 1);
        } else if (this.opcode == 'data_itemoflist') {
            const variable = this.right as Variable;
            const list = variable.evaluate(thread).getList();
            const index = this.left.evaluate(thread).getNumber();
            if (index < 1) {
                return new StringValue('');
            }
            if (index > list.length) {
                return new StringValue('');
            }
            return new StringValue(list[index - 1]);
        } else if (this.opcode == 'data_listcontainsitem') {
            const variable = this.right as Variable;
            const list = variable.evaluate(thread).getList();
            const value = this.left.evaluate(thread).getString();
            return new BooleanValue(list.findIndex((x) => x == value) >= 0);
        }
        return super.evaluate(thread);
    }
}

export class FunctionExpression extends Expression {
    arguments: Expression[];

    constructor(opcode: string, blocklyId: string, args: Expression[]) {
        super(opcode, blocklyId);
        this.arguments = args;
    }

    override evaluate(thread: Thread): TypedValue {
        if (this.opcode == 'flippersensors_buttonIsPressed') {
            const buttonArg = this.arguments[0].evaluate(thread);
            const eventArg = this.arguments[1].evaluate(thread);
            const button = buttonArg.getString();
            const event = eventArg.getString();
            if (button == 'left') {
                if (event == 'pressed') {
                    return new BooleanValue(thread.vm.hub.leftPressed);
                } else if (event == 'released') {
                    return new BooleanValue(!thread.vm.hub.leftPressed);
                }
            } else if (button == 'right') {
                if (event == 'pressed') {
                    return new BooleanValue(thread.vm.hub.rightPressed);
                } else if (event == 'released') {
                    return new BooleanValue(!thread.vm.hub.rightPressed);
                }
            }
            return new BooleanValue(false);
        } else if (this.opcode == 'flippersensors_timer') {
            return new NumberValue(thread.vm.getTimer());
        } else if (this.opcode == 'data_listcontents') {
            const variable = this.arguments[0] as Variable;
            return new ListValue([...variable.evaluate(thread).getList()]);
        } else if (this.opcode == 'flippersensors_isColor') {
            const portString = this.arguments[0].evaluate(thread).getString();
            const value = this.arguments[1].evaluate(thread).getString();
            const port = portString as PortType;
            const attachment = thread.vm.hub.ports[port];
            if (attachment && attachment.type == 'light') {
                // Correct sensor on the correct port
                if (colours[value] === attachment.measure.colour) {
                    return new BooleanValue(true);
                }
            }
            return new BooleanValue(false);
        } else if (this.opcode == 'flipperoperator_isInBetween') {
            const value = this.arguments[0].evaluate(thread).getNumber();
            const low = this.arguments[1].evaluate(thread).getNumber();
            const high = this.arguments[2].evaluate(thread).getNumber();
            // TODO: Include or exclude?
            return new BooleanValue(low < value && value < high);
        } else if (this.opcode == 'flippersensors_color') {
            const portString = this.arguments[0].evaluate(thread).getString();
            const port = portString as PortType;
            const attachment = thread.vm.hub.ports[port];
            const colour = coloursRev[attachment.measure.colour];
            if (colour) {
                return new StringValue(colour);
            } else {
                return new StringValue('-1');
            }
        } else if (this.opcode == 'flippersensors_distance') {
            return super.evaluate(thread);
        } else if (this.opcode == 'flippersensors_force') {
            return super.evaluate(thread);
        } else if (this.opcode == 'flippersensors_isDistance') {
            return super.evaluate(thread);
        } else if (this.opcode == 'flippersensors_isPressed') {
            return super.evaluate(thread);
        } else if (this.opcode == 'flippersensors_isReflectivity') {
            const portString = this.arguments[0].evaluate(thread).getString();
            const compare = this.arguments[1].evaluate(thread).getString();
            const value = this.arguments[2].evaluate(thread).getNumber();
            const port = portString as PortType;
            const attachment = thread.vm.hub.ports[port];
            if (compare == '<') {
                return new BooleanValue(attachment.measure.reflected * 100 < value);
            } else if (compare == '>') {
                return new BooleanValue(attachment.measure.reflected * 100 > value);
            } else if (compare == '=') {
                return new BooleanValue(
                    Math.round(attachment.measure.reflected * 100) == Math.round(value)
                );
            } else {
                return new BooleanValue(false);
            }
        } else if (this.opcode == 'flippersensors_isTilted') {
            return super.evaluate(thread);
        } else if (this.opcode == 'flippersensors_ismotion') {
            return super.evaluate(thread);
        } else if (this.opcode == 'flippersensors_isorientation') {
            return super.evaluate(thread);
        } else if (this.opcode == 'flippersensors_orientationAxis') {
            return super.evaluate(thread);
        } else if (this.opcode == 'flippersensors_reflectivity') {
            const portString = this.arguments[0].evaluate(thread).getString();
            const port = portString as PortType;
            const attachment = thread.vm.hub.ports[port];
            return new NumberValue(attachment.measure.reflected * 100);
        } else if (this.opcode == 'flippermoresensors_acceleration') {
            return super.evaluate(thread);
        } else if (this.opcode == 'flippermoresensors_angularVelocity') {
            return super.evaluate(thread);
        } else if (this.opcode == 'flippermoresensors_orientation') {
            return super.evaluate(thread);
        } else if (this.opcode == 'flippermoresensors_rawColor') {
            const portString = this.arguments[0].evaluate(thread).getString();
            const channel = this.arguments[1].evaluate(thread).getString();
            const port = portString as PortType;
            const attachment = thread.vm.hub.ports[port];
            if (attachment && attachment.type == 'light') {
                const colour = hexColor(attachment.measure.colour);
                if (channel == 'red') {
                    return new NumberValue(Math.round(colour.r * 255.0));
                } else if (channel == 'blue') {
                    return new NumberValue(Math.round(colour.b * 255.0));
                } else if (channel == 'green') {
                    return new NumberValue(Math.round(colour.g * 255.0));
                }
            }
            return new NumberValue(0);
        } else if (this.opcode == 'flippermotor_absolutePosition') {
            return super.evaluate(thread);
        } else if (this.opcode == 'flippermotor_speed') {
            return super.evaluate(thread);
        } else if (this.opcode == 'sound_volume') {
            return super.evaluate(thread);
        } else {
            return super.evaluate(thread);
        }
    }
}

export class Value extends Expression {
    value: string;

    constructor(opcode: string, blocklyId: string, value: string) {
        super(opcode, blocklyId);
        this.value = value;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            if (thread.state == 'stopped') {
                return;
            }
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

    override async _execute(thread: Thread) {
        if (this.opcode == 'while') {
            let condition = this.condition.evaluate(thread);
            while (condition.getBoolean()) {
                if (thread.state == 'stopped') {
                    return;
                }
                await this.statement.execute(thread);
                // give things time to change
                // and avoid a very tight loop
                await sleep(50);
                condition = this.condition.evaluate(thread);
            }
        } else if (this.opcode == 'if') {
            const condition = this.condition.evaluate(thread);
            if (condition.getBoolean()) {
                await this.statement.execute(thread);
            } else {
                if (this.alternative) {
                    await this.alternative.execute(thread);
                }
            }
        } else if (this.opcode == 'wait') {
            const duration = this.condition.evaluate(thread);
            const delay = duration.getNumber();
            if (delay > 0) {
                await thread.cancellable(vmSleep(delay * 1000));
            }
        } else if (this.opcode == 'wait4') {
            if (!this.condition) {
                return;
            }
            let condition = this.condition.evaluate(thread);
            while (!condition.getBoolean()) {
                // give things time to change
                // and avoid a very tight loop
                if (thread.state == 'stopped') {
                    return;
                }
                await sleep(50);
                condition = this.condition.evaluate(thread);
            }
        } else {
            super._execute(thread);
        }
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

    override async _execute(thread: Thread) {
        if (this.opcode == 'repeat') {
            const times = this.times.evaluate(thread);
            for (let i = 0; i < times.getNumber(); i++) {
                if (thread.state == 'stopped') {
                    return;
                }
                await this.statements.execute(thread);
            }
        } else {
            super._execute(thread);
        }
    }
}

export class Motor {
    //54696 medium
    //68488 small
    //54675 large
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class LightSensor {
    //37308
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class UltraSoundSensor {
    //37316
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class ForceSensor {
    //37312
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export interface Measure {
    force: number;
    distance: number;
    colour: string;
    reflected: number;
}

export class Port {
    type: 'none' | 'force' | 'distance' | 'light' | 'motor';
    motor?: Motor;
    light?: LightSensor;
    ultra?: UltraSoundSensor;
    force?: ForceSensor;
    measure: Measure;

    constructor(type: 'none' | 'force' | 'distance' | 'light' | 'motor') {
        this.type = type;
        this.measure = { colour: '#000000', distance: 10000.0, force: 0.0, reflected: 0.0 };
    }

    reset() {
        this.measure = { colour: '#000000', distance: 10000.0, force: 0.0, reflected: 0.0 };
    }

    id(): number | 'none' {
        if (this.type == 'none') {
            return 'none';
        } else if (this.type == 'force') {
            return this.force!.id;
        } else if (this.type == 'distance') {
            return this.ultra!.id;
        } else if (this.type == 'light') {
            return this.light!.id;
        } else if (this.type == 'motor') {
            return this.motor!.id;
        }
        return 'none';
    }
}

export type HubEventHandler = (event: string, parameter: string) => void;

export interface HubPorts {
    A: Port;
    B: Port;
    C: Port;
    D: Port;
    E: Port;
    F: Port;
}

export class Hub {
    //67718
    //45601
    leftPressed: boolean;
    rightPressed: boolean;
    screen: string;
    screenBrightness: number;
    ports: HubPorts;
    eventHandler: HubEventHandler | undefined;
    buttonColour: string;

    reload() {
        this.leftPressed = false;
        this.rightPressed = false;
        this.screen = '0000000000000000000000000';
        this.screenBrightness = 0;
        this.buttonColour = '#ffffff';
        this.ports = {
            A: new Port('none'),
            B: new Port('none'),
            C: new Port('none'),
            D: new Port('none'),
            E: new Port('none'),
            F: new Port('none')
        };
    }

    reset() {
        this.leftPressed = false;
        this.rightPressed = false;
        this.screen = '0000000000000000000000000';
        this.screenBrightness = 0;
        this.buttonColour = '#ffffff';
        this.ports.A.reset();
        this.ports.B.reset();
        this.ports.C.reset();
        this.ports.D.reset();
        this.ports.E.reset();
        this.ports.F.reset();
    }

    constructor() {
        this.leftPressed = false;
        this.rightPressed = false;
        this.screen = '0000000000000000000000000';
        this.screenBrightness = 0;
        this.buttonColour = '#ffffff';
        this.ports = {
            A: new Port('none'),
            B: new Port('none'),
            C: new Port('none'),
            D: new Port('none'),
            E: new Port('none'),
            F: new Port('none')
        };
    }

    setEventHandler(eventHandler: HubEventHandler) {
        this.eventHandler = eventHandler;
    }

    clearEventHandler() {
        this.eventHandler = undefined;
    }

    setScreen(screen: string) {
        this.screen = screen;
        if (this.eventHandler) {
            this.eventHandler('screen', screen);
        }
    }

    setButtonColour(colour: string) {
        this.buttonColour = colour;
        if (this.eventHandler) {
            this.eventHandler('hubButtonColour', colour);
        }
    }

    measureColour(port: PortType, colour: string) {
        this.ports[port].measure.colour = colour;
    }

    measureReflected(port: PortType, reflected: number) {
        this.ports[port].measure.reflected = reflected;
    }

    measureDistance(port: PortType, distance: number) {
        this.ports[port].measure.distance = distance;
    }

    measureForce(port: PortType, force: number) {
        this.ports[port].measure.force = force;
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
    id: string;
    vm: VM;
    globals: Namespace;
    locals: Namespace;
    state: 'running' | 'stopped';
    cancels: Map<number, Canceller>;
    nextCancel: number;
    event: EventStatement;
    paused: boolean;

    constructor(id: string, vm: VM, event: EventStatement, globals: Namespace) {
        this.id = id;
        this.vm = vm;
        this.globals = globals;
        this.locals = {};
        this.state = 'stopped';
        this.nextCancel = 0;
        this.cancels = new Map<number, Canceller>();
        this.event = event;
        this.paused = false;
    }

    async _execute() {
        try {
            await this.event.execute(this);
            this.state = 'stopped';
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

    pause() {
        this.paused = true;
    }

    unpause() {
        this.paused = false;
    }
}

export class VM {
    hub: Hub;
    audio: HTMLAudioElement;
    volume: number;
    oscillator: OscillatorNode;
    globals: Namespace;
    events: Map<string, EventStatement>;
    procedures: Map<string, ProcedureBlock>;
    threads: Map<string, Thread>;
    workspace: Blockly.WorkspaceSvg | undefined;
    state: 'running' | 'stopped' | 'paused';
    first: boolean;
    timerStart: number;

    constructor(
        hub: Hub,
        globals: Namespace,
        events: Map<string, EventStatement>,
        procedures: Map<string, ProcedureBlock>,
        workspace: Blockly.WorkspaceSvg | undefined
    ) {
        this.hub = hub;
        this.globals = globals;
        this.events = events;
        this.procedures = procedures;
        this.threads = new Map<string, Thread>();
        this.workspace = workspace;
        this.state = 'stopped';
        this.first = true;
        this.volume = 100;
        this.timerStart = Date.now() / 1000.0;
        this.audio = new Audio();
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        oscillator.connect(audioContext.destination);
        this.oscillator = oscillator;

        for (const entry of Array.from(events.entries())) {
            const key = entry[0];
            const event = entry[1];
            this.threads.set(key, new Thread(key, this, event, this.globals));
        }
    }

    getTimer(): number {
        const now = Date.now() / 1000.0;
        return (now - this.timerStart) * timeFactor;
    }

    resetTimer() {
        this.timerStart = Date.now() / 1000.0;
    }

    runThreads() {
        for (const entry of Array.from(this.threads.entries())) {
            const thread = entry[1];
            thread.checkConditionAndExecute();
        }
        this.first = false;
    }

    stopAllThreadsExcept(key: string) {
        for (const entry of Array.from(this.threads.entries())) {
            const thread = entry[1];
            if (thread.id !== key) {
                thread.stop();
            }
        }
    }

    startNote(frequency: number, duration: number) {
        this.stopNote();
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const now = audioContext.currentTime;
        gain.gain.linearRampToValueAtTime(0, now);
        if (duration > 0) {
            const start = 0.05;
            const end = duration - 0.8;
            if (start < end) {
                gain.gain.linearRampToValueAtTime(0.6, now + start);
                gain.gain.linearRampToValueAtTime(0.6, now + end);
                gain.gain.linearRampToValueAtTime(0, now + duration);
            } else {
                gain.gain.linearRampToValueAtTime(0.6, now + duration * 0.2);
                gain.gain.linearRampToValueAtTime(0, now + duration);
            }
        } else {
            gain.gain.linearRampToValueAtTime(0.6, now + 0.05);
        }
        oscillator.type = 'sine';
        oscillator.frequency.value = Math.round(frequency);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        this.oscillator = oscillator;
        oscillator.start();
    }

    stopNote() {
        try {
            this.oscillator.stop();
        } catch (e) {
            // Do nothing
        }
    }

    stop() {
        this.state = 'stopped';
        for (const entry of Array.from(this.threads.entries())) {
            const thread = entry[1];
            thread.unpause();
            thread.stop();
        }
        this.audio.pause();
        this.stopNote();
    }

    pause() {
        if (this.state == 'running') {
            this.state = 'paused';
            for (const entry of Array.from(this.threads.entries())) {
                const thread = entry[1];
                thread.pause();
            }
        }
        this.audio.pause();
        this.stopNote();
    }

    unpause() {
        if (this.state == 'paused') {
            this.state = 'running';
            for (const entry of Array.from(this.threads.entries())) {
                const thread = entry[1];
                thread.unpause();
            }
        }
    }

    start() {
        if (this.state == 'stopped') {
            this.state = 'running';
            this.first = true;
            this.runThreads();
        } else if (this.state == 'paused') {
            this.unpause();
        }
    }
}
