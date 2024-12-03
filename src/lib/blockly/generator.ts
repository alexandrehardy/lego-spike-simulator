import * as Blockly from 'blockly/core';
import {
    Node,
    Statement,
    ActionStatement,
    EventStatement,
    CallStatement,
    Expression,
    UnaryExpression,
    BinaryExpression,
    Value,
    Variable,
    StatementBlock,
    ProcedureBlock,
    ControlStatement,
    RepeatStatement
} from '$lib/spike/vm';

let nodes = new Map<string, Node>();
let procedures = new Map<string, ProcedureBlock>();
let events = new Map<string, EventStatement>();
let counter = 0;

export function resetCode(): void {
    nodes = new Map<string, Node>();
    procedures = new Map<string, ProcedureBlock>();
    events = new Map<string, EventStatement>();
    counter = 0;
}

export function getCodeProcedures() {
    return procedures;
}

export function getCodeEvents() {
    return events;
}

function newId(): string {
    counter++;
    return `id${counter}`;
}

function getNode(id: string) {
    return nodes.get(id.trim())!;
}

export const spikeGenerator = new Blockly.Generator('spike');

spikeGenerator.forBlock['procedures_definition'] = function (block, generator) {
    const statementId = generator.statementToCode(block, 'custom_block');
    const node = getNode(statementId);
    const proc = node as ProcedureBlock;
    // We have the statements here, get them
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock) {
        const statementIds = generator.blockToCode(nextBlock).toString();
        const statements = statementIds.split(',').map((x) => getNode(x)!);
        proc.statements.statements = statements;
    }
    // The prototype does all the work, store nothing
    return '';
};
spikeGenerator.forBlock['procedures_prototype'] = function (block, generator) {
    const name = block.getFieldValue('NAME')!;
    const args: Variable[] = [];
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
    const name = block.getFieldValue('NAME')!;
    const args: Expression[] = [];
    for (const input of block.inputList) {
        const statementId = generator.statementToCode(block, input.name);
        const arg = getNode(statementId)! as Expression;
        args.push(arg);
    }
    const id = newId();
    nodes.set(id, new CallStatement(block.id, name, args));
    return id;
};
spikeGenerator.forBlock['argument_reporter_boolean'] = function (block) {
    const variable = block.getFieldValue('VALUE')!;
    const id = newId();
    nodes.set(id, new Variable('var', block.id, variable, true));
    return id;
};
spikeGenerator.forBlock['argument_reporter_string_number'] = function (block) {
    const variable = block.getFieldValue('VALUE')!;
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
spikeGenerator.forBlock['flipperevents_color-selector'] = function (block) {
    const colour = block.getFieldValue('field_flipperevents_color-selector')!;
    const id = newId();
    nodes.set(id, new Value('color', block.id, colour));
    return id;
};
spikeGenerator.forBlock['flipperevents_color-sensor-selector'] = function (block) {
    const selected = block.getFieldValue('field_flipperevents_color-sensor-selector')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperevents_custom-tilted'] = function (block) {
    const selected = block.getFieldValue('field_flipperevents_custom-tilted')!;
    const id = newId();
    nodes.set(id, new Value('tilt', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperevents_distance-sensor-selector'] = function (block) {
    const selected = block.getFieldValue('field_flipperevents_distance-sensor-selector')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperevents_force-sensor-selector'] = function (block) {
    const selected = block.getFieldValue('field_flipperevents_force-sensor-selector')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperlight_color-matrix-selector'] = function (block) {
    const value = block.getFieldValue('field_flipperlight_color-matrix-selector')!;
    const id = newId();
    nodes.set(id, new Value('str', block.id, value));
    return id;
};
spikeGenerator.forBlock['flipperlight_color-selector-vertical'] = function (block) {
    const selected = block.getFieldValue('field_flipperlight_color-selector-vertical')!;
    const id = newId();
    nodes.set(id, new Value('color', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperlight_custom-icon-direction'] = function (block) {
    const direction = block.getFieldValue('field_flipperlight_custom-icon-direction')!;
    const id = newId();
    nodes.set(id, new Value('str', block.id, direction));
    return id;
};
spikeGenerator.forBlock['flipperlight_distance-sensor-selector'] = function (block) {
    const selected = block.getFieldValue('field_flipperlight_distance-sensor-selector')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperlight_led-selector'] = function (block) {
    const selected = block.getFieldValue('field_flipperlight_led-selector')!;
    const id = newId();
    nodes.set(id, new Value('sonar', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperlight_matrix-3x3-color-image'] = function (block) {
    const selected = block.getFieldValue('field_flipperlight_matrix-3x3-color-image')!;
    const id = newId();
    nodes.set(id, new Value('str', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperlight_matrix-5x5-brightness-image'] = function (block) {
    const selected = block.getFieldValue('field_flipperlight_matrix-5x5-brightness-image')!;
    const id = newId();
    nodes.set(id, new Value('matrix', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperlight_matrix-pixel-index'] = function (block) {
    const selected = block.getFieldValue('field_flipperlight_matrix-pixel-index')!;
    const id = newId();
    nodes.set(id, new Value('int', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flipperlight_menu_orientation'] = function (block) {
    const selected = block.getFieldValue('orientation')!;
    const id = newId();
    nodes.set(id, new Value('orient', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippermoremotor_menu_acceleration'] = function (block) {
    const selected = block.getFieldValue('field_flippermoremotor_menu_acceleration')!;
    const id = newId();
    nodes.set(id, new Value('orient', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippermoremotor_multiple-port-selector'] = function (block) {
    const selected = block.getFieldValue('field_flippermoremotor_multiple-port-selector')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippermoremotor_single-motor-selector'] = function (block) {
    const selected = block.getFieldValue('field_flippermoremotor_single-motor-selector')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippermoremove_menu_acceleration'] = function (block) {
    const selected = block.getFieldValue('field_flippermoremove_menu_acceleration')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippermoresensors_color-sensor-selector'] = function (block) {
    const selected = block.getFieldValue('field_flipperevents_color-sensor-selector')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippermotor_custom-angle'] = function (block) {
    const selected = block.getFieldValue('field_flippermotor_custom-angle')!;
    const id = newId();
    nodes.set(id, new Value('angle', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippermotor_custom-icon-direction'] = function (block) {
    const selected = block.getFieldValue('field_flippermotor_custom-icon-direction')!;
    const id = newId();
    nodes.set(id, new Value('dir', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippermotor_multiple-port-selector'] = function (block) {
    const selected = block.getFieldValue('field_flippermotor_multiple-port-selector')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippermotor_single-motor-selector'] = function (block) {
    const selected = block.getFieldValue('field_flippermotor_single-motor-selector')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippermove_custom-icon-direction'] = function (block) {
    const selected = block.getFieldValue('field_flippermove_custom-icon-direction')!;
    const id = newId();
    nodes.set(id, new Value('dir', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippermove_custom-set-move-distance-number'] = function (block) {
    const selected = block.getFieldValue('field_flippermove_custom-set-move-distance-number')!;
    const id = newId();
    nodes.set(id, new Value('int', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippermove_movement-port-selector'] = function (block) {
    const selected = block.getFieldValue('field_flippermove_movement-port-selector')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippermove_rotation-wheel'] = function (block) {
    const selected = block.getFieldValue('field_flippermove_rotation-wheel')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippermusic_menu_DRUM'] = function (block, generator) {
    return 'flippermusic_menu_DRUM';
};
spikeGenerator.forBlock['flippermusic_menu_INSTRUMENT'] = function (block, generator) {
    return 'flippermusic_menu_INSTRUMENT';
};
spikeGenerator.forBlock['flippersensors_color-selector'] = function (block) {
    const colour = block.getFieldValue('field_flippersensors_color-selector')!;
    const id = newId();
    nodes.set(id, new Value('color', block.id, colour));
    return id;
};
spikeGenerator.forBlock['flippersensors_color-sensor-selector'] = function (block) {
    const selected = block.getFieldValue('field_flippersensors_color-sensor-selector')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippersensors_custom-tilted'] = function (block) {
    const selected = block.getFieldValue('field_flippersensors_custom-tilted')!;
    const id = newId();
    nodes.set(id, new Value('tilt', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippersensors_distance-sensor-selector'] = function (block) {
    const selected = block.getFieldValue('field_flippersensors_distance-sensor-selector')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
};
spikeGenerator.forBlock['flippersensors_force-sensor-selector'] = function (block) {
    const selected = block.getFieldValue('field_flippersensors_force-sensor-selector')!;
    const id = newId();
    nodes.set(id, new Value('port', block.id, selected));
    return id;
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
spikeGenerator.forBlock['text'] = function (block) {
    const value = block.getFieldValue('TEXT')!;
    const id = newId();
    nodes.set(id, new Value('str', block.id, value));
    return id;
};
spikeGenerator.forBlock['math_number'] = function (block) {
    const value = block.getFieldValue('NUM')!;
    const id = newId();
    nodes.set(id, new Value('int', block.id, value));
    return id;
};
spikeGenerator.forBlock['math_integer'] = function (block) {
    const value = block.getFieldValue('NUM')!;
    const id = newId();
    nodes.set(id, new Value('int', block.id, value));
    return id;
};
spikeGenerator.forBlock['math_positive_number'] = function (block) {
    const value = block.getFieldValue('NUM')!;
    const id = newId();
    nodes.set(id, new Value('int', block.id, value));
    return id;
};
spikeGenerator.forBlock['math_whole_number'] = function (block) {
    const value = block.getFieldValue('NUM')!;
    const id = newId();
    nodes.set(id, new Value('int', block.id, value));
    return id;
};
spikeGenerator.forBlock['note'] = function () {
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
    const itemId = generator.statementToCode(block, 'ITEM');
    const list = block.getFieldValue('LIST')!;
    const variable = new Variable('var', block.id, list, false);
    const item = getNode(itemId)!;
    const id = newId();
    nodes.set(id, new ActionStatement('addlist', block.id, [item, variable]));
    return id;
};
spikeGenerator.forBlock['data_changevariableby'] = function (block, generator) {
    const varName = block.getFieldValue('VARIABLE')!;
    const variable = new Variable('var', block.id, varName, false);
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId)!;
    const id = newId();
    nodes.set(id, new ActionStatement('inc', block.id, [variable, value]));
    return id;
};
spikeGenerator.forBlock['data_deletealloflist'] = function (block) {
    const list = block.getFieldValue('LIST')!;
    const variable = new Variable('var', block.id, list, false);
    const id = newId();
    nodes.set(id, new ActionStatement('clear', block.id, [variable]));
    return id;
};
spikeGenerator.forBlock['data_deleteoflist'] = function (block, generator) {
    const indexId = generator.statementToCode(block, 'INDEX');
    const list = block.getFieldValue('LIST')!;
    const variable = new Variable('var', block.id, list, false);
    const index = getNode(indexId)!;
    const id = newId();
    nodes.set(id, new ActionStatement('del', block.id, [index, variable]));
    return id;
};
spikeGenerator.forBlock['data_insertatlist'] = function (block, generator) {
    const itemId = generator.statementToCode(block, 'ITEM');
    const indexId = generator.statementToCode(block, 'INDEX');
    const list = block.getFieldValue('LIST')!;
    const variable = new Variable('var', block.id, list, false);
    const item = getNode(itemId)!;
    const index = getNode(indexId)!;
    const id = newId();
    nodes.set(id, new ActionStatement('insert', block.id, [index, item, variable]));
    return id;
};
spikeGenerator.forBlock['data_itemnumoflist'] = function (block, generator) {
    const itemId = generator.statementToCode(block, 'ITEM');
    const list = block.getFieldValue('LIST')!;
    const variable = new Variable('var', block.id, list, false);
    const item = getNode(itemId)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('indexof', block.id, item, variable));
    return id;
};
spikeGenerator.forBlock['data_itemoflist'] = function (block, generator) {
    const indexId = generator.statementToCode(block, 'INDEX');
    const list = block.getFieldValue('LIST')!;
    const variable = new Variable('var', block.id, list, false);
    const index = getNode(indexId)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('item', block.id, index, variable));
    return id;
};
spikeGenerator.forBlock['data_lengthoflist'] = function (block) {
    const list = block.getFieldValue('LIST')!;
    const variable = new Variable('var', block.id, list, false);
    const id = newId();
    nodes.set(id, new UnaryExpression('lstlen', block.id, variable));
    return id;
};
spikeGenerator.forBlock['data_listcontainsitem'] = function (block, generator) {
    const itemId = generator.statementToCode(block, 'ITEM');
    const list = block.getFieldValue('LIST')!;
    const variable = new Variable('var', block.id, list, false);
    const item = getNode(itemId)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('contains', block.id, item, variable));
    return id;
};
spikeGenerator.forBlock['data_listcontents'] = function (block) {
    const list = block.getFieldValue('LIST')!;
    const variable = new Variable('var', block.id, list, false);
    const id = newId();
    nodes.set(id, new ActionStatement('list', block.id, [variable]));
    return id;
};
spikeGenerator.forBlock['data_replaceitemoflist'] = function (block, generator) {
    const itemId = generator.statementToCode(block, 'ITEM');
    const indexId = generator.statementToCode(block, 'INDEX');
    const list = block.getFieldValue('LIST')!;
    const variable = new Variable('var', block.id, list, false);
    const item = getNode(itemId)!;
    const index = getNode(indexId)!;
    const id = newId();
    nodes.set(id, new ActionStatement('replace', block.id, [index, item, variable]));
    return id;
};
spikeGenerator.forBlock['data_setvariableto'] = function (block, generator) {
    const varName = block.getFieldValue('VARIABLE')!;
    const variable = new Variable('var', block.id, varName, false);
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId)!;
    const id = newId();
    nodes.set(id, new ActionStatement('set', block.id, [variable, value]));
    return id;
};
spikeGenerator.forBlock['data_variable'] = function (block) {
    const varName = block.getFieldValue('VARIABLE')!;
    const variable = new Variable('var', block.id, varName, false);
    const id = newId();
    nodes.set(id, variable);
    return id;
};
spikeGenerator.forBlock['event_broadcast'] = function (block, generator) {
    const id = newId();
    const broadcast_inputId = generator.statementToCode(block, 'BROADCAST_INPUT');
    const broadcast_input = getNode(broadcast_inputId);
    const args = [broadcast_input];
    nodes.set(id, new ActionStatement(block.type, block.id, args));
    return id;
};
spikeGenerator.forBlock['event_broadcastandwait'] = function (block, generator) {
    const id = newId();
    const broadcast_inputId = generator.statementToCode(block, 'BROADCAST_INPUT');
    const broadcast_input = getNode(broadcast_inputId);
    const args = [broadcast_input];
    nodes.set(id, new ActionStatement(block.type, block.id, args));
    return id;
};
spikeGenerator.forBlock['event_whenbroadcastreceived'] = function (block, generator) {
    const id = newId();
    const broadcast_optionValue = block.getFieldValue('BROADCAST_OPTION')!;
    const broadcast_option = new Value('str', block.id, broadcast_optionValue);
    const args = [broadcast_option];
    // We have the statements here, get them
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    let statements: Statement[] = [];
    if (nextBlock) {
        const statementIds = generator.blockToCode(nextBlock).toString();
        statements = statementIds.split(',').map((x) => getNode(x)!);
    }
    const newNode = new EventStatement(block.type, block.id, args, new StatementBlock(statements));
    nodes.set(id, newNode);
    events.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippercontrol_stop'] = function (block) {
    const id = newId();
    const stop_optionValue = block.getFieldValue('STOP_OPTION')!;
    const stop_option = new Value('str', block.id, stop_optionValue);
    const args = [stop_option];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippercontrol_stopOtherStacks'] = function (block) {
    const id = newId();
    const args: Expression[] = [];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperevents_whenButton'] = function (block, generator) {
    const id = newId();
    const buttonValue = block.getFieldValue('BUTTON')!;
    const button = new Value('str', block.id, buttonValue);
    const eventValue = block.getFieldValue('EVENT')!;
    const event = new Value('str', block.id, eventValue);
    const args = [button, event];
    // We have the statements here, get them
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    let statements: Statement[] = [];
    if (nextBlock) {
        const statementIds = generator.blockToCode(nextBlock).toString();
        statements = statementIds.split(',').map((x) => getNode(x)!);
    }
    const newNode = new EventStatement(block.type, block.id, args, new StatementBlock(statements));
    nodes.set(id, newNode);
    events.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperevents_whenColor'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const optionId = generator.statementToCode(block, 'OPTION');
    const option = getNode(optionId);
    const args = [port, option];
    // We have the statements here, get them
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    let statements: Statement[] = [];
    if (nextBlock) {
        const statementIds = generator.blockToCode(nextBlock).toString();
        statements = statementIds.split(',').map((x) => getNode(x)!);
    }
    const newNode = new EventStatement(block.type, block.id, args, new StatementBlock(statements));
    nodes.set(id, newNode);
    events.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperevents_whenCondition'] = function (block, generator) {
    const id = newId();
    const conditionId = generator.statementToCode(block, 'CONDITION');
    const condition = getNode(conditionId);
    const args = [condition];
    // We have the statements here, get them
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    let statements: Statement[] = [];
    if (nextBlock) {
        const statementIds = generator.blockToCode(nextBlock).toString();
        statements = statementIds.split(',').map((x) => getNode(x)!);
    }
    const newNode = new EventStatement(block.type, block.id, args, new StatementBlock(statements));
    nodes.set(id, newNode);
    events.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperevents_whenDistance'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const comparatorValue = block.getFieldValue('COMPARATOR')!;
    const comparator = new Value('str', block.id, comparatorValue);
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const unitValue = block.getFieldValue('UNIT')!;
    const unit = new Value('str', block.id, unitValue);
    const args = [port, comparator, value, unit];
    // We have the statements here, get them
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    let statements: Statement[] = [];
    if (nextBlock) {
        const statementIds = generator.blockToCode(nextBlock).toString();
        statements = statementIds.split(',').map((x) => getNode(x)!);
    }
    const newNode = new EventStatement(block.type, block.id, args, new StatementBlock(statements));
    nodes.set(id, newNode);
    events.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperevents_whenGesture'] = function (block, generator) {
    const id = newId();
    const eventValue = block.getFieldValue('EVENT')!;
    const event = new Value('str', block.id, eventValue);
    const args = [event];
    // We have the statements here, get them
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    let statements: Statement[] = [];
    if (nextBlock) {
        const statementIds = generator.blockToCode(nextBlock).toString();
        statements = statementIds.split(',').map((x) => getNode(x)!);
    }
    const newNode = new EventStatement(block.type, block.id, args, new StatementBlock(statements));
    nodes.set(id, newNode);
    events.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperevents_whenOrientation'] = function (block, generator) {
    const id = newId();
    const valueValue = block.getFieldValue('VALUE')!;
    const value = new Value('str', block.id, valueValue);
    const args = [value];
    // We have the statements here, get them
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    let statements: Statement[] = [];
    if (nextBlock) {
        const statementIds = generator.blockToCode(nextBlock).toString();
        statements = statementIds.split(',').map((x) => getNode(x)!);
    }
    const newNode = new EventStatement(block.type, block.id, args, new StatementBlock(statements));
    nodes.set(id, newNode);
    events.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperevents_whenPressed'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const optionValue = block.getFieldValue('OPTION')!;
    const option = new Value('str', block.id, optionValue);
    const args = [port, option];
    // We have the statements here, get them
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    let statements: Statement[] = [];
    if (nextBlock) {
        const statementIds = generator.blockToCode(nextBlock).toString();
        statements = statementIds.split(',').map((x) => getNode(x)!);
    }
    const newNode = new EventStatement(block.type, block.id, args, new StatementBlock(statements));
    nodes.set(id, newNode);
    events.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperevents_whenProgramStarts'] = function (block, generator) {
    const id = newId();
    const args: Expression[] = [];
    // We have the statements here, get them
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    let statements: Statement[] = [];
    if (nextBlock) {
        const statementIds = generator.blockToCode(nextBlock).toString();
        statements = statementIds.split(',').map((x) => getNode(x)!);
    }
    const newNode = new EventStatement(block.type, block.id, args, new StatementBlock(statements));
    nodes.set(id, newNode);
    events.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperevents_whenTilted'] = function (block, generator) {
    const id = newId();
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const args = [value];
    // We have the statements here, get them
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    let statements: Statement[] = [];
    if (nextBlock) {
        const statementIds = generator.blockToCode(nextBlock).toString();
        statements = statementIds.split(',').map((x) => getNode(x)!);
    }
    const newNode = new EventStatement(block.type, block.id, args, new StatementBlock(statements));
    nodes.set(id, newNode);
    events.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperevents_whenTimer'] = function (block, generator) {
    const id = newId();
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const args = [value];
    // We have the statements here, get them
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    let statements: Statement[] = [];
    if (nextBlock) {
        const statementIds = generator.blockToCode(nextBlock).toString();
        statements = statementIds.split(',').map((x) => getNode(x)!);
    }
    const newNode = new EventStatement(block.type, block.id, args, new StatementBlock(statements));
    nodes.set(id, newNode);
    events.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperlight_centerButtonLight'] = function (block, generator) {
    const id = newId();
    const colorId = generator.statementToCode(block, 'COLOR');
    const color = getNode(colorId);
    const args = [color];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperlight_lightDisplayImageOn'] = function (block, generator) {
    const id = newId();
    const matrixId = generator.statementToCode(block, 'MATRIX');
    const matrix = getNode(matrixId);
    const args = [matrix];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperlight_lightDisplayImageOnForTime'] = function (block, generator) {
    const id = newId();
    const matrixId = generator.statementToCode(block, 'MATRIX');
    const matrix = getNode(matrixId);
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const args = [matrix, value];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperlight_lightDisplayOff'] = function (block) {
    const id = newId();
    const args: Expression[] = [];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperlight_lightDisplayRotate'] = function (block, generator) {
    const id = newId();
    const directionId = generator.statementToCode(block, 'DIRECTION');
    const direction = getNode(directionId);
    const args = [direction];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperlight_lightDisplaySetBrightness'] = function (block, generator) {
    const id = newId();
    const brightnessId = generator.statementToCode(block, 'BRIGHTNESS');
    const brightness = getNode(brightnessId);
    const args = [brightness];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperlight_lightDisplaySetOrientation'] = function (block, generator) {
    const id = newId();
    const orientationId = generator.statementToCode(block, 'ORIENTATION');
    const orientation = getNode(orientationId);
    const args = [orientation];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperlight_lightDisplaySetPixel'] = function (block, generator) {
    const id = newId();
    const xId = generator.statementToCode(block, 'X');
    const x = getNode(xId);
    const yId = generator.statementToCode(block, 'Y');
    const y = getNode(yId);
    const brightnessId = generator.statementToCode(block, 'BRIGHTNESS');
    const brightness = getNode(brightnessId);
    const args = [x, y, brightness];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperlight_lightDisplayText'] = function (block, generator) {
    const id = newId();
    const textId = generator.statementToCode(block, 'TEXT');
    const text = getNode(textId);
    const args = [text];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperlight_ultrasonicLightUp'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const args = [port, value];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermoremotor_motorGoToRelativePosition'] = function (
    block,
    generator
) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const positionValue = block.getFieldValue('POSITION')!;
    const position = new Value('str', block.id, positionValue);
    const speedId = generator.statementToCode(block, 'SPEED');
    const speed = getNode(speedId);
    const args = [port, position, speed];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermoremotor_motorSetAcceleration'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const timeId = generator.statementToCode(block, 'TIME');
    const time = getNode(timeId);
    const args = [port, time];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermoremotor_motorSetStopMethod'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const stopId = generator.statementToCode(block, 'STOP');
    const stop = getNode(stopId);
    const args = [port, stop];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermoremotor_motorStartPower'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const powerId = generator.statementToCode(block, 'POWER');
    const power = getNode(powerId);
    const args = [port, power];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermoresensors_acceleration'] = function (block) {
    const id = newId();
    const axisValue = block.getFieldValue('AXIS')!;
    const axis = new Value('str', block.id, axisValue);
    const args = [axis];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
    return 'flippermoresensors_acceleration';
};
spikeGenerator.forBlock['flippermoresensors_angularVelocity'] = function (block) {
    const id = newId();
    const axisValue = block.getFieldValue('AXIS')!;
    const axis = new Value('str', block.id, axisValue);
    const args = [axis];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermoresensors_orientation'] = function (block) {
    const id = newId();
    const args: Expression[] = [];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermoresensors_rawColor'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const colorValue = block.getFieldValue('COLOR')!;
    const color = new Value('str', block.id, colorValue);
    const args = [port, color];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermotor_absolutePosition'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const args = [port];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermotor_motorGoDirectionToPosition'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const directionValue = block.getFieldValue('DIRECTION')!;
    const direction = new Value('str', block.id, directionValue);
    const positionId = generator.statementToCode(block, 'POSITION');
    const position = getNode(positionId);
    const args = [port, direction, position];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermotor_motorSetSpeed'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const speedId = generator.statementToCode(block, 'SPEED');
    const speed = getNode(speedId);
    const args = [port, speed];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermotor_motorStartDirection'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const directionId = generator.statementToCode(block, 'DIRECTION');
    const direction = getNode(directionId);
    const args = [port, direction];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermotor_motorStop'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const args = [port];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermotor_motorTurnForDirection'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const directionId = generator.statementToCode(block, 'DIRECTION');
    const direction = getNode(directionId);
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const unitValue = block.getFieldValue('UNIT')!;
    const unit = new Value('str', block.id, unitValue);
    const args = [port, direction, value, unit];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermotor_speed'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const args = [port];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermove_move'] = function (block, generator) {
    const id = newId();
    const directionId = generator.statementToCode(block, 'DIRECTION');
    const direction = getNode(directionId);
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const unitValue = block.getFieldValue('UNIT')!;
    const unit = new Value('str', block.id, unitValue);
    const args = [direction, value, unit];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermove_movementSpeed'] = function (block, generator) {
    const id = newId();
    const speedId = generator.statementToCode(block, 'SPEED');
    const speed = getNode(speedId);
    const args = [speed];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermove_setDistance'] = function (block, generator) {
    const id = newId();
    const distanceId = generator.statementToCode(block, 'DISTANCE');
    const distance = getNode(distanceId);
    const unitValue = block.getFieldValue('UNIT')!;
    const unit = new Value('str', block.id, unitValue);
    const args = [distance, unit];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermove_setMovementPair'] = function (block, generator) {
    const id = newId();
    const pairId = generator.statementToCode(block, 'PAIR');
    const pair = getNode(pairId);
    const args = [pair];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermove_startMove'] = function (block, generator) {
    const id = newId();
    const directionId = generator.statementToCode(block, 'DIRECTION');
    const direction = getNode(directionId);
    const args = [direction];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermove_startSteer'] = function (block, generator) {
    const id = newId();
    const steeringId = generator.statementToCode(block, 'STEERING');
    const steering = getNode(steeringId);
    const args = [steering];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermove_steer'] = function (block, generator) {
    const id = newId();
    const steeringId = generator.statementToCode(block, 'STEERING');
    const steering = getNode(steeringId);
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const unitValue = block.getFieldValue('UNIT')!;
    const unit = new Value('str', block.id, unitValue);
    const args = [steering, value, unit];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippermove_stopMove'] = function (block) {
    const id = newId();
    const args: Expression[] = [];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flipperoperator_isInBetween'] = function (block, generator) {
    const id = newId();
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const lowId = generator.statementToCode(block, 'LOW');
    const low = getNode(lowId);
    const highId = generator.statementToCode(block, 'HIGH');
    const high = getNode(highId);
    const args = [value, low, high];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_buttonIsPressed'] = function (block) {
    const id = newId();
    const buttonValue = block.getFieldValue('BUTTON')!;
    const button = new Value('str', block.id, buttonValue);
    const eventValue = block.getFieldValue('EVENT')!;
    const event = new Value('str', block.id, eventValue);
    const args = [button, event];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_color'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const args = [port];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_distance'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const unitValue = block.getFieldValue('UNIT')!;
    const unit = new Value('str', block.id, unitValue);
    const args = [port, unit];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_force'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const unitValue = block.getFieldValue('UNIT')!;
    const unit = new Value('str', block.id, unitValue);
    const args = [port, unit];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_isColor'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const args = [port, value];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_isDistance'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const comparatorValue = block.getFieldValue('COMPARATOR')!;
    const comparator = new Value('str', block.id, comparatorValue);
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const unitValue = block.getFieldValue('UNIT')!;
    const unit = new Value('str', block.id, unitValue);
    const args = [port, comparator, value, unit];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_isPressed'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const optionValue = block.getFieldValue('OPTION')!;
    const option = new Value('str', block.id, optionValue);
    const args = [port, option];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_isReflectivity'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const comparatorValue = block.getFieldValue('COMPARATOR')!;
    const comparator = new Value('str', block.id, comparatorValue);
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const args = [port, comparator, value];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_isTilted'] = function (block, generator) {
    const id = newId();
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const args = [value];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_ismotion'] = function (block) {
    const id = newId();
    const motionValue = block.getFieldValue('MOTION')!;
    const motion = new Value('str', block.id, motionValue);
    const args = [motion];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_isorientation'] = function (block) {
    const id = newId();
    const orientationValue = block.getFieldValue('ORIENTATION')!;
    const orientation = new Value('str', block.id, orientationValue);
    const args = [orientation];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_orientationAxis'] = function (block) {
    const id = newId();
    const axisValue = block.getFieldValue('AXIS')!;
    const axis = new Value('str', block.id, axisValue);
    const args = [axis];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_reflectivity'] = function (block, generator) {
    const id = newId();
    const portId = generator.statementToCode(block, 'PORT');
    const port = getNode(portId);
    const args = [port];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_resetTimer'] = function (block) {
    const id = newId();
    const args: Expression[] = [];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_resetYaw'] = function (block) {
    const id = newId();
    const args: Expression[] = [];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersensors_timer'] = function (block) {
    const id = newId();
    const args: Expression[] = [];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersound_beep'] = function (block, generator) {
    const id = newId();
    const noteId = generator.statementToCode(block, 'NOTE');
    const note = getNode(noteId);
    const args = [note];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersound_beepForTime'] = function (block, generator) {
    const id = newId();
    const noteId = generator.statementToCode(block, 'NOTE');
    const note = getNode(noteId);
    const durationId = generator.statementToCode(block, 'DURATION');
    const duration = getNode(durationId);
    const args = [note, duration];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersound_playSound'] = function (block, generator) {
    const id = newId();
    const soundId = generator.statementToCode(block, 'SOUND');
    const sound = getNode(soundId);
    const args = [sound];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersound_playSoundUntilDone'] = function (block, generator) {
    const id = newId();
    const soundId = generator.statementToCode(block, 'SOUND');
    const sound = getNode(soundId);
    const args = [sound];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['flippersound_stopSound'] = function (block) {
    const id = newId();
    const args: Expression[] = [];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
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
    const op1 = generator.statementToCode(block, 'STRING1');
    const op2 = generator.statementToCode(block, 'STRING2');
    const left = getNode(op1)!;
    const right = getNode(op2)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('in', block.id, left, right));
    return id;
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
    const op1 = generator.statementToCode(block, 'LETTER');
    const op2 = generator.statementToCode(block, 'STRING');
    const left = getNode(op1)!;
    const right = getNode(op2)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('letter', block.id, left, right));
    return id;
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
    const name = block.getFieldValue('OPERATOR')!;
    const statementId = generator.statementToCode(block, 'NUM');
    const statement = getNode(statementId);
    const id = newId();
    nodes.set(id, new UnaryExpression(`op_${name}`, block.id, statement));
    return id;
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
    const op1 = generator.statementToCode(block, 'NUM1');
    const op2 = generator.statementToCode(block, 'NUM2');
    const left = getNode(op1)!;
    const right = getNode(op2)!;
    const id = newId();
    nodes.set(id, new BinaryExpression('-', block.id, left, right));
    return id;
};
spikeGenerator.forBlock['sound_changeeffectby'] = function (block, generator) {
    const id = newId();
    const effectValue = block.getFieldValue('EFFECT')!;
    const effect = new Value('str', block.id, effectValue);
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const args = [effect, value];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['sound_changevolumeby'] = function (block, generator) {
    const id = newId();
    const volumeId = generator.statementToCode(block, 'VOLUME');
    const volume = getNode(volumeId);
    const args = [volume];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['sound_cleareffects'] = function (block) {
    const id = newId();
    const args: Expression[] = [];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['sound_seteffectto'] = function (block, generator) {
    const id = newId();
    const effectValue = block.getFieldValue('EFFECT')!;
    const effect = new Value('str', block.id, effectValue);
    const valueId = generator.statementToCode(block, 'VALUE');
    const value = getNode(valueId);
    const args = [effect, value];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['sound_setvolumeto'] = function (block, generator) {
    const id = newId();
    const volumeId = generator.statementToCode(block, 'VOLUME');
    const volume = getNode(volumeId);
    const args = [volume];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
};
spikeGenerator.forBlock['sound_volume'] = function (block) {
    const id = newId();
    const args: Expression[] = [];
    const newNode = new ActionStatement(block.type, block.id, args);
    nodes.set(id, newNode);
    return id;
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
    if (block.type.startsWith('event_when')) {
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
