import * as Blockly from 'blockly/core';
import { writable } from 'svelte/store';
import { mbitfont } from '$lib/spike/font';
import { SoundLibrary } from '$lib/blockly/audio';
import { hexColor, type Vertex } from '$lib/ldraw/components';
import { type SceneStore } from '$lib/spike/scene';
import * as m4 from '$lib/ldraw/m4';

export type PortType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export const allPorts: PortType[] = ['A', 'B', 'C', 'D', 'E', 'F'];
export const fontEmbedsSpace = false;
let stepSleep = 0;
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

class VMTask {
    type: string;
    complete: boolean;

    constructor(type: string) {
        this.type = type;
        this.complete = false;
    }

    run() {}
}

class TaskProcessor {
    thread: Generator<VMTask> | undefined;
    task: VMTask | undefined;
    complete: boolean;

    constructor(thread: Generator<VMTask>) {
        this.thread = thread;
        this.task = undefined;
        this.complete = thread === undefined;
    }

    processNextTask() {
        let newTask = true;
        while (newTask) {
            if (this.task) {
                this.task.run();
                if (!this.task.complete) {
                    return;
                }
            }
            this.task = undefined;
            if (this.thread === undefined) {
                this.complete = true;
                return;
            }
            const state = this.thread.next();
            if (state.value) {
                this.task = state.value;
            }
            if (state.done) {
                this.thread = undefined;
            }
        }
    }
}

class CompleteTask extends VMTask {
    constructor() {
        super('done');
        this.complete = true;
    }
}

class SleepTask extends VMTask {
    duration: number;
    constructor(duration: number) {
        super('sleep');
        this.duration = duration;
    }
}

class CompleteAllTask extends VMTask {
    threads: TaskProcessor[];
    constructor(operations: Generator<VMTask>[]) {
        super('multi');
        this.threads = operations.map((g) => new TaskProcessor(g));
    }

    override run() {
        this.threads.forEach((thread) => {
            if (!thread.complete) {
                thread.processNextTask();
            }
        });
        const completed = this.threads.filter((t) => t.complete);
        this.complete = completed.length == this.threads.length;
    }
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

    *execute(thread: Thread): Generator<VMTask> {
        while (thread.paused) {
            // We should do a callback, but this should be rare
            // so we poll at 50ms interval
            yield thread.vm.sleep(0.05);
        }
        if (thread.state == 'stopped') {
            return;
        }
        try {
            this.highlight(thread);
            if (stepSleep > 0) {
                yield thread.vm.sleep((stepSleep / 1000.0) * timeFactor);
            }
            yield* this._execute(thread);
        } finally {
            this.removeHighlight(thread);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    *_execute(thread: Thread): Generator<VMTask> {
        console.log('Execute not implemented on...');
        console.log(this);
        yield new CompleteTask();
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

    *execute_bargraphmonitor(thread: Thread, op: string): Generator<VMTask> {
        yield* super._execute(thread);
    }

    *execute_data(thread: Thread, op: string): Generator<VMTask> {
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
            yield* super._execute(thread);
        }
    }

    *execute_displaymonitor(thread: Thread, op: string): Generator<VMTask> {
        yield* super._execute(thread);
    }

    *execute_event(thread: Thread, op: string): Generator<VMTask> {
        yield* super._execute(thread);
    }

    *execute_flippercontrol(thread: Thread, op: string): Generator<VMTask> {
        if (op == 'stop') {
            thread.stop();
            return;
        } else if (op == 'stopOtherStacks') {
            thread.vm.stopAllThreadsExcept(thread.id);
            return;
        }
        yield* super._execute(thread);
    }

    *execute_flipperlight(thread: Thread, op: string): Generator<VMTask> {
        if (op == 'lightDisplayImageOn') {
            const value = this.arguments[0].evaluate(thread);
            thread.vm.hub.setScreen(value.getString());
        } else if (op == 'lightDisplayImageOnForTime') {
            const screen = this.arguments[0].evaluate(thread);
            const duration = this.arguments[1].evaluate(thread);
            thread.vm.hub.setScreen(screen.getString());
            const delay = duration.getNumber();
            if (delay > 0) {
                yield thread.vm.sleep(delay);
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
                yield thread.vm.sleep(0.2);
            }
        } else if (op == 'lightDisplaySetBrightness') {
            const brightness = this.arguments[0].evaluate(thread).getNumber();
            thread.vm.hub.screenBrightness = brightness;
        } else if (op == 'lightDisplaySetOrientation') {
            const direction = this.arguments[0].evaluate(thread).getString();
            if (direction == '1') {
                //up
                thread.vm.hub.setScreenOrientation(0);
            } else if (direction == '2') {
                //left
                thread.vm.hub.setScreenOrientation(3);
            } else if (direction == '3') {
                //right
                thread.vm.hub.setScreenOrientation(1);
            } else if (direction == '4') {
                //down
                thread.vm.hub.setScreenOrientation(2);
            }
        } else if (op == 'lightDisplayRotate') {
            const direction = this.arguments[0].evaluate(thread).getString();
            if (direction == 'clockwise') {
                thread.vm.hub.rotateScreen(1);
            } else if (direction == 'counterclockwise') {
                thread.vm.hub.rotateScreen(-1);
            }
        } else if (op == 'lightDisplaySetPixel') {
            const x = this.arguments[0].evaluate(thread).getNumber();
            const y = this.arguments[1].evaluate(thread).getNumber();
            const brightness = this.arguments[2].evaluate(thread).getNumber();
            thread.vm.hub.setPixel(x - 1, y - 1, brightness);
        } else if (op == 'ultrasonicLightUp') {
            // TODO: This is actually just turning an a light
            // It doesn't affect the sensor.
            yield* super._execute(thread);
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
            yield* super._execute(thread);
        }
    }

    *execute_flippermoremotor(thread: Thread, op: string): Generator<VMTask> {
        if (op == 'motorGoToRelativePosition') {
            yield* super._execute(thread);
        } else if (op == 'motorSetAcceleration') {
            yield* super._execute(thread);
        } else if (op == 'motorSetStopMethod') {
            yield* super._execute(thread);
        } else if (op == 'motorStartPower') {
            yield* super._execute(thread);
        } else {
            yield* super._execute(thread);
        }
    }

    *execute_flippermoremove(thread: Thread, op: string): Generator<VMTask> {
        yield* super._execute(thread);
    }

    *execute_flippermoresensors(thread: Thread, op: string): Generator<VMTask> {
        yield* super._execute(thread);
    }

    *execute_movemotor(thread: Thread, port: PortType, duration: number): Generator<VMTask> {
        const attachment = thread.vm.hub.ports[port];
        if (attachment && attachment.type == 'motor') {
            attachment.motor!.on = true;
            yield thread.vm.sleep(duration);
            attachment.motor!.on = false;
            attachment.motor!.reverse = false;
        }
    }

    *execute_flippermotor(thread: Thread, op: string): Generator<VMTask> {
        if (op == 'motorGoDirectionToPosition') {
            const ports = this.arguments[0].evaluate(thread).getString();
            const direction = this.arguments[1].evaluate(thread).getString();
            let target = this.arguments[2].evaluate(thread).getNumber();
            const promises: Generator<VMTask>[] = [];
            for (let i = 0; i < ports.length; i++) {
                const portChar = ports.charAt(i);
                const port = portChar as PortType;
                const attachment = thread.vm.hub.ports[port];
                if (attachment && attachment.type == 'motor') {
                    let degrees = 0;
                    let position = attachment.motor!.position;
                    const rpm = attachment.motor!.rpm;
                    if (direction == 'clockwise') {
                        attachment.motor!.reverse = false;
                        while (target < position) {
                            target += 360.0;
                        }
                        degrees = target - position;
                    } else if (direction == 'counterclockwise') {
                        attachment.motor!.reverse = true;
                        while (position < target) {
                            position += 360.0;
                        }
                        degrees = position - target;
                    } else if (direction == 'shortest') {
                        let cw = 0;
                        let ccw = 0;
                        while (target < position) {
                            target += 360.0;
                        }
                        cw = target - position;
                        while (position < target) {
                            position += 360.0;
                        }
                        ccw = position - target;
                        if (cw < ccw) {
                            attachment.motor!.reverse = false;
                            degrees = cw;
                        } else {
                            attachment.motor!.reverse = true;
                            degrees = ccw;
                        }
                    }
                    // This is probably approximate
                    const revolution_time = 60.0 / rpm;
                    promises.push(
                        this.execute_movemotor(thread, port, (degrees * revolution_time) / 360.0)
                    );
                }
            }
            yield new CompleteAllTask(promises);
        } else if (op == 'motorSetSpeed') {
            const ports = this.arguments[0].evaluate(thread).getString();
            const speed = this.arguments[1].evaluate(thread).getNumber();
            for (let i = 0; i < ports.length; i++) {
                const portChar = ports.charAt(i);
                const port = portChar as PortType;
                const attachment = thread.vm.hub.ports[port];
                if (attachment && attachment.type == 'motor') {
                    // TODO: Other statements can ask for clockwise or
                    // counter clockwise
                    attachment.motor!.setSpeed(speed);
                }
            }
        } else if (op == 'motorStartDirection') {
            const ports = this.arguments[0].evaluate(thread).getString();
            const direction = this.arguments[1].evaluate(thread).getString();
            for (let i = 0; i < ports.length; i++) {
                const portChar = ports.charAt(i);
                const port = portChar as PortType;
                const attachment = thread.vm.hub.ports[port];
                if (attachment && attachment.type == 'motor') {
                    //TODO: Reverse direction if necessary
                    if (direction == 'clockwise') {
                        attachment.motor!.reverse = false;
                    } else if (direction == 'counterclockwise') {
                        attachment.motor!.reverse = true;
                    }
                    attachment.motor!.on = true;
                }
            }
        } else if (op == 'motorStop') {
            const ports = this.arguments[0].evaluate(thread).getString();
            for (let i = 0; i < ports.length; i++) {
                const portChar = ports.charAt(i);
                const port = portChar as PortType;
                const attachment = thread.vm.hub.ports[port];
                if (attachment && attachment.type == 'motor') {
                    //TODO: Reverse direction if necessary
                    attachment.motor!.on = false;
                    attachment.motor!.reverse = false;
                }
            }
        } else if (op == 'motorTurnForDirection') {
            const ports = this.arguments[0].evaluate(thread).getString();
            const direction = this.arguments[1].evaluate(thread).getString();
            const amount = this.arguments[2].evaluate(thread).getNumber();
            const unit = this.arguments[3].evaluate(thread).getString();
            const promises: Generator<VMTask>[] = [];
            for (let i = 0; i < ports.length; i++) {
                const portChar = ports.charAt(i);
                const port = portChar as PortType;
                const attachment = thread.vm.hub.ports[port];
                if (attachment && attachment.type == 'motor') {
                    //TODO: Reverse direction if necessary
                    if (direction == 'clockwise') {
                        attachment.motor!.reverse = false;
                    } else if (direction == 'counterclockwise') {
                        attachment.motor!.reverse = true;
                    }
                    const rpm = attachment.motor!.rpm;
                    if (unit == 'rotations') {
                        const revolution_time = 60.0 / rpm;
                        promises.push(
                            this.execute_movemotor(thread, port, amount * revolution_time)
                        );
                    } else if (unit == 'degrees') {
                        // This is probably approximate
                        const revolution_time = 60.0 / rpm;
                        promises.push(
                            this.execute_movemotor(thread, port, (amount * revolution_time) / 360.0)
                        );
                    } else if (unit == 'seconds') {
                        promises.push(this.execute_movemotor(thread, port, amount));
                    }
                }
            }
            yield new CompleteAllTask(promises);
        } else {
            yield* super._execute(thread);
        }
    }

    *execute_flippermove(thread: Thread, op: string): Generator<VMTask> {
        if (op == 'move') {
            const direction = this.arguments[0].evaluate(thread).getString();
            const amount = this.arguments[1].evaluate(thread).getNumber();
            const unit = this.arguments[2].evaluate(thread).getString();
            let moveSpeed = thread.vm.hub.moveSpeed;
            if (direction == 'forward') {
                moveSpeed = thread.vm.hub.moveSpeed;
            } else if (direction == 'back') {
                moveSpeed = -thread.vm.hub.moveSpeed;
            }
            let attachment = thread.vm.hub.ports[thread.vm.hub.movePair1];
            let rpm = 0;
            if (attachment && attachment.type == 'motor') {
                if (moveSpeed < 0) {
                    attachment.motor!.setSpeed(-moveSpeed);
                    attachment.motor!.reverse = true;
                } else {
                    attachment.motor!.setSpeed(moveSpeed);
                    attachment.motor!.reverse = false;
                }
                attachment.motor!.on = true;
                rpm = attachment.motor!.rpm;
            }
            attachment = thread.vm.hub.ports[thread.vm.hub.movePair2];
            if (attachment && attachment.type == 'motor') {
                if (thread.vm.hub.moveSpeed < 0) {
                    attachment.motor!.setSpeed(-moveSpeed);
                    attachment.motor!.reverse = false;
                } else {
                    attachment.motor!.setSpeed(moveSpeed);
                    attachment.motor!.reverse = true;
                }
                attachment.motor!.on = true;
                if (attachment.motor!.rpm > rpm) {
                    rpm = attachment.motor!.rpm;
                }
            }
            if (unit == 'rotations') {
                const revolution_time = 60.0 / rpm;
                yield thread.vm.sleep(amount * revolution_time);
            } else if (unit == 'degrees') {
                // This is probably approximate
                const revolution_time = 60.0 / rpm;
                yield thread.vm.sleep((amount * revolution_time) / 360.0);
            } else if (unit == 'seconds') {
                yield thread.vm.sleep(amount);
            } else if (unit == 'cm') {
                const revolution_time = 60.0 / rpm;
                const revs = (amount * 10.0) / thread.vm.hub.moveDistance;
                yield thread.vm.sleep(revs * revolution_time);
            } else if (unit == 'in') {
                const revolution_time = 60.0 / rpm;
                const revs = (amount * 25.4) / thread.vm.hub.moveDistance;
                yield thread.vm.sleep(revs * revolution_time);
            } else if (unit == 'inches') {
                const revolution_time = 60.0 / rpm;
                const revs = (amount * 25.4) / thread.vm.hub.moveDistance;
                yield thread.vm.sleep(revs * revolution_time);
            }
            attachment = thread.vm.hub.ports[thread.vm.hub.movePair1];
            if (attachment && attachment.type == 'motor') {
                attachment.motor!.reverse = false;
                attachment.motor!.on = false;
            }
            attachment = thread.vm.hub.ports[thread.vm.hub.movePair2];
            if (attachment && attachment.type == 'motor') {
                attachment.motor!.reverse = false;
                attachment.motor!.on = false;
            }
        } else if (op == 'movementSpeed') {
            const speed = this.arguments[0].evaluate(thread).getNumber();
            thread.vm.hub.moveSpeed = speed;
        } else if (op == 'setDistance') {
            const distance = this.arguments[0].evaluate(thread).getNumber();
            const unit = this.arguments[1].evaluate(thread).getString();
            if (unit == 'cm') {
                thread.vm.hub.moveDistance = distance * 10.0;
            } else if (unit == 'in') {
                thread.vm.hub.moveDistance = distance * 25.4;
            } else if (unit == 'inches') {
                thread.vm.hub.moveDistance = distance * 25.4;
            }
        } else if (op == 'setMovementPair') {
            const pair = this.arguments[0].evaluate(thread).getString();
            if (pair.length == 2) {
                let portChar = pair.charAt(0);
                let port = portChar as PortType;
                thread.vm.hub.movePair1 = port;
                portChar = pair.charAt(1);
                port = portChar as PortType;
                thread.vm.hub.movePair2 = port;
            }
        } else if (op == 'startMove') {
            let attachment = thread.vm.hub.ports[thread.vm.hub.movePair1];
            if (attachment && attachment.type == 'motor') {
                if (thread.vm.hub.moveSpeed < 0) {
                    attachment.motor!.setSpeed(-thread.vm.hub.moveSpeed);
                    attachment.motor!.reverse = true;
                } else {
                    attachment.motor!.setSpeed(thread.vm.hub.moveSpeed);
                    attachment.motor!.reverse = false;
                }
                attachment.motor!.on = true;
            }
            attachment = thread.vm.hub.ports[thread.vm.hub.movePair2];
            if (attachment && attachment.type == 'motor') {
                if (thread.vm.hub.moveSpeed < 0) {
                    attachment.motor!.setSpeed(-thread.vm.hub.moveSpeed);
                    attachment.motor!.reverse = false;
                } else {
                    attachment.motor!.setSpeed(thread.vm.hub.moveSpeed);
                    attachment.motor!.reverse = true;
                }
                attachment.motor!.on = true;
            }
        } else if (op == 'stopMove') {
            let attachment = thread.vm.hub.ports[thread.vm.hub.movePair1];
            if (attachment && attachment.type == 'motor') {
                attachment.motor!.reverse = false;
                attachment.motor!.on = false;
            }
            attachment = thread.vm.hub.ports[thread.vm.hub.movePair2];
            if (attachment && attachment.type == 'motor') {
                attachment.motor!.reverse = false;
                attachment.motor!.on = false;
            }
        } else if (op == 'startSteer') {
            const steer = this.arguments[0].evaluate(thread).getNumber();
            let left = 0;
            let right = 0;

            if (steer >= 0) {
                left = 100.0;
                right = 100.0 - steer * 2.0;
            } else {
                right = 100.0;
                left = steer * 2.0 + 100;
            }
            left = left / 100.0;
            right = right / 100.0;
            if (left > 1.0) {
                left = 1.0;
            }
            if (left < -1.0) {
                left = -1.0;
            }
            if (right > 1.0) {
                right = 1.0;
            }
            if (right < -1.0) {
                right = -1.0;
            }
            let attachment = thread.vm.hub.ports[thread.vm.hub.movePair1];
            if (attachment && attachment.type == 'motor') {
                if (thread.vm.hub.moveSpeed < 0) {
                    attachment.motor!.setSpeed(-thread.vm.hub.moveSpeed * left);
                    attachment.motor!.reverse = true;
                } else {
                    attachment.motor!.setSpeed(thread.vm.hub.moveSpeed * left);
                    attachment.motor!.reverse = false;
                }
                attachment.motor!.on = true;
            }
            attachment = thread.vm.hub.ports[thread.vm.hub.movePair2];
            if (attachment && attachment.type == 'motor') {
                if (thread.vm.hub.moveSpeed < 0) {
                    attachment.motor!.setSpeed(-thread.vm.hub.moveSpeed * right);
                    attachment.motor!.reverse = false;
                } else {
                    attachment.motor!.setSpeed(thread.vm.hub.moveSpeed * right);
                    attachment.motor!.reverse = true;
                }
                attachment.motor!.on = true;
            }
        } else if (op == 'steer') {
            const steer = this.arguments[0].evaluate(thread).getNumber();
            const amount = this.arguments[1].evaluate(thread).getNumber();
            const unit = this.arguments[2].evaluate(thread).getString();
            let left = 0;
            let right = 0;

            if (steer >= 0) {
                left = 100.0;
                right = 100.0 - steer * 2.0;
            } else {
                right = 100.0;
                left = steer * 2.0 + 100;
            }
            left = left / 100.0;
            right = right / 100.0;
            if (left > 1.0) {
                left = 1.0;
            }
            if (left < -1.0) {
                left = -1.0;
            }
            if (right > 1.0) {
                right = 1.0;
            }
            if (right < -1.0) {
                right = -1.0;
            }
            let attachment = thread.vm.hub.ports[thread.vm.hub.movePair1];
            let rpm = 0;
            if (attachment && attachment.type == 'motor') {
                if (thread.vm.hub.moveSpeed < 0) {
                    attachment.motor!.setSpeed(-thread.vm.hub.moveSpeed * left);
                    attachment.motor!.reverse = true;
                } else {
                    attachment.motor!.setSpeed(thread.vm.hub.moveSpeed * left);
                    attachment.motor!.reverse = false;
                }
                attachment.motor!.on = true;
                rpm = attachment.motor!.rpm;
            }
            attachment = thread.vm.hub.ports[thread.vm.hub.movePair2];
            if (attachment && attachment.type == 'motor') {
                if (thread.vm.hub.moveSpeed < 0) {
                    attachment.motor!.setSpeed(-thread.vm.hub.moveSpeed * right);
                    attachment.motor!.reverse = false;
                } else {
                    attachment.motor!.setSpeed(thread.vm.hub.moveSpeed * right);
                    attachment.motor!.reverse = true;
                }
                attachment.motor!.on = true;
                if (attachment.motor!.rpm > rpm) {
                    rpm = attachment.motor!.rpm;
                }
            }
            if (unit == 'rotations') {
                const revolution_time = 60.0 / rpm;
                yield thread.vm.sleep(amount * revolution_time);
            } else if (unit == 'degrees') {
                // This is probably approximate
                const revolution_time = 60.0 / rpm;
                yield thread.vm.sleep((amount * revolution_time) / 360.0);
            } else if (unit == 'seconds') {
                yield thread.vm.sleep(amount);
            }
            attachment = thread.vm.hub.ports[thread.vm.hub.movePair1];
            if (attachment && attachment.type == 'motor') {
                attachment.motor!.reverse = false;
                attachment.motor!.on = false;
            }
            attachment = thread.vm.hub.ports[thread.vm.hub.movePair2];
            if (attachment && attachment.type == 'motor') {
                attachment.motor!.reverse = false;
                attachment.motor!.on = false;
            }
        } else {
            yield* super._execute(thread);
        }
    }

    *execute_flippermusic(thread: Thread, op: string): Generator<VMTask> {
        yield* super._execute(thread);
    }

    *execute_flippersensors(thread: Thread, op: string): Generator<VMTask> {
        if (op == 'resetTimer') {
            thread.vm.resetTimer();
            return;
        } else if (op == 'resetYaw') {
            thread.vm.hub.yaw = 0;
            return;
        }
        yield* super._execute(thread);
    }

    *execute_flippersound(thread: Thread, op: string): Generator<VMTask> {
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
                yield thread.vm.sleep(0.01);
            }
        } else if (op == 'beepForTime') {
            const note = this.arguments[0].evaluate(thread).getNumber();
            const duration = this.arguments[1].evaluate(thread).getNumber();
            thread.vm.stopNote();
            const freq = Math.pow(2.0, (note - 69.0) / 12.0) * 440;
            thread.vm.startNote(freq, duration * timeFactor);
            try {
                yield thread.vm.sleep(duration);
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
            yield* super._execute(thread);
        }
    }

    *execute_linegraphmonitor(thread: Thread, op: string): Generator<VMTask> {
        yield* super._execute(thread);
    }

    *execute_sound(thread: Thread, op: string): Generator<VMTask> {
        if (op == 'changeeffectby') {
            yield* super._execute(thread);
        } else if (op == 'changevolumeby') {
            yield* super._execute(thread);
        } else if (op == 'cleareffects') {
            yield* super._execute(thread);
        } else if (op == 'seteffectto') {
            yield* super._execute(thread);
        } else if (op == 'setvolumeto') {
            yield* super._execute(thread);
        } else {
            yield* super._execute(thread);
        }
    }

    *execute_weather(thread: Thread, op: string): Generator<VMTask> {
        yield* super._execute(thread);
    }

    override *_execute(thread: Thread): Generator<VMTask> {
        const parts = this.opcode.split('_');
        if (parts.length < 2) {
            super._execute(thread);
            return;
        }
        const module = parts[0];
        const op = parts[1];
        if (module == 'bargraphmonitor') {
            yield* this.execute_bargraphmonitor(thread, op);
        } else if (module == 'data') {
            yield* this.execute_data(thread, op);
        } else if (module == 'displaymonitor') {
            yield* this.execute_displaymonitor(thread, op);
        } else if (module == 'event') {
            yield* this.execute_event(thread, op);
        } else if (module == 'flippercontrol') {
            yield* this.execute_flippercontrol(thread, op);
        } else if (module == 'flipperlight') {
            yield* this.execute_flipperlight(thread, op);
        } else if (module == 'flippermoremotor') {
            yield* this.execute_flippermoremotor(thread, op);
        } else if (module == 'flippermoremove') {
            yield* this.execute_flippermoremove(thread, op);
        } else if (module == 'flippermoresensors') {
            yield* this.execute_flippermoresensors(thread, op);
        } else if (module == 'flippermotor') {
            yield* this.execute_flippermotor(thread, op);
        } else if (module == 'flippermove') {
            yield* this.execute_flippermove(thread, op);
        } else if (module == 'flippermusic') {
            yield* this.execute_flippermusic(thread, op);
        } else if (module == 'flippersensors') {
            yield* this.execute_flippersensors(thread, op);
        } else if (module == 'flippersound') {
            yield* this.execute_flippersound(thread, op);
        } else if (module == 'linegraphmonitor') {
            yield* this.execute_linegraphmonitor(thread, op);
        } else if (module == 'sound') {
            yield* this.execute_sound(thread, op);
        } else if (module == 'weather') {
            yield* this.execute_weather(thread, op);
        } else {
            yield* super._execute(thread);
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

    override *_execute(thread: Thread): Generator<VMTask> {
        yield* this.statements.execute(thread);
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
            const portString = this.arguments[0].evaluate(thread).getString();
            const port = portString as PortType;
            const comparator = this.arguments[1].evaluate(thread).getString();
            const value = this.arguments[2].evaluate(thread).getNumber();
            const unit = this.arguments[3].evaluate(thread).getString();
            const attachment = thread.vm.hub.ports[port];
            if (attachment && attachment.type == 'distance') {
                let d = value;
                if (unit == '%') {
                    d = (d / 100.0) * 2000.0;
                } else if (unit == 'cm') {
                    d = d * 10.0;
                } else if (unit == 'in') {
                    d = d * 25.4;
                } else if (unit == 'inches') {
                    d = d * 25.4;
                }
                if (comparator == '<') {
                    return attachment.measure.distance < d;
                } else if (comparator == '=') {
                    return Math.trunc(d) == Math.trunc(attachment.measure.distance);
                } else if (comparator == '>') {
                    return attachment.measure.distance > d;
                }
            }
            return false;
        } else if (this.opcode == 'flipperevents_whenGesture') {
            console.log(`Need code ${this.opcode}`);
        } else if (this.opcode == 'flipperevents_whenOrientation') {
            console.log(`Need code ${this.opcode}`);
        } else if (this.opcode == 'flipperevents_whenPressed') {
            const portString = this.arguments[0].evaluate(thread).getString();
            const port = portString as PortType;
            const test = this.arguments[1].evaluate(thread).getString();
            const attachment = thread.vm.hub.ports[port];
            if (attachment && attachment.type == 'force') {
                if (test == 'released') {
                    return attachment.measure.force < 1e-5;
                } else if (test == 'pressed') {
                    return attachment.measure.force > 1e-5;
                } else if (test == 'hard-pressed') {
                    return attachment.measure.force > 5;
                } else if (test == 'pressure changed') {
                    const change = attachment.measure.force_changed;
                    attachment.measure.force_changed = false;
                    return change;
                }
            }
            return false;
        } else if (this.opcode == 'flipperevents_whenProgramStarts') {
            return thread.vm.first;
        } else if (this.opcode == 'flipperevents_whenTilted') {
            console.log(`Need code ${this.opcode}`);
        } else if (this.opcode == 'flipperevents_whenTimer') {
            const timer = this.arguments[0].evaluate(thread).getNumber();
            return thread.vm.getTimer() > timer;
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

    override *_execute(thread: Thread): Generator<VMTask> {
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
        yield* procedureBlock.statements.execute(thread);
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
            const portString = this.arguments[0].evaluate(thread).getString();
            const port = portString as PortType;
            const unit = this.arguments[1].evaluate(thread).getString();
            const attachment = thread.vm.hub.ports[port];
            if (attachment && attachment.type == 'distance') {
                if (unit == '%') {
                    return new NumberValue((attachment.measure.distance * 100.0) / 2000.0);
                } else if (unit == 'cm') {
                    return new NumberValue(attachment.measure.distance / 10.0);
                } else if (unit == 'in') {
                    return new NumberValue(attachment.measure.distance / 25.4);
                } else if (unit == 'inches') {
                    return new NumberValue(attachment.measure.distance / 25.4);
                }
            }
            return new NumberValue(0);
        } else if (this.opcode == 'flippersensors_force') {
            const portString = this.arguments[0].evaluate(thread).getString();
            const port = portString as PortType;
            const unit = this.arguments[1].evaluate(thread).getString();
            const attachment = thread.vm.hub.ports[port];
            if (attachment && attachment.type == 'force') {
                if (unit == '%') {
                    return new NumberValue((attachment.measure.force * 100.0) / 10.0);
                } else if (unit == 'newton') {
                    return new NumberValue(attachment.measure.force);
                }
            }
            return new NumberValue(0);
        } else if (this.opcode == 'flippersensors_isDistance') {
            const portString = this.arguments[0].evaluate(thread).getString();
            const port = portString as PortType;
            const comparator = this.arguments[1].evaluate(thread).getString();
            const value = this.arguments[2].evaluate(thread).getNumber();
            const unit = this.arguments[3].evaluate(thread).getString();
            const attachment = thread.vm.hub.ports[port];
            if (attachment && attachment.type == 'distance') {
                let d = value;
                if (unit == '%') {
                    d = (d / 100.0) * 2000.0;
                } else if (unit == 'cm') {
                    d = d * 10.0;
                } else if (unit == 'in') {
                    d = d * 25.4;
                } else if (unit == 'inches') {
                    d = d * 25.4;
                }
                if (comparator == '<') {
                    return new BooleanValue(attachment.measure.distance < d);
                } else if (comparator == '=') {
                    return new BooleanValue(
                        Math.trunc(d) == Math.trunc(attachment.measure.distance)
                    );
                } else if (comparator == '>') {
                    return new BooleanValue(attachment.measure.distance > d);
                }
            }
            return new BooleanValue(false);
        } else if (this.opcode == 'flipperevents_whenGesture') {
            console.log(`Need code ${this.opcode}`);
            return super.evaluate(thread);
        } else if (this.opcode == 'flippersensors_isPressed') {
            const portString = this.arguments[0].evaluate(thread).getString();
            const port = portString as PortType;
            const test = this.arguments[1].evaluate(thread).getString();
            const attachment = thread.vm.hub.ports[port];
            if (attachment && attachment.type == 'force') {
                if (test == 'released') {
                    return new BooleanValue(attachment.measure.force < 1e-5);
                } else if (test == 'pressed') {
                    return new BooleanValue(attachment.measure.force > 1e-5);
                } else if (test == 'hard-pressed') {
                    return new BooleanValue(attachment.measure.force > 5);
                }
            }
            return new BooleanValue(false);
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
            const axis = this.arguments[0].evaluate(thread).getString();
            if (axis == 'pitch') {
                // TODO: Should we calculate pitch?
                return new NumberValue(0);
            } else if (axis == 'roll') {
                // TODO: Should we calculate roll?
                return new NumberValue(0);
            } else if (axis == 'yaw') {
                return new NumberValue(thread.vm.hub.yaw);
            }
            return new NumberValue(0);
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
            const portString = this.arguments[0].evaluate(thread).getString();
            const port = portString as PortType;
            const attachment = thread.vm.hub.ports[port];
            if (attachment && attachment.type == 'motor') {
                return new NumberValue(attachment.motor!.position);
            }
            return new NumberValue(0);
        } else if (this.opcode == 'flippermotor_speed') {
            const portString = this.arguments[0].evaluate(thread).getString();
            const port = portString as PortType;
            const attachment = thread.vm.hub.ports[port];
            if (attachment && attachment.type == 'motor') {
                return new NumberValue(attachment.motor!.speed * 100);
            }
            return new NumberValue(0);
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

    override *_execute(thread: Thread): Generator<VMTask> {
        this.removeHighlight(thread);
        for (const statement of this.statements) {
            if (thread.state == 'stopped') {
                return;
            }
            yield* statement.execute(thread);
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

    override *_execute(thread: Thread): Generator<VMTask> {
        if (this.opcode == 'while') {
            let condition = this.condition.evaluate(thread);
            while (condition.getBoolean()) {
                if (thread.state == 'stopped') {
                    return;
                }
                yield* this.statement.execute(thread);
                // give things time to change
                // and avoid a very tight loop
                yield thread.vm.sleep(0.05);
                condition = this.condition.evaluate(thread);
            }
        } else if (this.opcode == 'repeat_until') {
            let condition = this.condition.evaluate(thread);
            while (!condition.getBoolean()) {
                if (thread.state == 'stopped') {
                    return;
                }
                yield* this.statement.execute(thread);
                // give things time to change
                // and avoid a very tight loop
                yield thread.vm.sleep(0.05);
                condition = this.condition.evaluate(thread);
            }
        } else if (this.opcode == 'if') {
            const condition = this.condition.evaluate(thread);
            if (condition.getBoolean()) {
                yield* this.statement.execute(thread);
            } else {
                if (this.alternative) {
                    yield* this.alternative.execute(thread);
                }
            }
        } else if (this.opcode == 'wait') {
            const duration = this.condition.evaluate(thread);
            const delay = duration.getNumber();
            if (delay > 0) {
                yield thread.vm.sleep(delay);
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
                yield thread.vm.sleep(0.05);
                condition = this.condition.evaluate(thread);
            }
        } else {
            yield* super._execute(thread);
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

    override *_execute(thread: Thread): Generator<VMTask> {
        if (this.opcode == 'repeat') {
            const times = this.times.evaluate(thread);
            for (let i = 0; i < times.getNumber(); i++) {
                if (thread.state == 'stopped') {
                    return;
                }
                yield* this.statements.execute(thread);
            }
        } else {
            yield* super._execute(thread);
        }
    }
}

export class Wheel {
    id: number;
    radius: number;
    gearing: number;
    port: PortType;
    locationTransform: m4.Matrix4;
    distanceMoved: number;
    position: Vertex;
    direction: Vertex;

    constructor(
        id: number,
        radius: number,
        gearing: number,
        port: PortType,
        locationTransform: m4.Matrix4
    ) {
        this.id = id;
        this.radius = radius;
        this.gearing = gearing;
        this.port = port;
        this.locationTransform = locationTransform;
        this.distanceMoved = 0.0;
        const position = m4.transformVector(this.locationTransform, [0.0, 0.0, 0.0, 1.0]);
        const direction = m4.normalize(
            m4.transformVector(this.locationTransform, [1.0, 0.0, 0.0, 0.0])
        );
        this.position = { x: position[0], y: position[1], z: position[2] };
        this.direction = { x: direction[0], y: direction[1], z: direction[2] };
    }

    applyTransform() {
        const position = m4.transformVector(this.locationTransform, [0.0, 0.0, 0.0, 1.0]);
        const direction = m4.normalize(
            m4.transformVector(this.locationTransform, [1.0, 0.0, 0.0, 0.0])
        );
        this.position = { x: position[0], y: position[1], z: position[2] };
        this.direction = { x: direction[0], y: direction[1], z: direction[2] };
    }
}

export class Motor {
    //54696 medium (135rpm)
    //68488 small (85rpm)
    //54675 large (135rpm)
    id: number;
    position: number;
    speed: number;
    rpm: number;
    on: boolean;
    reverse: boolean;
    constructor(id: number) {
        this.id = id;
        this.position = 0;
        this.speed = 0.75;
        this.rpm = 135 * this.speed;
        this.on = false;
        this.reverse = false;
    }

    setSpeed(percent: number) {
        if (percent > 100) {
            percent = 100;
        }
        if (percent < -100) {
            percent = -100;
        }
        percent = percent / 100.0;
        this.speed = percent;
        this.rpm = percent * 135;
    }

    move(time: number): number {
        // time is in seconds
        if (!this.on) {
            return 0;
        }
        const delta = (time * this.rpm) / 60.0;
        if (this.reverse) {
            this.position -= delta * 360;
        } else {
            this.position += delta * 360;
        }
        while (this.position >= 360) {
            this.position -= 360;
        }
        while (this.position < 0) {
            this.position += 360;
        }
        if (this.reverse) {
            return -delta;
        } else {
            return delta;
        }
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
    force_changed: boolean;
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
        this.measure = {
            colour: '#000000',
            distance: 10000.0,
            force: 0.0,
            reflected: 0.0,
            force_changed: false
        };
    }

    reset() {
        this.measure = {
            colour: '#000000',
            distance: 10000.0,
            force: 0.0,
            reflected: 0.0,
            force_changed: false
        };
        if (this.motor) {
            this.motor.position = 0;
            this.motor.speed = 0.75;
            this.motor.rpm = 135 * this.motor.speed;
            this.motor.on = false;
            this.motor.reverse = false;
        }
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
    screenRotate: number;
    ports: HubPorts;
    eventHandler: HubEventHandler | undefined;
    buttonColour: string;
    wheels: Wheel[];
    moveSpeed: number;
    moveDistance: number; // in mm
    movePair1: PortType;
    movePair2: PortType;
    yaw: number;

    reload() {
        this.leftPressed = false;
        this.rightPressed = false;
        this.screen = '0000000000000000000000000';
        this.screenBrightness = 100;
        this.buttonColour = '#ffffff';
        this.ports = {
            A: new Port('none'),
            B: new Port('none'),
            C: new Port('none'),
            D: new Port('none'),
            E: new Port('none'),
            F: new Port('none')
        };
        this.wheels = [];
        this.moveSpeed = 0;
        this.moveDistance = 175;
        this.movePair1 = 'A';
        this.movePair2 = 'B';
        this.screenRotate = 0;
        this.yaw = 0;
    }

    reset() {
        this.leftPressed = false;
        this.rightPressed = false;
        this.screen = '0000000000000000000000000';
        this.screenBrightness = 100;
        this.buttonColour = '#ffffff';
        this.ports.A.reset();
        this.ports.B.reset();
        this.ports.C.reset();
        this.ports.D.reset();
        this.ports.E.reset();
        this.ports.F.reset();
        this.moveSpeed = 0;
        this.moveDistance = 175;
        this.movePair1 = 'A';
        this.movePair2 = 'B';
        this.screenRotate = 0;
        this.yaw = 0;
    }

    constructor() {
        this.leftPressed = false;
        this.rightPressed = false;
        this.screen = '0000000000000000000000000';
        this.screenBrightness = 100;
        this.buttonColour = '#ffffff';
        this.ports = {
            A: new Port('none'),
            B: new Port('none'),
            C: new Port('none'),
            D: new Port('none'),
            E: new Port('none'),
            F: new Port('none')
        };
        this.wheels = [];
        this.moveSpeed = 0;
        this.movePair1 = 'A';
        this.movePair2 = 'B';
        this.moveDistance = 175;
        this.screenRotate = 0;
        this.yaw = 0;
    }

    setEventHandler(eventHandler: HubEventHandler) {
        this.eventHandler = eventHandler;
    }

    clearEventHandler() {
        this.eventHandler = undefined;
    }

    notifyScreen(screen: string) {
        if (this.screenRotate == 1) {
            const newScreen: string[] = [];
            for (let x = 0; x < 5; x++) {
                for (let y = 4; y >= 0; y--) {
                    const index = x + y * 5;
                    newScreen.push(screen.charAt(index));
                }
            }
            screen = newScreen.join('');
        } else if (this.screenRotate == 2) {
            const newScreen: string[] = [];
            for (let y = 4; y >= 0; y--) {
                for (let x = 4; x >= 0; x--) {
                    const index = x + y * 5;
                    newScreen.push(screen.charAt(index));
                }
            }
            screen = newScreen.join('');
        } else if (this.screenRotate == 3) {
            const newScreen: string[] = [];
            for (let x = 4; x >= 0; x--) {
                for (let y = 0; y < 5; y++) {
                    const index = x + y * 5;
                    newScreen.push(screen.charAt(index));
                }
            }
            screen = newScreen.join('');
        }
        if (this.eventHandler) {
            this.eventHandler('screen', screen);
        }
    }

    setScreenOrientation(direction: number) {
        this.screenRotate = direction;
        while (this.screenRotate < 0) {
            this.screenRotate += 4;
        }
        while (this.screenRotate > 3) {
            this.screenRotate -= 4;
        }
    }

    rotateScreen(direction: number) {
        this.screenRotate += direction;
        while (this.screenRotate < 0) {
            this.screenRotate += 4;
        }
        while (this.screenRotate > 3) {
            this.screenRotate -= 4;
        }
    }

    setScreen(screen: string) {
        this.screen = screen;
        this.notifyScreen(screen);
    }

    setPixel(x: number, y: number, brightness: number) {
        const index = x + y * 5;
        if (index < 0) {
            return;
        }
        if (index >= this.screen.length) {
            return;
        }
        if (brightness < 0) {
            brightness = 0;
        }
        if (brightness > 98) {
            brightness = 90;
        }
        const b = Math.trunc(brightness / 10).toString();
        this.screen = this.screen.substring(0, index) + b + this.screen.substring(index + 1);
        this.notifyScreen(this.screen);
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
        // released = 0N
        // pressed = >0N
        // hard-pressed = >5N
        if (force != this.ports[port].measure.force) {
            this.ports[port].measure.force_changed = true;
        }
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
    event: EventStatement;
    paused: boolean;
    thread: TaskProcessor | undefined;

    constructor(id: string, vm: VM, event: EventStatement, globals: Namespace) {
        this.id = id;
        this.vm = vm;
        this.globals = globals;
        this.locals = {};
        this.state = 'stopped';
        this.event = event;
        this.paused = false;
        this.thread = undefined;
    }

    *_execute(): Generator<VMTask> {
        try {
            yield* this.event.execute(this);
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
            if (!this.thread) {
                this.state = 'stopped';
            } else {
                this.thread.processNextTask();
                if (this.thread.complete) {
                    this.state = 'stopped';
                    this.thread = undefined;
                }
            }
        } else {
            if (this.event.satisfied(this)) {
                this.thread = new TaskProcessor(this.execute());
                this.thread.processNextTask();
            }
        }
    }

    *execute(): Generator<VMTask> {
        if (this.state === 'running') {
            // Already running
            return;
        }
        this.locals = {};
        this.state = 'running';
        yield* this._execute();
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

    stop() {
        if (this.state === 'stopped') {
            return;
        }
        this.state = 'stopped';
    }

    pause() {
        this.paused = true;
    }

    unpause() {
        this.paused = false;
    }
}

function dist(a: Vertex, b: Vertex) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
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
    deltaTime: number;
    sleepTasks: SleepTask[];

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
        this.deltaTime = 0.0;
        this.sleepTasks = [];

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
            this.sleepTasks = [];
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

    sleep(seconds: number): SleepTask {
        const task = new SleepTask(seconds);
        this.sleepTasks.push(task);
        return task;
    }

    processSleep(seconds: number) {
        this.sleepTasks.forEach((r) => {
            r.duration -= seconds;
            if (r.duration <= 0.0) {
                r.complete = true;
            }
        });
        this.sleepTasks = this.sleepTasks.filter((r) => r.duration > 0.0);
    }

    stepTime() {
        const durations = this.sleepTasks.map((r) => r.duration);
        let shortest = Math.min.apply(null, durations);
        if (shortest < 1e-5) {
            shortest = 1e-5;
        }
        if (shortest > 0.001) {
            shortest = 0.001;
        }
        return shortest;
    }

    step(seconds: number, scene: SceneStore) {
        if (this.state == 'running') {
            let duration = seconds * timeFactor + this.deltaTime;
            while (duration > 0.0) {
                const stepTime = this.stepTime();
                this.processSleep(stepTime);
                this.runThreads();
                this.moveRobot(stepTime, scene);
                duration -= stepTime;
            }
            this.deltaTime = duration;
        }
    }

    turnMotor(port: PortType, seconds: number): Wheel[] {
        const wheelsMoved: Wheel[] = [];
        const attachment = this.hub.ports[port];
        if (attachment.type != 'motor') {
            return wheelsMoved;
        }
        // angle is 0 for no movement to 1 for a full revolution
        const angle = attachment.motor!.move(seconds);
        for (const wheel of this.hub.wheels) {
            if (wheel.port == port) {
                wheel.distanceMoved = wheel.gearing * angle * (wheel.radius * 2.0 * Math.PI);
                if (wheel.position.y <= 1e-5) {
                    // This wheel is on the ground.
                }
                wheelsMoved.push(wheel);
            }
        }
        return wheelsMoved;
    }

    moveRobot(seconds: number, scene: SceneStore) {
        const wheelsMoved = [];
        if (this.hub.wheels.length == 0) {
            return;
        }
        for (const wheel of this.hub.wheels) {
            wheel.distanceMoved = 0.0;
        }
        wheelsMoved.push(...this.turnMotor('A', seconds));
        wheelsMoved.push(...this.turnMotor('B', seconds));
        wheelsMoved.push(...this.turnMotor('C', seconds));
        wheelsMoved.push(...this.turnMotor('D', seconds));
        wheelsMoved.push(...this.turnMotor('E', seconds));
        wheelsMoved.push(...this.turnMotor('F', seconds));
        //TODO: Check if wheels are aligned, moving in the same direction
        if (wheelsMoved.length == 1) {
            const direction = m4.transformVector(
                m4.yRotation((scene.robot.rotation! * Math.PI) / 180.0),
                [
                    wheelsMoved[0].direction.x,
                    wheelsMoved[0].direction.y,
                    wheelsMoved[0].direction.z,
                    0.0
                ]
            );
            scene.robot.position!.x += wheelsMoved[0].distanceMoved * direction[0];
            scene.robot.position!.y += wheelsMoved[0].distanceMoved * direction[1];
            scene.robot.position!.z += wheelsMoved[0].distanceMoved * direction[2];
        } else if (wheelsMoved.length == 2) {
            let d0 = wheelsMoved[0].distanceMoved;
            let d1 = wheelsMoved[1].distanceMoved;
            let p0 = wheelsMoved[0].position;
            let p1 = wheelsMoved[1].position;
            if (d0 * d1 > 0) {
                // same direction find an extended line to the center
                // and rotate
                let reverse = d0 < 0;
                d0 = Math.abs(d0);
                d1 = Math.abs(d1);
                if (d0 > d1) {
                    const td = d0;
                    d0 = d1;
                    d1 = td;
                    const tp = p0;
                    p0 = p1;
                    p1 = tp;
                    reverse = !reverse;
                }

                if ((d1 - d0) * (d1 - d0) < 1e-3) {
                    // Very close in distance, just move straight
                    const direction = m4.transformVector(
                        m4.yRotation((scene.robot.rotation! * Math.PI) / 180.0),
                        [
                            wheelsMoved[0].direction.x,
                            wheelsMoved[0].direction.y,
                            wheelsMoved[0].direction.z,
                            0.0
                        ]
                    );
                    scene.robot.position!.x += wheelsMoved[0].distanceMoved * direction[0];
                    scene.robot.position!.y += wheelsMoved[0].distanceMoved * direction[1];
                    scene.robot.position!.z += wheelsMoved[0].distanceMoved * direction[2];
                } else {
                    const r1 = dist(p0, p1);
                    const r0 = (r1 * d0) / (d1 - d0);
                    const t = r0 + r1;
                    const c: Vertex = {
                        x: (t * (p0.x - p1.x)) / r1,
                        y: (t * (p0.y - p1.y)) / r1,
                        z: (t * (p0.z - p1.z)) / r1
                    };
                    // c is the rotation point. The angle is given by rsin(a) = t, rcos(a) = d1;
                    // But we can actually use arc length so that the angle a=d1/t (radians);
                    const angle = reverse ? -d1 / t : d1 / t;
                    let matrix = m4.translation(
                        scene.robot.position!.x,
                        scene.robot.position!.y,
                        scene.robot.position!.z
                    );
                    matrix = m4.yRotate(matrix, (scene.robot.rotation! * Math.PI) / 180.0);
                    matrix = m4.translate(matrix, +c.x, +c.y, +c.z);
                    matrix = m4.yRotate(matrix, angle);
                    matrix = m4.translate(matrix, -c.x, -c.y, -c.z);
                    const position = m4.transformVector(matrix, [0, 0, 0, 1]);
                    scene.robot.position!.x = position[0];
                    scene.robot.position!.y = position[1];
                    scene.robot.position!.z = position[2];
                    scene.robot.rotation! += (angle * 180.0) / Math.PI;
                    this.hub.yaw -= (angle * 180.0) / Math.PI;
                    // hubs yaw is -180 to 180
                    while (this.hub.yaw >= 180.0) {
                        this.hub.yaw -= 360.0;
                    }
                    while (this.hub.yaw < -180.0) {
                        this.hub.yaw += 360.0;
                    }
                    while (scene.robot.rotation! >= 360.0) {
                        scene.robot.rotation! -= 360.0;
                    }
                    while (scene.robot.rotation! < 0.0) {
                        scene.robot.rotation! += 360.0;
                    }
                }
            } else {
                // opposite directions.
                // Compute a point c between the points to rotate around
                let reverse = d0 > 0;
                if (Math.abs(d0) > Math.abs(d1)) {
                    reverse = d0 > 0;
                } else {
                    reverse = d1 < 0;
                }
                d0 = Math.abs(d0);
                d1 = Math.abs(d1);
                if (d0 + d1 < 1e-3) {
                    return;
                }
                const t = dist(p0, p1);
                const r0 = (t * d0) / (d0 + d1);
                const r1 = t - r0;
                const s = 1.0 - r0 / t;
                const c: Vertex = {
                    x: s * p0.x + (1.0 - s) * p1.x,
                    y: s * p0.y + (1.0 - s) * p1.y,
                    z: s * p0.z + (1.0 - s) * p1.z
                };
                // c is the rotation point. The angle to rotate is d0 /r0 or d1/r1
                let angle = 0;
                if (r0 > r1) {
                    angle = d0 / r0;
                } else {
                    angle = d1 / r1;
                }
                if (reverse) {
                    angle = -angle;
                }
                let matrix = m4.translation(
                    scene.robot.position!.x,
                    scene.robot.position!.y,
                    scene.robot.position!.z
                );
                matrix = m4.yRotate(matrix, (scene.robot.rotation! * Math.PI) / 180.0);
                matrix = m4.translate(matrix, +c.x, +c.y, +c.z);
                matrix = m4.yRotate(matrix, angle);
                matrix = m4.translate(matrix, -c.x, -c.y, -c.z);
                const position = m4.transformVector(matrix, [0, 0, 0, 1]);
                scene.robot.position!.x = position[0];
                scene.robot.position!.y = position[1];
                scene.robot.position!.z = position[2];
                scene.robot.rotation! += (angle * 180.0) / Math.PI;
                this.hub.yaw -= (angle * 180.0) / Math.PI;
                // hubs yaw is -180 to 180
                while (this.hub.yaw >= 180.0) {
                    this.hub.yaw -= 360.0;
                }
                while (this.hub.yaw < -180.0) {
                    this.hub.yaw += 360.0;
                }
                while (scene.robot.rotation! >= 360.0) {
                    scene.robot.rotation! -= 360.0;
                }
                while (scene.robot.rotation! < 0.0) {
                    scene.robot.rotation! += 360.0;
                }
            }
        }
    }
}
