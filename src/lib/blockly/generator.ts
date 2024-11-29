import * as Blockly from 'blockly/core';

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

let nodes = new Map<string, Node>();
let procedures = new Map<string, ProcedureBlock>();
let events = new Map<string, Statement>();
let counter = 0;

export function resetCode(): void {
    nodes = new Map<string, Node>();
    procedures = new Map<string, ProcedureBlock>();
    events = new Map<string, Statement>();
    counter = 0;
}

export function getCodeProcedures() {
    return procedures;
}

export function getCodeEvents() {
    //return events;
    return nodes;
}

function newId(): string {
    counter++;
    return `id${counter}`;
}

function getNode(id: string) {
    return nodes.get(id.trim());
}

export const spikeGenerator = new Blockly.Generator('spike');

spikeGenerator.forBlock['procedures_definition'] = function (block, generator) {
    const statementId = generator.statementToCode(block, 'custom_block');
    const node = getNode(statementId);
    const proc = node as ProcedureBlock;
    // We have the statements here, get them
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock) {
        const statementIds = spikeGenerator.blockToCode(nextBlock).toString();
        const statements = statementIds.split(',').map((x) => getNode(x)!);
        proc.statements.statements = statements;
    }
    // The prototype does all the work, store nothing
    return '';
};
spikeGenerator.forBlock['procedures_prototype'] = function (block, generator) {
    const name = block.getFieldValue('NAME');
    const args = [];
    for (const input of block.inputList) {
        const statementId = generator.statementToCode(block, input.name);
        const arg = getNode(statementId)! as Variable;
        args.push(arg);
    }
    const id = newId();
    nodes.set(id, new ProcedureBlock(block.id, name, args, new StatementBlock([])));
    return id;
};
spikeGenerator.forBlock['procedures_call'] = function (block, generator) {
    const name = block.getFieldValue('NAME');
    const args = [];
    for (const input of block.inputList) {
        const statementId = generator.statementToCode(block, input.name);
        const arg = getNode(statementId)! as Expression;
        args.push(arg);
    }
    const id = newId();
    nodes.set(id, new CallStatement(block.id, name, args));
    return id;
};
spikeGenerator.forBlock['argument_reporter_boolean'] = function (block, generator) {
    const variable = block.getFieldValue('VALUE');
    const id = newId();
    nodes.set(id, new Variable('var', block.id, variable, true));
    return id;
};
spikeGenerator.forBlock['argument_reporter_string_number'] = function (block, generator) {
    const variable = block.getFieldValue('VALUE');
    const id = newId();
    nodes.set(id, new Variable('var', block.id, variable, true));
    return id;
};
spikeGenerator.forBlock['bargraphmonitor_custom-color'] = function (block, generator) {
    return 'bargraphmonitor_custom-color';
};
spikeGenerator.forBlock['displaymonitor_custom-image'] = function (block, generator) {
    return 'displaymonitor_custom-image';
};
spikeGenerator.forBlock['event_broadcast_menu'] = function (block, generator) {
    return 'event_broadcast_menu';
};
spikeGenerator.forBlock['flipperevents_color-selector'] = function (block, generator) {
    const colour = block.getFieldValue('field_flipperevents_color-selector');
    const id = newId();
    nodes.set(id, new Value('color', block.id, colour));
    return id;
};
spikeGenerator.forBlock['flipperevents_color-sensor-selector'] = function (block, generator) {
    const selected = block.getFieldValue('field_flipperevents_color-sensor-selector');
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperevents_custom-tilted'] = function (block, generator) {
    return 'flipperevents_custom-tilted';
};
spikeGenerator.forBlock['flipperevents_distance-sensor-selector'] = function (block, generator) {
    const selected = block.getFieldValue('field_flipperevents_distance-sensor-selector');
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperevents_force-sensor-selector'] = function (block, generator) {
    const selected = block.getFieldValue('field_flipperevents_force-sensor-selector');
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperlight_color-matrix-selector'] = function (block, generator) {
    const value = block.getFieldValue('field_flipperlight_color-matrix-selector');
    const id = newId();
    nodes.set(id, new Value('str', block.id, value));
    return id;
};
spikeGenerator.forBlock['flipperlight_color-selector-vertical'] = function (block, generator) {
    const selected = block.getFieldValue('field_flipperlight_color-selector-vertical');
    const id = newId();
    nodes.set(id, new Value('color', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperlight_custom-icon-direction'] = function (block, generator) {
    const direction = block.getFieldValue('field_flipperlight_custom-icon-direction');
    const id = newId();
    nodes.set(id, new Value('str', block.id, direction));
    return id;
};
spikeGenerator.forBlock['flipperlight_distance-sensor-selector'] = function (block, generator) {
    const selected = block.getFieldValue('field_flipperlight_distance-sensor-selector');
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperlight_led-selector'] = function (block, generator) {
    const selected = block.getFieldValue('field_flipperlight_led-selector');
    const id = newId();
    nodes.set(id, new Value('sonar', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperlight_matrix-3x3-color-image'] = function (block, generator) {
    const selected = block.getFieldValue('field_flipperlight_matrix-3x3-color-image');
    const id = newId();
    nodes.set(id, new Value('str', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperlight_matrix-5x5-brightness-image'] = function (block, generator) {
    const selected = block.getFieldValue('field_flipperlight_matrix-5x5-brightness-image');
    const id = newId();
    nodes.set(id, new Value('matrix', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperlight_matrix-pixel-index'] = function (block, generator) {
    const selected = block.getFieldValue('field_flipperlight_matrix-pixel-index');
    const id = newId();
    nodes.set(id, new Value('int', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperlight_menu_orientation'] = function (block, generator) {
    return 'flipperlight_menu_orientation';
};
spikeGenerator.forBlock['flippermoremotor_menu_acceleration'] = function (block, generator) {
    return 'flippermoremotor_menu_acceleration';
};
spikeGenerator.forBlock['flippermoremotor_multiple-port-selector'] = function (block, generator) {
    return 'flippermoremotor_multiple-port-selector';
};
spikeGenerator.forBlock['flippermoremotor_single-motor-selector'] = function (block, generator) {
    return 'flippermoremotor_single-motor-selector';
};
spikeGenerator.forBlock['flippermoremove_menu_acceleration'] = function (block, generator) {
    return 'flippermoremove_menu_acceleration';
};
spikeGenerator.forBlock['flippermoresensors_color-sensor-selector'] = function (block, generator) {
    return 'flippermoresensors_color-sensor-selector';
};
spikeGenerator.forBlock['flippermotor_custom-angle'] = function (block, generator) {
    return 'flippermotor_custom-angle';
};
spikeGenerator.forBlock['flippermotor_custom-icon-direction'] = function (block, generator) {
    return 'flippermotor_custom-icon-direction';
};
spikeGenerator.forBlock['flippermotor_multiple-port-selector'] = function (block, generator) {
    return 'flippermotor_multiple-port-selector';
};
spikeGenerator.forBlock['flippermotor_single-motor-selector'] = function (block, generator) {
    return 'flippermotor_single-motor-selector';
};
spikeGenerator.forBlock['flippermove_custom-icon-direction'] = function (block, generator) {
    return 'flippermove_custom-icon-direction';
};
spikeGenerator.forBlock['flippermove_custom-set-move-distance-number'] = function (
    block,
    generator
) {
    return 'flippermove_custom-set-move-distance-number';
};
spikeGenerator.forBlock['flippermove_movement-port-selector'] = function (block, generator) {
    return 'flippermove_movement-port-selector';
};
spikeGenerator.forBlock['flippermove_rotation-wheel'] = function (block, generator) {
    return 'flippermove_rotation-wheel';
};
spikeGenerator.forBlock['flippermusic_menu_DRUM'] = function (block, generator) {
    return 'flippermusic_menu_DRUM';
};
spikeGenerator.forBlock['flippermusic_menu_INSTRUMENT'] = function (block, generator) {
    return 'flippermusic_menu_INSTRUMENT';
};
spikeGenerator.forBlock['flippersensors_color-selector'] = function (block, generator) {
    return 'flippersensors_color-selector';
};
spikeGenerator.forBlock['flippersensors_color-sensor-selector'] = function (block, generator) {
    return 'flippersensors_color-sensor-selector';
};
spikeGenerator.forBlock['flippersensors_custom-tilted'] = function (block, generator) {
    return 'flippersensors_custom-tilted';
};
spikeGenerator.forBlock['flippersensors_distance-sensor-selector'] = function (block, generator) {
    return 'flippersensors_distance-sensor-selector';
};
spikeGenerator.forBlock['flippersensors_force-sensor-selector'] = function (block, generator) {
    return 'flippersensors_force-sensor-selector';
};
spikeGenerator.forBlock['flippersound_custom-piano'] = function (block, generator) {
    return 'flippersound_custom-piano';
};
spikeGenerator.forBlock['flippersound_sound-selector'] = function (block, generator) {
    return 'flippersound_sound-selector';
};
spikeGenerator.forBlock['linegraphmonitor_custom-color'] = function (block, generator) {
    return 'linegraphmonitor_custom-color';
};
spikeGenerator.forBlock['text'] = function (block, generator) {
    const value = block.getFieldValue('TEXT');
    const id = newId();
    nodes.set(id, new Value('str', block.id, value));
    return id;
};
spikeGenerator.forBlock['math_number'] = function (block, generator) {
    const value = block.getFieldValue('NUM');
    const id = newId();
    nodes.set(id, new Value('int', block.id, value));
    return id;
};
spikeGenerator.forBlock['math_integer'] = function (block, generator) {
    const value = block.getFieldValue('NUM');
    const id = newId();
    nodes.set(id, new Value('int', block.id, value));
    return id;
};
spikeGenerator.forBlock['math_positive_number'] = function (block, generator) {
    const value = block.getFieldValue('NUM');
    const id = newId();
    nodes.set(id, new Value('int', block.id, value));
    return id;
};
spikeGenerator.forBlock['math_whole_number'] = function (block, generator) {
    const value = block.getFieldValue('NUM');
    const id = newId();
    nodes.set(id, new Value('int', block.id, value));
    return id;
};
spikeGenerator.forBlock['note'] = function (block, generator) {
    // This is a comment, no code is generated
    return '';
};
spikeGenerator.forBlock['weather_menu_forecastTo'] = function (block, generator) {
    return 'weather_menu_forecastTo';
};
spikeGenerator.forBlock['control_forever'] = function (block, generator) {
    const statementIds = generator.statementToCode(block, 'SUBSTACK');
    const statements = statementIds.split(',').map((x) => getNode(x)!);
    const statementBlock = new StatementBlock(statements);
    const always = new Value('bool', block.id, 'true');
    const id = newId();
    nodes.set(id, new ControlStatement('while', block.id, always, statementBlock));
    return id;
};
spikeGenerator.forBlock['control_if'] = function (block, generator) {
    const conditionId = generator.statementToCode(block, 'CONDITION');
    const condition = getNode(conditionId)!;
    const statementIds = generator.statementToCode(block, 'SUBSTACK');
    const statements = statementIds.split(',').map((x) => getNode(x)!);
    const statementBlock = new StatementBlock(statements);
    const id = newId();
    nodes.set(id, new ControlStatement('if', block.id, condition, statementBlock));
    return id;
};
spikeGenerator.forBlock['control_if_else'] = function (block, generator) {
    const conditionId = generator.statementToCode(block, 'CONDITION');
    const condition = getNode(conditionId)!;
    const statementIds = generator.statementToCode(block, 'SUBSTACK');
    const statements = statementIds.split(',').map((x) => getNode(x)!);
    const statementBlock = new StatementBlock(statements);
    const elseIds = generator.statementToCode(block, 'SUBSTACK2');
    const elses = elseIds.split(',').map((x) => getNode(x)!);
    const elseBlock = new StatementBlock(elses);
    const id = newId();
    nodes.set(id, new ControlStatement('if', block.id, condition, statementBlock, elseBlock));
    return id;
};
spikeGenerator.forBlock['control_repeat'] = function (block, generator) {
    const timesId = generator.statementToCode(block, 'TIMES');
    const times = getNode(timesId)!;
    const statementIds = generator.statementToCode(block, 'SUBSTACK');
    const statements = statementIds.split(',').map((x) => getNode(x)!);
    const statementBlock = new StatementBlock(statements);
    const id = newId();
    nodes.set(id, new RepeatStatement('repeat', block.id, times, statementBlock));
    return id;
};
spikeGenerator.forBlock['control_repeat_until'] = function (block, generator) {
    // TODO: Should this run at least once?
    const conditionId = generator.statementToCode(block, 'CONDITION');
    const condition = getNode(conditionId)!;
    const statementIds = generator.statementToCode(block, 'SUBSTACK');
    const statements = statementIds.split(',').map((x) => getNode(x)!);
    const statementBlock = new StatementBlock(statements);
    const id = newId();
    nodes.set(id, new ControlStatement('while', block.id, condition, statementBlock));
    return id;
};
spikeGenerator.forBlock['control_wait'] = function (block, generator) {
    const durationId = generator.statementToCode(block, 'DURATION');
    const duration = getNode(durationId)!;
    const statementBlock = new StatementBlock([]);
    const id = newId();
    nodes.set(id, new ControlStatement('wait', block.id, duration, statementBlock));
    return id;
};
spikeGenerator.forBlock['control_wait_until'] = function (block, generator) {
    const conditionId = generator.statementToCode(block, 'CONDITION');
    const condition = getNode(conditionId)!;
    const statementBlock = new StatementBlock([]);
    const id = newId();
    nodes.set(id, new ControlStatement('wait4', block.id, condition, statementBlock));
    return id;
};
spikeGenerator.forBlock['data_addtolist'] = function (block, generator) {
    return 'data_addtolist';
};
spikeGenerator.forBlock['data_changevariableby'] = function (block, generator) {
    return 'data_changevariableby';
};
spikeGenerator.forBlock['data_deletealloflist'] = function (block, generator) {
    return 'data_deletealloflist';
};
spikeGenerator.forBlock['data_deleteoflist'] = function (block, generator) {
    return 'data_deleteoflist';
};
spikeGenerator.forBlock['data_insertatlist'] = function (block, generator) {
    return 'data_insertatlist';
};
spikeGenerator.forBlock['data_itemnumoflist'] = function (block, generator) {
    return 'data_itemnumoflist';
};
spikeGenerator.forBlock['data_itemoflist'] = function (block, generator) {
    return 'data_itemoflist';
};
spikeGenerator.forBlock['data_lengthoflist'] = function (block, generator) {
    return 'data_lengthoflist';
};
spikeGenerator.forBlock['data_listcontainsitem'] = function (block, generator) {
    return 'data_listcontainsitem';
};
spikeGenerator.forBlock['data_listcontents'] = function (block, generator) {
    return 'data_listcontents';
};
spikeGenerator.forBlock['data_replaceitemoflist'] = function (block, generator) {
    return 'data_replaceitemoflist';
};
spikeGenerator.forBlock['data_setvariableto'] = function (block, generator) {
    return 'data_setvariableto';
};
spikeGenerator.forBlock['data_variable'] = function (block, generator) {
    return 'data_variable';
};
spikeGenerator.forBlock['event_broadcast'] = function (block, generator) {
    return 'event_broadcast';
};
spikeGenerator.forBlock['event_broadcastandwait'] = function (block, generator) {
    return 'event_broadcastandwait';
};
spikeGenerator.forBlock['event_whenbroadcastreceived'] = function (block, generator) {
    return 'event_whenbroadcastreceived';
};
spikeGenerator.forBlock['flippercontrol_stop'] = function (block, generator) {
    return 'flippercontrol_stop';
};
spikeGenerator.forBlock['flippercontrol_stopOtherStacks'] = function (block, generator) {
    return 'flippercontrol_stopOtherStacks';
};
spikeGenerator.forBlock['flipperevents_whenButton'] = function (block, generator) {
    return 'flipperevents_whenButton';
};
spikeGenerator.forBlock['flipperevents_whenColor'] = function (block, generator) {
    return 'flipperevents_whenColor';
};
spikeGenerator.forBlock['flipperevents_whenCondition'] = function (block, generator) {
    return 'flipperevents_whenCondition';
};
spikeGenerator.forBlock['flipperevents_whenDistance'] = function (block, generator) {
    return 'flipperevents_whenDistance';
};
spikeGenerator.forBlock['flipperevents_whenGesture'] = function (block, generator) {
    return 'flipperevents_whenGesture';
};
spikeGenerator.forBlock['flipperevents_whenOrientation'] = function (block, generator) {
    return 'flipperevents_whenOrientation';
};
spikeGenerator.forBlock['flipperevents_whenPressed'] = function (block, generator) {
    return 'flipperevents_whenPressed';
};
spikeGenerator.forBlock['flipperevents_whenProgramStarts'] = function (block, generator) {
    return 'flipperevents_whenProgramStarts';
};
spikeGenerator.forBlock['flipperevents_whenTilted'] = function (block, generator) {
    return 'flipperevents_whenTilted';
};
spikeGenerator.forBlock['flipperevents_whenTimer'] = function (block, generator) {
    return 'flipperevents_whenTimer';
};
spikeGenerator.forBlock['flipperlight_centerButtonLight'] = function (block, generator) {
    return 'flipperlight_centerButtonLight';
};
spikeGenerator.forBlock['flipperlight_lightDisplayImageOn'] = function (block, generator) {
    return 'flipperlight_lightDisplayImageOn';
};
spikeGenerator.forBlock['flipperlight_lightDisplayImageOnForTime'] = function (block, generator) {
    return 'flipperlight_lightDisplayImageOnForTime';
};
spikeGenerator.forBlock['flipperlight_lightDisplayOff'] = function (block, generator) {
    return 'flipperlight_lightDisplayOff';
};
spikeGenerator.forBlock['flipperlight_lightDisplayRotate'] = function (block, generator) {
    return 'flipperlight_lightDisplayRotate';
};
spikeGenerator.forBlock['flipperlight_lightDisplaySetBrightness'] = function (block, generator) {
    return 'flipperlight_lightDisplaySetBrightness';
};
spikeGenerator.forBlock['flipperlight_lightDisplaySetOrientation'] = function (block, generator) {
    return 'flipperlight_lightDisplaySetOrientation';
};
spikeGenerator.forBlock['flipperlight_lightDisplaySetPixel'] = function (block, generator) {
    return 'flipperlight_lightDisplaySetPixel';
};
spikeGenerator.forBlock['flipperlight_lightDisplayText'] = function (block, generator) {
    return 'flipperlight_lightDisplayText';
};
spikeGenerator.forBlock['flipperlight_ultrasonicLightUp'] = function (block, generator) {
    return 'flipperlight_ultrasonicLightUp';
};
spikeGenerator.forBlock['flippermoremotor_motorGoToRelativePosition'] = function (
    block,
    generator
) {
    return 'flippermoremotor_motorGoToRelativePosition';
};
spikeGenerator.forBlock['flippermoremotor_motorSetAcceleration'] = function (block, generator) {
    return 'flippermoremotor_motorSetAcceleration';
};
spikeGenerator.forBlock['flippermoremotor_motorSetStopMethod'] = function (block, generator) {
    return 'flippermoremotor_motorSetStopMethod';
};
spikeGenerator.forBlock['flippermoremotor_motorStartPower'] = function (block, generator) {
    return 'flippermoremotor_motorStartPower';
};
spikeGenerator.forBlock['flippermoresensors_acceleration'] = function (block, generator) {
    return 'flippermoresensors_acceleration';
};
spikeGenerator.forBlock['flippermoresensors_angularVelocity'] = function (block, generator) {
    return 'flippermoresensors_angularVelocity';
};
spikeGenerator.forBlock['flippermoresensors_orientation'] = function (block, generator) {
    return 'flippermoresensors_orientation';
};
spikeGenerator.forBlock['flippermoresensors_rawColor'] = function (block, generator) {
    return 'flippermoresensors_rawColor';
};
spikeGenerator.forBlock['flippermotor_absolutePosition'] = function (block, generator) {
    return 'flippermotor_absolutePosition';
};
spikeGenerator.forBlock['flippermotor_motorGoDirectionToPosition'] = function (block, generator) {
    return 'flippermotor_motorGoDirectionToPosition';
};
spikeGenerator.forBlock['flippermotor_motorSetSpeed'] = function (block, generator) {
    return 'flippermotor_motorSetSpeed';
};
spikeGenerator.forBlock['flippermotor_motorStartDirection'] = function (block, generator) {
    return 'flippermotor_motorStartDirection';
};
spikeGenerator.forBlock['flippermotor_motorStop'] = function (block, generator) {
    return 'flippermotor_motorStop';
};
spikeGenerator.forBlock['flippermotor_motorTurnForDirection'] = function (block, generator) {
    return 'flippermotor_motorTurnForDirection';
};
spikeGenerator.forBlock['flippermotor_speed'] = function (block, generator) {
    return 'flippermotor_speed';
};
spikeGenerator.forBlock['flippermove_move'] = function (block, generator) {
    return 'flippermove_move';
};
spikeGenerator.forBlock['flippermove_movementSpeed'] = function (block, generator) {
    return 'flippermove_movementSpeed';
};
spikeGenerator.forBlock['flippermove_setDistance'] = function (block, generator) {
    return 'flippermove_setDistance';
};
spikeGenerator.forBlock['flippermove_setMovementPair'] = function (block, generator) {
    return 'flippermove_setMovementPair';
};
spikeGenerator.forBlock['flippermove_startMove'] = function (block, generator) {
    return 'flippermove_startMove';
};
spikeGenerator.forBlock['flippermove_startSteer'] = function (block, generator) {
    return 'flippermove_startSteer';
};
spikeGenerator.forBlock['flippermove_steer'] = function (block, generator) {
    return 'flippermove_steer';
};
spikeGenerator.forBlock['flippermove_stopMove'] = function (block, generator) {
    return 'flippermove_stopMove';
};
spikeGenerator.forBlock['flipperoperator_isInBetween'] = function (block, generator) {
    return 'flipperoperator_isInBetween';
};
spikeGenerator.forBlock['flippersensors_buttonIsPressed'] = function (block, generator) {
    return 'flippersensors_buttonIsPressed';
};
spikeGenerator.forBlock['flippersensors_color'] = function (block, generator) {
    return 'flippersensors_color';
};
spikeGenerator.forBlock['flippersensors_distance'] = function (block, generator) {
    return 'flippersensors_distance';
};
spikeGenerator.forBlock['flippersensors_force'] = function (block, generator) {
    return 'flippersensors_force';
};
spikeGenerator.forBlock['flippersensors_isColor'] = function (block, generator) {
    return 'flippersensors_isColor';
};
spikeGenerator.forBlock['flippersensors_isDistance'] = function (block, generator) {
    return 'flippersensors_isDistance';
};
spikeGenerator.forBlock['flippersensors_isPressed'] = function (block, generator) {
    return 'flippersensors_isPressed';
};
spikeGenerator.forBlock['flippersensors_isReflectivity'] = function (block, generator) {
    return 'flippersensors_isReflectivity';
};
spikeGenerator.forBlock['flippersensors_isTilted'] = function (block, generator) {
    return 'flippersensors_isTilted';
};
spikeGenerator.forBlock['flippersensors_ismotion'] = function (block, generator) {
    return 'flippersensors_ismotion';
};
spikeGenerator.forBlock['flippersensors_isorientation'] = function (block, generator) {
    return 'flippersensors_isorientation';
};
spikeGenerator.forBlock['flippersensors_orientationAxis'] = function (block, generator) {
    return 'flippersensors_orientationAxis';
};
spikeGenerator.forBlock['flippersensors_reflectivity'] = function (block, generator) {
    return 'flippersensors_reflectivity';
};
spikeGenerator.forBlock['flippersensors_resetTimer'] = function (block, generator) {
    return 'flippersensors_resetTimer';
};
spikeGenerator.forBlock['flippersensors_resetYaw'] = function (block, generator) {
    return 'flippersensors_resetYaw';
};
spikeGenerator.forBlock['flippersensors_timer'] = function (block, generator) {
    return 'flippersensors_timer';
};
spikeGenerator.forBlock['flippersound_beep'] = function (block, generator) {
    return 'flippersound_beep';
};
spikeGenerator.forBlock['flippersound_beepForTime'] = function (block, generator) {
    return 'flippersound_beepForTime';
};
spikeGenerator.forBlock['flippersound_playSound'] = function (block, generator) {
    return 'flippersound_playSound';
};
spikeGenerator.forBlock['flippersound_playSoundUntilDone'] = function (block, generator) {
    return 'flippersound_playSoundUntilDone';
};
spikeGenerator.forBlock['flippersound_stopSound'] = function (block, generator) {
    return 'flippersound_stopSound';
};
spikeGenerator.forBlock['operator_add'] = function (block, generator) {
    const op1 = generator.statementToCode(block, 'NUM1');
    const op2 = generator.statementToCode(block, 'NUM2');
    const left = getNode(op1)!;
    const right = getNode(op2)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('+', block.id, left, right));
    return id;
};
spikeGenerator.forBlock['operator_and'] = function (block, generator) {
    const op1 = generator.statementToCode(block, 'OPERAND1');
    const op2 = generator.statementToCode(block, 'OPERAND2');
    const left = getNode(op1)!;
    const right = getNode(op2)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('and', block.id, left, right));
    return id;
};
spikeGenerator.forBlock['operator_contains'] = function (block, generator) {
    return 'operator_contains';
};
spikeGenerator.forBlock['operator_divide'] = function (block, generator) {
    const op1 = generator.statementToCode(block, 'NUM1');
    const op2 = generator.statementToCode(block, 'NUM2');
    const left = getNode(op1)!;
    const right = getNode(op2)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('/', block.id, left, right));
    return id;
};
spikeGenerator.forBlock['operator_equals'] = function (block, generator) {
    const op1 = generator.statementToCode(block, 'OPERAND1');
    const op2 = generator.statementToCode(block, 'OPERAND2');
    const left = getNode(op1)!;
    const right = getNode(op2)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('==', block.id, left, right));
    return id;
};
spikeGenerator.forBlock['operator_gt'] = function (block, generator) {
    const op1 = generator.statementToCode(block, 'OPERAND1');
    const op2 = generator.statementToCode(block, 'OPERAND2');
    const left = getNode(op1)!;
    const right = getNode(op2)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('>', block.id, left, right));
    return id;
};
spikeGenerator.forBlock['operator_join'] = function (block, generator) {
    const op1 = generator.statementToCode(block, 'STRING1');
    const op2 = generator.statementToCode(block, 'STRING2');
    const left = getNode(op1)!;
    const right = getNode(op2)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('join', block.id, left, right));
    return id;
};
spikeGenerator.forBlock['operator_length'] = function (block, generator) {
    const argId = generator.statementToCode(block, 'STRING');
    const arg = getNode(argId)!;
    const id = newId();
    nodes.set(id, new UnaryExpression('len', block.id, arg));
    return id;
};
spikeGenerator.forBlock['operator_letter_of'] = function (block, generator) {
    return 'operator_letter_of';
};
spikeGenerator.forBlock['operator_lt'] = function (block, generator) {
    const op1 = generator.statementToCode(block, 'OPERAND1');
    const op2 = generator.statementToCode(block, 'OPERAND2');
    const left = getNode(op1)!;
    const right = getNode(op2)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('<', block.id, left, right));
    return id;
};
spikeGenerator.forBlock['operator_mathop'] = function (block, generator) {
    return 'operator_mathop';
};
spikeGenerator.forBlock['operator_mod'] = function (block, generator) {
    const op1 = generator.statementToCode(block, 'NUM1');
    const op2 = generator.statementToCode(block, 'NUM2');
    const left = getNode(op1)!;
    const right = getNode(op2)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('%', block.id, left, right));
    return id;
};
spikeGenerator.forBlock['operator_multiply'] = function (block, generator) {
    const op1 = generator.statementToCode(block, 'NUM1');
    const op2 = generator.statementToCode(block, 'NUM2');
    const left = getNode(op1)!;
    const right = getNode(op2)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('*', block.id, left, right));
    return id;
};
spikeGenerator.forBlock['operator_not'] = function (block, generator) {
    const argId = generator.statementToCode(block, 'OPERAND');
    const arg = getNode(argId)!;
    const id = newId();
    nodes.set(id, new UnaryExpression('not', block.id, arg));
    return id;
};
spikeGenerator.forBlock['operator_or'] = function (block, generator) {
    const op1 = generator.statementToCode(block, 'OPERAND1');
    const op2 = generator.statementToCode(block, 'OPERAND2');
    const left = getNode(op1)!;
    const right = getNode(op2)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('or', block.id, left, right));
    return id;
};
spikeGenerator.forBlock['operator_random'] = function (block, generator) {
    const op1 = generator.statementToCode(block, 'FROM');
    const op2 = generator.statementToCode(block, 'TO');
    const left = getNode(op1)!;
    const right = getNode(op2)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('rnd', block.id, left, right));
    return id;
};
spikeGenerator.forBlock['operator_round'] = function (block, generator) {
    const argId = generator.statementToCode(block, 'NUM');
    const arg = getNode(argId)!;
    const id = newId();
    nodes.set(id, new UnaryExpression('not', block.id, arg));
    return id;
};
spikeGenerator.forBlock['operator_subtract'] = function (block, generator) {
    return 'operator_subtract';
};
spikeGenerator.forBlock['sound_changeeffectby'] = function (block, generator) {
    return 'sound_changeeffectby';
};
spikeGenerator.forBlock['sound_changevolumeby'] = function (block, generator) {
    return 'sound_changevolumeby';
};
spikeGenerator.forBlock['sound_cleareffects'] = function (block, generator) {
    return 'sound_cleareffects';
};
spikeGenerator.forBlock['sound_seteffectto'] = function (block, generator) {
    return 'sound_seteffectto';
};
spikeGenerator.forBlock['sound_setvolumeto'] = function (block, generator) {
    return 'sound_setvolumeto';
};
spikeGenerator.forBlock['sound_volume'] = function (block, generator) {
    return 'sound_volume';
};
spikeGenerator.scrub_ = function (block, code, thisOnly) {
    if (block.type == 'procedures_definition') {
        // We parse this separately
        return code;
    }
    if (block.type.startsWith('flipperevents_when')) {
        // We parse this separately
        return code;
    }
    if (block.type.startsWith('events_when')) {
        // We parse this separately
        return code;
    }
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock && !thisOnly) {
        if (code.length > 0) {
            return code + ',' + spikeGenerator.blockToCode(nextBlock);
        } else {
            return spikeGenerator.blockToCode(nextBlock).toString();
        }
    }
    return code;
};
