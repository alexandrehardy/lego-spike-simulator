export const blocks = [
    {
        type: 'bargraphmonitor_custom-color',
        message0: '%1',
        args0: [{ type: 'bargraphmonitor_custom-color', name: 'field_bargraphmonitor_custom-color' }],
        output: 'String'
    },
    {
        type: 'displaymonitor_custom-image',
        message0: '%1',
        args0: [{ type: 'displaymonitor_custom-image', name: 'field_displaymonitor_custom-image' }],
        output: 'String'
    },
    {
        type: 'event_broadcast_menu',
        message0: '%1',
        args0: [
            {
                type: 'field_variable_getter',
                name: 'BROADCAST_OPTION',
                variable: 'message1',
                variableTypes: ['broadcast'],
                defaultType: 'broadcast'
            }
        ],
        output: 'broadcast'
    },
    {
        type: 'flipperevents_color-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_colour',
                name: 'field_flipperevents_color-selector',
                colour: '#e700a7',
                colourOptions: [
                    '#e700a7',
                    '#0090f5',
                    '#77e8ff',
                    '#00a845',
                    '#ffe360',
                    '#ff000c',
                    '#ffffff',
                    '#000000',
                    '#000000ff'
                ],
                colourTitles: [
                    'magenta',
                    'blue',
                    'turquoise',
                    'green',
                    'yellow',
                    'red',
                    'white',
                    'black',
                    'none'
                ],
                columns: 3
            }
        ],
        output: 'String'
    },
    {
        type: 'flipperevents_color-sensor-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_grid_dropdown',
                name: 'field_flipperevents_color-sensor-selector',
                columns: 2,
                maxItems: 1,
                minItems: 1,
                options: [
                    ['A', 'A'],
                    ['B', 'B'],
                    ['C', 'C'],
                    ['D', 'D'],
                    ['E', 'E'],
                    ['F', 'F']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flipperevents_custom-tilted',
        message0: '%1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'field_flipperevents_custom-tilted',
                options: [
                    ['forward', '1'],
                    ['backward', '2'],
                    ['left', '3'],
                    ['right', '4']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flipperevents_distance-sensor-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_grid_dropdown',
                name: 'field_flipperevents_distance-sensor-selector',
                columns: 2,
                maxItems: 1,
                minItems: 1,
                options: [
                    ['A', 'A'],
                    ['B', 'B'],
                    ['C', 'C'],
                    ['D', 'D'],
                    ['E', 'E'],
                    ['F', 'F']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flipperevents_force-sensor-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_grid_dropdown',
                name: 'field_flipperevents_force-sensor-selector',
                columns: 2,
                maxItems: 1,
                minItems: 1,
                options: [
                    ['A', 'A'],
                    ['B', 'B'],
                    ['C', 'C'],
                    ['D', 'D'],
                    ['E', 'E'],
                    ['F', 'F']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flipperlight_color-matrix-selector',
        message0: '%1',
        args0: [{ type: 'flipperlight_color-matrix-selector', name: 'field_flipperlight_color-matrix-selector' }],
        output: 'String'
    },
    {
        type: 'flipperlight_color-selector-vertical',
        message0: '%1',
        args0: [
            {
                type: 'field_colour',
                name: 'field_flipperlight_color-selector-vertical',
                colour: '#e700a7',
                colourOptions: [
                    '#e700a7',
                    '#0090f5',
                    '#77e8ff',
                    '#00a845',
                    '#ffe360',
                    '#ff000c',
                    '#ffffff',
                    '#000000',
                    '#000000ff'
                ],
                colourTitles: [
                    'magenta',
                    'blue',
                    'turquoise',
                    'green',
                    'yellow',
                    'red',
                    'white',
                    'black',
                    'none'
                ],
                columns: 3
            }
        ],
        output: 'String'
    },
    {
        type: 'flipperlight_custom-icon-direction',
        message0: '%1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'field_flipperlight_custom-icon-direction',
                options: [
                    ['clockwise', 'clockwise'],
                    ['counterclockwise', 'counterclockwise']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flipperlight_distance-sensor-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_grid_dropdown',
                name: 'field_flipperlight_distance-sensor-selector',
                columns: 2,
                maxItems: 1,
                minItems: 1,
                options: [
                    ['A', 'A'],
                    ['B', 'B'],
                    ['C', 'C'],
                    ['D', 'D'],
                    ['E', 'E'],
                    ['F', 'F']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flipperlight_led-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_grid_dropdown',
                name: 'field_flipperlight_led-selector',
                columns: 2,
                maxItems: 4,
                minItems: 0,
                options: [
                    ['TL', 'TL'],
                    ['TR', 'TR'],
                    ['BL', 'BL'],
                    ['BR', 'BR']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flipperlight_matrix-3x3-color-image',
        message0: '%1',
        args0: [{ type: 'flipperlight_matrix-3x3-color-image', name: 'field_flipperlight_matrix-3x3-color-image' }],
        output: 'String'
    },
    {
        type: 'flipperlight_matrix-5x5-brightness-image',
        message0: '%1',
        args0: [
            {
                type: 'field_bitmap',
                name: 'field_flipperlight_matrix-5x5-brightness-image',
                width: 5,
                height: 5,
                value: [
                    [1, 1, 0, 1, 1],
                    [1, 1, 0, 1, 1],
                    [0, 0, 0, 0, 0],
                    [1, 0, 0, 0, 1],
                    [0, 1, 1, 1, 0]
                ],
                buttons: {
                    randomize: false,
                    clear: true
                },
                fieldHeight: 30
            }
        ],
        output: 'String'
    },
    {
        type: 'flipperlight_matrix-pixel-index',
        message0: '%1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'field_flipperlight_matrix-pixel-index',
                options: [
                    ['1', '1'],
                    ['2', '2'],
                    ['3', '3'],
                    ['4', '4'],
                    ['5', '5']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flipperlight_menu_orientation',
        message0: '%1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'orientation',
                options: [
                    ['upright', '1'],
                    ['left', '2'],
                    ['right', '3'],
                    ['upside down', '4']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flippermoremotor_menu_acceleration',
        message0: '%1',
        args0: [{ type: 'flippermoremotor_menu_acceleration', name: 'field_flippermoremotor_menu_acceleration' }],
        output: 'String'
    },
    {
        type: 'flippermoremotor_multiple-port-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_grid_dropdown',
                name: 'field_flippermoremotor_multiple-port-selector',
                columns: 2,
                maxItems: 6,
                minItems: 1,
                separator: '',
                options: [
                    ['A', 'A'],
                    ['B', 'B'],
                    ['C', 'C'],
                    ['D', 'D'],
                    ['E', 'E'],
                    ['F', 'F']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flippermoremotor_single-motor-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_grid_dropdown',
                name: 'field_flippermoremotor_single-motor-selector',
                columns: 2,
                maxItems: 1,
                minItems: 1,
                options: [
                    ['A', 'A'],
                    ['B', 'B'],
                    ['C', 'C'],
                    ['D', 'D'],
                    ['E', 'E'],
                    ['F', 'F']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flippermoremove_menu_acceleration',
        message0: '%1',
        args0: [{ type: 'flippermoremove_menu_acceleration', name: 'field_flippermoremove_menu_acceleration' }],
        output: 'String'
    },
    {
        type: 'flippermoresensors_color-sensor-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_grid_dropdown',
                name: 'field_flippermoresensors_color-sensor-selector',
                columns: 2,
                maxItems: 1,
                minItems: 1,
                options: [
                    ['A', 'A'],
                    ['B', 'B'],
                    ['C', 'C'],
                    ['D', 'D'],
                    ['E', 'E'],
                    ['F', 'F']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flippermotor_custom-angle',
        message0: '%1',
        args0: [
            {
                type: 'field_angle',
                name: 'field_flippermotor_custom-angle',
                value: '0',
                mode: 'compass',
                precision: 1
            }
        ],
        output: 'Number'
    },
    {
        type: 'flippermotor_custom-icon-direction',
        message0: '%1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'field_flippermotor_custom-icon-direction',
                options: [
                    ['clockwise', 'clockwise'],
                    ['counterclockwise', 'counterclockwise']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flippermotor_multiple-port-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_grid_dropdown',
                name: 'field_flippermotor_multiple-port-selector',
                columns: 2,
                maxItems: 6,
                minItems: 1,
                separator: '',
                options: [
                    ['A', 'A'],
                    ['B', 'B'],
                    ['C', 'C'],
                    ['D', 'D'],
                    ['E', 'E'],
                    ['F', 'F']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flippermotor_single-motor-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_grid_dropdown',
                name: 'field_flippermotor_single-motor-selector',
                columns: 2,
                maxItems: 1,
                minItems: 1,
                options: [
                    ['A', 'A'],
                    ['B', 'B'],
                    ['C', 'C'],
                    ['D', 'D'],
                    ['E', 'E'],
                    ['F', 'F']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flippermove_custom-icon-direction',
        message0: '%1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'field_flippermove_custom-icon-direction',
                options: [
                    ['forward', 'forward'],
                    ['backward', 'backward']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flippermove_custom-set-move-distance-number',
        message0: '%1',
        args0: [
            { type: 'field_number', name: 'field_flippermove_custom-set-move-distance-number' }
        ],
        output: 'String'
    },
    {
        type: 'flippermove_movement-port-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_grid_dropdown',
                name: 'field_flippermove_movement-port-selector',
                columns: 2,
                maxItems: 2,
                minItems: 2,
                sorted: false,
                separator: '',
                options: [
                    ['A', 'A'],
                    ['B', 'B'],
                    ['C', 'C'],
                    ['D', 'D'],
                    ['E', 'E'],
                    ['F', 'F']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flippermove_rotation-wheel',
        message0: '%1',
        args0: [
            {
                type: 'field_angle',
                name: 'field_flippermove_rotation-wheel',
                value: '0',
                mode: 'steering',
                precision: 1
            }
        ],
        output: 'Number'
    },
    {
        type: 'flippermusic_menu_DRUM',
        message0: '%1',
        args0: [{ type: 'flippermusic_menu_DRUM', name: 'field_flippermusic_menu_DRUM' }],
        output: 'String'
    },
    {
        type: 'flippermusic_menu_INSTRUMENT',
        message0: '%1',
        args0: [{ type: 'flippermusic_menu_INSTRUMENT', name: 'field_flippermusic_menu_INSTRUMENT' }],
        output: 'String'
    },
    {
        type: 'flippersensors_color-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_colour',
                name: 'field_flippersensors_color-selector',
                colour: '#e700a7',
                colourOptions: [
                    '#e700a7',
                    '#0090f5',
                    '#77e8ff',
                    '#00a845',
                    '#ffe360',
                    '#ff000c',
                    '#ffffff',
                    '#000000',
                    '#000000ff'
                ],
                colourTitles: [
                    'magenta',
                    'blue',
                    'turquoise',
                    'green',
                    'yellow',
                    'red',
                    'white',
                    'black',
                    'none'
                ],
                columns: 3
            }
        ],
        output: 'String'
    },
    {
        type: 'flippersensors_color-sensor-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_grid_dropdown',
                name: 'field_flippersensors_color-sensor-selector',
                columns: 2,
                maxItems: 1,
                minItems: 1,
                options: [
                    ['A', 'A'],
                    ['B', 'B'],
                    ['C', 'C'],
                    ['D', 'D'],
                    ['E', 'E'],
                    ['F', 'F']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flippersensors_custom-tilted',
        message0: '%1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'field_flippersensors_custom-tilted',
                options: [
                    ['forward', '1'],
                    ['backward', '2'],
                    ['left', '3'],
                    ['right', '4']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flippersensors_distance-sensor-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_grid_dropdown',
                name: 'field_flippersensors_distance-sensor-selector',
                columns: 2,
                maxItems: 1,
                minItems: 1,
                options: [
                    ['A', 'A'],
                    ['B', 'B'],
                    ['C', 'C'],
                    ['D', 'D'],
                    ['E', 'E'],
                    ['F', 'F']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flippersensors_force-sensor-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_grid_dropdown',
                name: 'field_flippersensors_force-sensor-selector',
                columns: 2,
                maxItems: 1,
                minItems: 1,
                options: [
                    ['A', 'A'],
                    ['B', 'B'],
                    ['C', 'C'],
                    ['D', 'D'],
                    ['E', 'E'],
                    ['F', 'F']
                ]
            }
        ],
        output: 'String'
    },
    {
        type: 'flippersound_custom-piano',
        message0: '%1',
        args0: [
            {
                type: 'field_number',
                name: 'field_flippersound_custom-piano',
                precision: 1,
                min: 48,
                max: 108
            }
        ],
        output: 'Number'
    },
    {
        type: 'flippersound_sound-selector',
        message0: '%1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'field_flippersound_sound-selector',
                options: [['Cat Meow 1', '{"name":"Cat Meow 1","location":"device"}']]
            }
        ],
        output: 'String'
    },
    {
        type: 'linegraphmonitor_custom-color',
        message0: '%1',
        args0: [{ type: 'linegraphmonitor_custom-color', name: 'field_linegraphmonitor_custom-color' }],
        output: 'String'
    },
    {
        type: 'math_integer',
        message0: '%1',
        args0: [
            {
                type: 'field_number',
                name: 'NUM',
                precision: 1
            }
        ],
        output: 'Number'
    },
    {
        type: 'math_positive_number',
        message0: '%1',
        args0: [
            {
                type: 'field_number',
                name: 'NUM',
                min: 1
            }
        ],
        output: 'Number'
    },
    {
        type: 'math_whole_number',
        message0: '%1',
        args0: [
            {
                type: 'field_number',
                name: 'NUM',
                min: 0,
                precision: 1
            }
        ],
        output: 'Number'
    },
    {
        type: 'note',
        message0: '%1',
        args0: [{ type: 'note', name: 'field_note' }],
        output: 'String'
    },
    {
        type: 'procedures_prototype',
        message0: '%1',
        args0: [{ type: 'procedures_prototype', name: 'field_procedures_prototype' }],
        output: 'String'
    },
    {
        type: 'weather_menu_forecastTo',
        message0: '%1',
        args0: [{ type: 'weather_menu_forecastTo', name: 'field_weather_menu_forecastTo' }],
        output: 'String'
    },
    {
        type: 'control_forever',
        id: 'control_forever',
        message0: 'forever',
        message1: '%1',
        message2: '%1',
        lastDummyAlign2: 'RIGHT',
        args1: [
            {
                type: 'input_statement',
                name: 'SUBSTACK'
            }
        ],
        args2: [
            {
                type: 'field_image',
                src: 'icons/repeat.svg',
                width: 24,
                height: 24,
                alt: '*',
                flip_rtl: true
            }
        ],
        colour: '#ffb515',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'control_if',
        message0: 'if %1 then',
        message1: '%1',
        args0: [
            {
                type: 'input_value',
                name: 'CONDITION',
                check: 'Boolean'
            }
        ],
        args1: [
            {
                type: 'input_statement',
                name: 'SUBSTACK'
            }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#ffb515',
        extensions: ['shadow_input']
    },
    {
        type: 'control_if_else',
        message0: 'if %1 then',
        message1: '%1',
        message2: 'else',
        message3: '%1',
        args0: [
            {
                type: 'input_value',
                name: 'CONDITION',
                check: 'Boolean'
            }
        ],
        args1: [
            {
                type: 'input_statement',
                name: 'SUBSTACK'
            }
        ],
        args3: [
            {
                type: 'input_statement',
                name: 'SUBSTACK2'
            }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#ffb515',
        extensions: ['shadow_input']
    },
    {
        type: 'control_repeat',
        id: 'control_repeat',
        message0: 'repeat %1',
        message1: '%1',
        message2: '%1',
        lastDummyAlign2: 'RIGHT',
        args0: [
            {
                type: 'input_value',
                name: 'TIMES',
                check: 'Number',
                shadow: {
                    type: 'math_whole_number',
                    fields: {
                        NUM: '10'
                    }
                }
            }
        ],
        args1: [
            {
                type: 'input_statement',
                name: 'SUBSTACK'
            }
        ],
        args2: [
            {
                type: 'field_image',
                src: 'icons/repeat.svg',
                width: 24,
                height: 24,
                alt: '*',
                flip_rtl: true
            }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#ffb515',
        extensions: ['shadow_input']
    },
    {
        type: 'control_repeat_until',
        message0: 'repeat until %1',
        message1: '%1',
        message2: '%1',
        lastDummyAlign2: 'RIGHT',
        args0: [
            {
                type: 'input_value',
                name: 'CONDITION',
                check: 'Boolean'
            }
        ],
        args1: [
            {
                type: 'input_statement',
                name: 'SUBSTACK'
            }
        ],
        args2: [
            {
                type: 'field_image',
                src: 'icons/repeat.svg',
                width: 24,
                height: 24,
                alt: '*',
                flip_rtl: true
            }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#ffb515',
        extensions: ['shadow_input']
    },
    {
        type: 'control_wait',
        id: 'control_wait',
        message0: 'wait %1 seconds',
        args0: [
            {
                type: 'input_value',
                name: 'DURATION',
                check: 'Number',
                shadow: {
                    type: 'math_positive_number',
                    fields: {
                        NUM: '1'
                    }
                }
            }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#ffb515',
        extensions: ['shadow_input']
    },
    {
        type: 'control_wait_until',
        message0: 'wait until %1',
        args0: [
            {
                type: 'input_value',
                name: 'CONDITION',
                check: 'Boolean'
            }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#ffb515',
        extensions: ['shadow_input']
    },
    {
        type: 'data_addtolist',
        message0: 'add %1 to %2',
        args0: [
            {
                type: 'input_value',
                name: 'ITEM',
                shadow: {
                    type: 'text',
                    fields: {
                        TEXT: 'thing'
                    }
                }
            },
            {
                type: 'field_variable_getter',
                name: 'LIST',
                variableTypes: ['list'],
                defaultType: 'list'
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: '#ff9835',
        extensions: ['shadow_input']
    },
    {
        type: 'data_changevariableby',
        message0: 'change %1 by %2',
        args0: [
            {
                type: 'field_variable_getter',
                name: 'VARIABLE',
                variableTypes: ['Number'],
                defaultType: 'Number'
            },
            {
                type: 'input_value',
                name: 'VALUE',
                check: 'Number',
                shadow: {
                    type: 'math_number',
                    fields: {
                        NUM: '1'
                    }
                }
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: '#ff9835',
        extensions: ['shadow_input']
    },
    {
        type: 'data_deletealloflist',
        message0: 'delete all of %1',
        args0: [
            {
                type: 'field_variable_getter',
                name: 'LIST',
                variableTypes: ['list'],
                defaultType: 'list'
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: '#ff9835',
        extensions: ['shadow_input']
    },
    {
        type: 'data_deleteoflist',
        message0: 'delete %1 of %2',
        args0: [
            {
                type: 'input_value',
                name: 'INDEX',
                check: 'Number',
                shadow: {
                    type: 'math_integer',
                    fields: {
                        field_math_integer: '1'
                    }
                }
            },
            {
                type: 'field_variable_getter',
                name: 'LIST',
                variableTypes: ['list'],
                defaultType: 'list'
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: '#ff9835',
        extensions: ['shadow_input']
    },
    {
        type: 'data_insertatlist',
        message0: 'insert %1 at %2 of %3',
        args0: [
            {
                type: 'input_value',
                name: 'ITEM',
                shadow: {
                    type: 'text',
                    fields: {
                        TEXT: 'thing'
                    }
                }
            },
            {
                type: 'input_value',
                name: 'INDEX',
                check: 'Number',
                shadow: {
                    type: 'math_integer',
                    fields: {
                        NUM: '1'
                    }
                }
            },
            {
                type: 'field_variable_getter',
                name: 'LIST',
                variableTypes: ['list'],
                defaultType: 'list'
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: '#ff9835',
        extensions: ['shadow_input']
    },
    {
        type: 'data_itemnumoflist',
        message0: 'item # of %1 in %2',
        args0: [
            {
                type: 'input_value',
                name: 'ITEM',
                shadow: {
                    type: 'text',
                    fields: {
                        TEXT: 'thing'
                    }
                }
            },
            {
                type: 'field_variable_getter',
                name: 'LIST',
                variableTypes: ['list'],
                defaultType: 'list'
            }
        ],
        inputsInline: true,
        output: 'Number',
        outputShape: 2,
        colour: '#ff9835',
        extensions: ['shadow_input']
    },
    {
        type: 'data_itemoflist',
        message0: 'item %1 of %2',
        args0: [
            {
                type: 'input_value',
                name: 'INDEX',
                check: 'Number',
                shadow: {
                    type: 'math_integer',
                    fields: {
                        NUM: '1'
                    }
                }
            },
            {
                type: 'field_variable_getter',
                name: 'LIST',
                variableTypes: ['list'],
                defaultType: 'list'
            }
        ],
        inputsInline: true,
        output: null,
        outputShape: 2,
        colour: '#ff9835',
        extensions: ['shadow_input']
    },
    {
        type: 'data_lengthoflist',
        message0: 'length of %1',
        args0: [
            {
                type: 'field_variable_getter',
                name: 'LIST',
                variableTypes: ['list'],
                defaultType: 'list'
            }
        ],
        inputsInline: true,
        output: 'Number',
        colour: '#ff9835',
        extensions: ['shadow_input']
    },
    {
        type: 'data_listcontainsitem',
        message0: '%1 contains %2?',
        args0: [
            {
                type: 'field_variable_getter',
                name: 'LIST',
                variableTypes: ['list'],
                defaultType: 'list'
            },
            {
                type: 'input_value',
                name: 'ITEM',
                shadow: {
                    type: 'text',
                    fields: {
                        TEXT: 'thing'
                    }
                }
            }
        ],
        inputsInline: true,
        output: 'Boolean',
        colour: '#ff9835',
        extensions: ['shadow_input']
    },
    {
        type: 'data_listcontents',
        message0: '%1',
        args0: [
            {
                type: 'field_variable_getter',
                text: '',
                name: 'LIST',
                variableTypes: ['list'],
                defaultType: 'list'
            }
        ],
        inputsInline: true,
        checkboxInFlyout: true,
        output: 'list',
        colour: '#ff9835',
        extensions: ['shadow_input']
    },
    {
        type: 'data_replaceitemoflist',
        message0: 'replace item %1 of %2 with %3',
        args0: [
            {
                type: 'input_value',
                name: 'INDEX',
                check: 'Number',
                shadow: {
                    type: 'math_integer',
                    fields: {
                        NUM: '1'
                    }
                }
            },
            {
                type: 'field_variable_getter',
                name: 'LIST',
                variableTypes: ['list'],
                defaultType: 'list'
            },
            {
                type: 'input_value',
                name: 'ITEM',
                shadow: {
                    type: 'text',
                    fields: {
                        TEXT: 'thing'
                    }
                }
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: '#ff9835',
        extensions: ['shadow_input']
    },
    {
        type: 'data_setvariableto',
        message0: 'set %1 to %2',
        args0: [
            {
                type: 'field_variable_getter',
                name: 'VARIABLE',
                variableTypes: ['Number'],
                defaultType: 'Number'
            },
            {
                type: 'input_value',
                name: 'VALUE',
                shadow: {
                    type: 'text',
                    fields: {
                        TEXT: '0'
                    }
                }
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: '#ff9835',
        extensions: ['shadow_input']
    },
    {
        type: 'data_variable',
        message0: '%1',
        lastDummyAlign0: 'CENTRE',
        args0: [
            {
                type: 'field_variable_getter',
                text: '',
                name: 'VARIABLE',
                variableTypes: ['Number'],
                defaultType: 'Number'
            }
        ],
        inputsInline: true,
        checkboxInFlyout: true,
        output: 'Number',
        colour: '#ff9835',
        extensions: ['shadow_input']
    },
    {
        type: 'event_broadcast',
        id: 'event_broadcast',
        message0: 'broadcast %1',
        args0: [
            {
                type: 'input_value',
                name: 'BROADCAST_INPUT',
                check: 'broadcast',
                shadow: {
                    type: 'event_broadcast_menu',
                    fields: {
                        BROADCAST_OPTION: 'message1'
                    }
                }
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: '#f5c402',
        extensions: ['shadow_input']
    },
    {
        type: 'event_broadcastandwait',
        message0: 'broadcast %1 and wait',
        args0: [
            {
                type: 'input_value',
                name: 'BROADCAST_INPUT',
                check: 'broadcast',
                shadow: {
                    type: 'event_broadcast_menu',
                    fields: {
                        BROADCAST_OPTION: 'message1'
                    }
                }
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: '#f5c402',
        extensions: ['shadow_input']
    },
    {
        type: 'event_whenbroadcastreceived',
        id: 'event_whenbroadcastreceived',
        message0: 'when I receive %1',
        args0: [
            {
                type: 'field_variable_getter',
                name: 'BROADCAST_OPTION',
                variable: 'message1'
            }
        ],
        inputsInline: true,
        colour: '#f5c402',
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippercontrol_stop',
        message0: 'stop %1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'STOP_OPTION',
                options: [
                    ['all', 'all'],
                    ['other stacks', 'other'],
                    ['and exit program', 'program'],
                    ['this stack', 'this']
                ]
            }
        ],
        inputsInline: true,
        colour: '#ffb515',
        tooltip: 'flippercontrol_stop',
        previousStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippercontrol_stopOtherStacks',
        message0: 'stop other stacks',
        args0: [],
        colour: '#ffb515',
        tooltip: 'flippercontrol_stopOtherStacks',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperevents_whenButton',
        message0: '%3 when %1 button %2',
        args0: [
            {
                type: 'field_dropdown',
                name: 'BUTTON',
                options: [
                    ['left', 'left'],
                    ['right', 'right']
                ]
            },
            {
                type: 'field_dropdown',
                name: 'EVENT',
                options: [
                    ['pressed', 'pressed'],
                    ['released', 'released']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/EventsHub.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#f5c402',
        tooltip: 'flipperevents_whenButton',
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperevents_whenColor',
        message0: '%3 %1 when colour is %2',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flipperevents_color-sensor-selector',
                    fields: { 'field_flipperevents_color-sensor-selector': 'A' }
                }
            },
            {
                type: 'input_value',
                check: 'String',
                name: 'OPTION',
                shadow: {
                    type: 'flipperevents_color-selector',
                    fields: {
                        'field_flipperevents_color-selector': '9'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/EventsLight.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#f5c402',
        tooltip: 'flipperevents_whenColor',
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperevents_whenCondition',
        message0: 'when %1',
        args0: [
            {
                type: 'input_value',
                name: 'CONDITION',
                check: 'Boolean'
            }
        ],
        inputsInline: true,
        colour: '#f5c402',
        tooltip: 'flipperevents_whenCondition',
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperevents_whenDistance',
        message0: '%5 %1 when %2  %3  %4',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flipperevents_distance-sensor-selector',
                    fields: { 'field_flipperevents_distance-sensor-selector': 'A' }
                }
            },
            {
                type: 'field_dropdown',
                name: 'COMPARATOR',
                options: [
                    ['closer than', '<'],
                    ['exactly at', '='],
                    ['further than', '>']
                ]
            },
            {
                type: 'input_value',
                name: 'VALUE',
                value: 36,
                check: 'Number'
            },
            {
                type: 'field_dropdown',
                name: 'UNIT',
                options: [
                    ['%', '%'],
                    ['cm', 'cm'],
                    ['in', 'in']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/EventsUltra.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#f5c402',
        tooltip: 'flipperevents_whenDistance',
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperevents_whenGesture',
        message0: '%2 when %1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'EVENT',
                options: [
                    ['shaken', 'shake'],
                    ['tapped', 'tapped'],
                    ['falling', 'freefall']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/EventsPressure.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#f5c402',
        tooltip: 'flipperevents_whenGesture',
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperevents_whenOrientation',
        message0: '%2 when %1 is up',
        args0: [
            {
                type: 'field_dropdown',
                name: 'VALUE',
                options: [
                    ['front', 'front'],
                    ['back', 'back'],
                    ['top', 'top'],
                    ['bottom', 'bottom'],
                    ['left side', 'left side'],
                    ['right side', 'right side']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/EventsHub.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#f5c402',
        tooltip: 'flipperevents_whenOrientation',
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperevents_whenPressed',
        message0: '%3 %1 when %2',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flipperevents_force-sensor-selector',
                    fields: { 'field_flipperevents_force-sensor-selector': 'A' }
                }
            },
            {
                type: 'field_dropdown',
                name: 'OPTION',
                options: [
                    ['pressed', 'pressed'],
                    ['hard-pressed', 'hard-pressed'],
                    ['released', 'released'],
                    ['pressure changed', 'pressure changed']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/EventsPressure.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#f5c402',
        tooltip: 'flipperevents_whenPressed',
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperevents_whenProgramStarts',
        message0: '%1 when program starts',
        args0: [
            {
                type: 'field_image',
                src: 'icons/EventsStart.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#f5c402',
        tooltip: 'flipperevents_whenProgramStarts',
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperevents_whenTilted',
        message0: '%2 when tilted %1',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'VALUE',
                shadow: {
                    type: 'flipperevents_custom-tilted',
                    fields: {
                        'field_flipperevents_custom-tilted': '1'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/EventsHub.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#f5c402',
        tooltip: 'flipperevents_whenTilted',
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperevents_whenTimer',
        message0: 'when timer > %1',
        args0: [
            {
                type: 'input_value',
                name: 'VALUE',
                value: 36,
                check: 'Number'
            }
        ],
        inputsInline: true,
        colour: '#f5c402',
        tooltip: 'flipperevents_whenTimer',
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperlight_centerButtonLight',
        message0: '%2 set Centre Button Light to %1',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'COLOR',
                shadow: {
                    type: 'flipperlight_color-selector-vertical',
                    fields: {
                        'field_flipperlight_color-selector-vertical': '9'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Light.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#9b6af6',
        tooltip: 'flipperlight_centerButtonLight',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperlight_lightDisplayImageOn',
        message0: '%2 turn on %1',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'MATRIX',
                shadow: {
                    type: 'flipperlight_matrix-5x5-brightness-image',
                    fields: {
                        'field_flipperlight_matrix-5x5-brightness-image':
                            '9909999099000009000909990'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Light.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#9b6af6',
        tooltip: 'flipperlight_lightDisplayImageOn',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperlight_lightDisplayImageOnForTime',
        message0: '%3 turn on %1 for %2 seconds',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'MATRIX',
                shadow: {
                    type: 'flipperlight_matrix-5x5-brightness-image',
                    fields: {
                        'field_flipperlight_matrix-5x5-brightness-image':
                            '9909999099000009000909990'
                    }
                }
            },
            {
                type: 'input_value',
                name: 'VALUE',
                check: 'Number',
                value: 36,
                shadow: {
                    type: 'math_number',
                    fields: {
                        NUM: 2
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Light.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#9b6af6',
        tooltip: 'flipperlight_lightDisplayImageOnForTime',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperlight_lightDisplayOff',
        message0: '%1 turn off pixels',
        args0: [
            {
                type: 'field_image',
                src: 'icons/Light.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#9b6af6',
        tooltip: 'flipperlight_lightDisplayOff',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperlight_lightDisplayRotate',
        message0: '%2 rotate %1',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'DIRECTION',
                shadow: {
                    type: 'flipperlight_custom-icon-direction',
                    fields: {
                        'field_flipperlight_custom-icon-direction': 'clockwise'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Light.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#9b6af6',
        tooltip: 'flipperlight_lightDisplayRotate',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperlight_lightDisplaySetBrightness',
        message0: '%2 set pixel brightness to %1 %%',
        args0: [
            {
                type: 'input_value',
                name: 'BRIGHTNESS',
                value: 2,
                check: 'Number',
                shadow: {
                    type: 'math_number',
                    fields: {
                        NUM: '75'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Light.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#9b6af6',
        tooltip: 'flipperlight_lightDisplaySetBrightness',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperlight_lightDisplaySetOrientation',
        message0: '%2 set orientation to %1',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'ORIENTATION',
                shadow: {
                    type: 'flipperlight_menu_orientation',
                    fields: {
                        orientation: '1'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Light.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#9b6af6',
        tooltip: 'flipperlight_lightDisplaySetOrientation',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperlight_lightDisplaySetPixel',
        message0: '%4 set pixel at %1 , %2 to %3 %%',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'X',
                shadow: {
                    type: 'flipperlight_matrix-pixel-index',
                    fields: {
                        'field_flipperlight_matrix-pixel-index': '1'
                    }
                }
            },
            {
                type: 'input_value',
                check: 'String',
                name: 'Y',
                shadow: {
                    type: 'flipperlight_matrix-pixel-index',
                    fields: {
                        'field_flipperlight_matrix-pixel-index': '1'
                    }
                }
            },
            {
                type: 'input_value',
                name: 'BRIGHTNESS',
                value: 2,
                check: 'Number',
                shadow: {
                    type: 'math_number',
                    fields: {
                        NUM: '100'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Light.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#9b6af6',
        tooltip: 'flipperlight_lightDisplaySetPixel',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperlight_lightDisplayText',
        message0: '%2 write %1',
        args0: [
            {
                type: 'input_value',
                name: 'TEXT',
                value: 51,
                check: ['String'],
                shadow: {
                    type: 'text',
                    fields: {
                        TEXT: 'Hello'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Light.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#9b6af6',
        tooltip: 'flipperlight_lightDisplayText',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperlight_ultrasonicLightUp',
        message0: '%3 %1 light up %2',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flipperlight_distance-sensor-selector',
                    fields: { 'field_flipperlight_distance-sensor-selector': 'A' }
                }
            },
            {
                type: 'input_value',
                check: 'String',
                name: 'VALUE',
                shadow: {
                    type: 'flipperlight_led-selector',
                    fields: {
                        'field_flipperlight_led-selector': '100 100 100 100'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/UltraSound.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#9b6af6',
        tooltip: 'flipperlight_ultrasonicLightUp',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermoremotor_motorGoToRelativePosition',
        message0: '%4 %1 go to relative position %2 at %3 %% speed',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippermoremotor_multiple-port-selector',
                    fields: { 'field_flippermoremotor_multiple-port-selector': 'A' }
                }
            },
            {
                type: 'field_angle',
                name: 'POSITION',
                value: '0',
                mode: 'compass',
                precision: 1
            },
            {
                type: 'input_value',
                name: 'SPEED',
                check: 'Number',
                value: 29,
                shadow: {
                    type: 'math_number',
                    fields: {
                        NUM: '100'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Motors.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#0090f5',
        tooltip: 'flippermoremotor_motorGoToRelativePosition',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermoremotor_motorSetAcceleration',
        message0: '%3 %1 set acceleration to %2 seconds',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippermoremotor_multiple-port-selector',
                    fields: { 'field_flippermoremotor_multiple-port-selector': 'A' }
                }
            },
            {
                type: 'input_value',
                name: 'TIME',
                value: 33
            },
            {
                type: 'field_image',
                src: 'icons/Motors.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#0090f5',
        tooltip: 'flippermoremotor_motorSetAcceleration',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermoremotor_motorSetStopMethod',
        message0: '%3 %1 set motors to %2 at stop',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippermoremotor_multiple-port-selector',
                    fields: { 'field_flippermoremotor_multiple-port-selector': 'A' }
                }
            },
            {
                type: 'input_value',
                name: 'STOP',
                value: 31
            },
            {
                type: 'field_image',
                src: 'icons/Motors.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#0090f5',
        tooltip: 'flippermoremotor_motorSetStopMethod',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermoremotor_motorStartPower',
        message0: '%3 %1 start motor at %2 %% power',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippermoremotor_multiple-port-selector',
                    fields: { 'field_flippermoremotor_multiple-port-selector': 'A' }
                }
            },
            {
                type: 'input_value',
                name: 'POWER',
                check: 'Number',
                shadow: {
                    type: 'math_number',
                    fields: {
                        NUM: '100'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Motors.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#0090f5',
        tooltip: 'flippermoremotor_motorStartPower',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermoresensors_acceleration',
        message0: '%2 acceleration %1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'AXIS',
                options: [
                    ['pitch', 'pitch'],
                    ['roll', 'roll'],
                    ['yaw', 'yaw']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/SensorHub.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#34ccf1',
        tooltip: 'flippermoresensors_acceleration',
        output: 'Number',
        extensions: ['shadow_input']
    },
    {
        type: 'flippermoresensors_angularVelocity',
        message0: '%2 angular velocity %1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'AXIS',
                options: [
                    ['pitch', 'pitch'],
                    ['roll', 'roll'],
                    ['yaw', 'yaw']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/SensorHub.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#34ccf1',
        tooltip: 'flippermoresensors_angularVelocity',
        output: 'Number',
        extensions: ['shadow_input']
    },
    {
        type: 'flippermoresensors_orientation',
        message0: '%1 orientation',
        args0: [
            {
                type: 'field_image',
                src: 'icons/SensorHub.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#34ccf1',
        tooltip: 'flippermoresensors_orientation',
        output: 'Number',
        extensions: ['shadow_input']
    },
    {
        type: 'flippermoresensors_rawColor',
        message0: '%3 %1 raw %2',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippermoresensors_color-sensor-selector',
                    fields: { 'field_flippermoresensors_color-sensor-selector': 'A' }
                }
            },
            {
                type: 'field_colour',
                name: 'COLOR',
                colour: '#e700a7',
                colourOptions: [
                    '#e700a7',
                    '#0090f5',
                    '#77e8ff',
                    '#00a845',
                    '#ffe360',
                    '#ff000c',
                    '#ffffff',
                    '#000000',
                    '#000000ff'
                ],
                colourTitles: [
                    'magenta',
                    'blue',
                    'turquoise',
                    'green',
                    'yellow',
                    'red',
                    'white',
                    'black',
                    'none'
                ],
                columns: 3
            },
            {
                type: 'field_image',
                src: 'icons/SensorLight.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#34ccf1',
        tooltip: 'flippermoresensors_rawColor',
        output: 'Number',
        extensions: ['shadow_input']
    },
    {
        type: 'flippermotor_absolutePosition',
        message0: '%2 %1 position',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippermotor_single-motor-selector',
                    fields: { 'field_flippermotor_single-motor-selector': 'A' }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Motors.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#0090f5',
        tooltip: 'flippermotor_absolutePosition',
        output: 'Number',
        extensions: ['shadow_input']
    },
    {
        type: 'flippermotor_motorGoDirectionToPosition',
        message0: '%4 %1 go %2 to position %3',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippermotor_multiple-port-selector',
                    fields: { 'field_flippermotor_multiple-port-selector': 'A' }
                }
            },
            {
                type: 'field_dropdown',
                name: 'DIRECTION',
                options: [
                    ['shortest path', 'shortest'],
                    ['clockwise', 'clockwise'],
                    ['counterclockwise', 'counterclockwise']
                ]
            },
            {
                type: 'input_value',
                check: 'Number',
                name: 'POSITION',
                shadow: {
                    type: 'flippermotor_custom-angle',
                    fields: {
                        'field_flippermotor_custom-angle': '0'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Motors.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#0090f5',
        tooltip: 'flippermotor_motorGoDirectionToPosition',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermotor_motorSetSpeed',
        message0: '%3 %1 set speed to %2 %%',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippermotor_multiple-port-selector',
                    fields: { 'field_flippermotor_multiple-port-selector': 'A' }
                }
            },
            {
                type: 'input_value',
                name: 'SPEED',
                check: 'Number',
                value: 29,
                shadow: {
                    type: 'math_number',
                    fields: {
                        NUM: '75'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Motors.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#0090f5',
        tooltip: 'flippermotor_motorSetSpeed',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermotor_motorStartDirection',
        message0: '%3 %1 start motor %2',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippermotor_multiple-port-selector',
                    fields: { 'field_flippermotor_multiple-port-selector': 'A' }
                }
            },
            {
                type: 'input_value',
                check: 'String',
                name: 'DIRECTION',
                shadow: {
                    type: 'flippermotor_custom-icon-direction',
                    fields: { 'field_flippermotor_custom-icon-direction': 'clockwise' }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Motors.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#0090f5',
        tooltip: 'flippermotor_motorStartDirection',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermotor_motorStop',
        message0: '%2 %1 stop motor',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippermotor_multiple-port-selector',
                    fields: { 'field_flippermotor_multiple-port-selector': 'A' }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Motors.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#0090f5',
        tooltip: 'flippermotor_motorStop',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermotor_motorTurnForDirection',
        message0: '%5 %1 run %2 for %3  %4',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippermotor_multiple-port-selector',
                    fields: { 'field_flippermotor_multiple-port-selector': 'A' }
                }
            },
            {
                type: 'input_value',
                check: 'String',
                name: 'DIRECTION',
                shadow: {
                    type: 'flippermotor_custom-icon-direction',
                    fields: { 'field_flippermotor_custom-icon-direction': 'clockwise' }
                }
            },
            {
                type: 'input_value',
                name: 'VALUE',
                value: 36,
                check: 'Number'
            },
            {
                type: 'field_dropdown',
                name: 'UNIT',
                options: [
                    ['rotations', 'rotations'],
                    ['degrees', 'degrees'],
                    ['seconds', 'seconds']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/Motors.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#0090f5',
        tooltip: 'flippermotor_motorTurnForDirection',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermotor_speed',
        message0: '%2 %1 speed',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippermotor_single-motor-selector',
                    fields: { 'field_flippermotor_single-motor-selector': 'A' }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Motors.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#0090f5',
        tooltip: 'flippermotor_speed',
        output: 'Number',
        extensions: ['shadow_input']
    },
    {
        type: 'flippermove_move',
        message0: '%4 move %1 for %2  %3',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'DIRECTION',
                shadow: {
                    type: 'flippermove_custom-icon-direction',
                    fields: { 'field_flippermove_custom-icon-direction': 'forward' }
                }
            },
            {
                type: 'input_value',
                name: 'VALUE',
                value: 36,
                check: 'Number',
                shadow: {
                    type: 'math_number',
                    fields: {
                        NUM: '10'
                    }
                }
            },
            {
                type: 'field_dropdown',
                name: 'UNIT',
                options: [
                    ['rotations', 'rotations'],
                    ['degrees', 'degrees'],
                    ['seconds', 'seconds'],
                    ['cm', 'cm'],
                    ['in', 'in']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/Movement.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#ff4ccd',
        tooltip: 'flippermove_move',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermove_movementSpeed',
        message0: '%2 set movement speed to %1 %%',
        args0: [
            {
                type: 'input_value',
                name: 'SPEED',
                check: 'Number',
                value: 29,
                shadow: {
                    type: 'math_number',
                    fields: {
                        NUM: 50
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Movement.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#ff4ccd',
        tooltip: 'flippermove_movementSpeed',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermove_setDistance',
        message0: '%3 set 1 motor rotation to %1  %2 moved',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'DISTANCE',
                shadow: {
                    type: 'flippermove_custom-set-move-distance-number',
                    fields: {
                        'field_flippermove_custom-set-move-distance-number': '17.5'
                    }
                }
            },
            {
                type: 'field_dropdown',
                name: 'UNIT',
                options: [
                    ['cm', 'cm'],
                    ['in', 'in']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/Movement.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#ff4ccd',
        tooltip: 'flippermove_setDistance',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermove_setMovementPair',
        message0: '%2 set movement motors to %1',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PAIR',
                shadow: {
                    type: 'flippermove_movement-port-selector',
                    fields: {
                        'field_flippermove_movement-port-selector': 'AB'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Movement.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#ff4ccd',
        tooltip: 'flippermove_setMovementPair',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermove_startMove',
        message0: '%2 start moving %1',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'DIRECTION',
                shadow: {
                    type: 'flippermove_custom-icon-direction',
                    fields: { 'field_flippermove_custom-icon-direction': 'forward' }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Movement.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#ff4ccd',
        tooltip: 'flippermove_startMove',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermove_startSteer',
        message0: '%2 start moving %1',
        args0: [
            {
                type: 'input_value',
                check: 'Number',
                name: 'STEERING',
                shadow: {
                    type: 'flippermove_rotation-wheel',
                    fields: {
                        'field_flippermove_rotation-wheel': '30'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Movement.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#ff4ccd',
        tooltip: 'flippermove_startSteer',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermove_steer',
        message0: '%4 move %1 for %2  %3',
        args0: [
            {
                type: 'input_value',
                check: 'Number',
                name: 'STEERING',
                shadow: {
                    type: 'flippermove_rotation-wheel',
                    fields: {
                        'field_flippermove_rotation-wheel': '30'
                    }
                }
            },
            {
                type: 'input_value',
                name: 'VALUE',
                value: 36,
                check: 'Number',
                shadow: {
                    type: 'math_number',
                    fields: {
                        NUM: '10'
                    }
                }
            },
            {
                type: 'field_dropdown',
                name: 'UNIT',
                options: [
                    ['rotations', 'rotations'],
                    ['degrees', 'degrees'],
                    ['seconds', 'seconds']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/Movement.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#ff4ccd',
        tooltip: 'flippermove_steer',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippermove_stopMove',
        message0: '%1 stop moving',
        args0: [
            {
                type: 'field_image',
                src: 'icons/Movement.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#ff4ccd',
        tooltip: 'flippermove_stopMove',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flipperoperator_isInBetween',
        message0: 'is %1 in between %2 and %3 ?',
        args0: [
            {
                type: 'input_value',
                name: 'VALUE',
                value: 36
            },
            {
                type: 'input_value',
                name: 'LOW',
                value: 20
            },
            {
                type: 'input_value',
                name: 'HIGH',
                value: 13
            }
        ],
        inputsInline: true,
        colour: '#00b94d',
        tooltip: 'flipperoperator_isInBetween',
        output: 'Boolean',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_buttonIsPressed',
        message0: '%3 is %1 button %2 ?',
        args0: [
            {
                type: 'field_dropdown',
                name: 'BUTTON',
                options: [
                    ['left', 'left'],
                    ['right', 'right']
                ]
            },
            {
                type: 'field_dropdown',
                name: 'EVENT',
                options: [
                    ['pressed', 'pressed'],
                    ['released', 'released']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/SensorHub.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#3fccf1',
        tooltip: 'flippersensors_buttonIsPressed',
        output: 'Number',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_color',
        message0: '%2 %1 colour',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippersensors_color-sensor-selector',
                    fields: { 'field_flippersensors_color-sensor-selector': 'A' }
                }
            },
            {
                type: 'field_image',
                src: 'icons/SensorLight.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#3fccf1',
        tooltip: 'flippersensors_color',
        output: 'Number',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_distance',
        message0: '%3 %1 distance in %2',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippersensors_distance-sensor-selector',
                    fields: { 'field_flippersensors_distance-sensor-selector': 'A' }
                }
            },
            {
                type: 'field_dropdown',
                name: 'UNIT',
                options: [
                    ['%', '%'],
                    ['cm', 'cm'],
                    ['in', 'in']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/SensorUltra.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#3fccf1',
        tooltip: 'flippersensors_distance',
        output: 'Number',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_force',
        message0: '%3 %1 pressure in %2',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippersensors_force-sensor-selector',
                    fields: { 'field_flippersensors_force-sensor-selector': 'A' }
                }
            },
            {
                type: 'field_dropdown',
                name: 'UNIT',
                options: [
                    ['newton', 'newton'],
                    ['%', '%']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/SensorPressure.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#3fccf1',
        tooltip: 'flippersensors_force',
        output: 'Number',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_isColor',
        message0: '%3 %1 is colour %2 ?',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippersensors_color-sensor-selector',
                    fields: { 'field_flippersensors_color-sensor-selector': 'A' }
                }
            },
            {
                type: 'input_value',
                check: 'String',
                name: 'VALUE',
                shadow: {
                    type: 'flippersensors_color-selector',
                    fields: {
                        'field_flippersensors_color-selector': '9'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/SensorLight.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#3fccf1',
        tooltip: 'flippersensors_isColor',
        output: 'Boolean',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_isDistance',
        message0: '%5 %1 is %2  %3  %4 ?',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippersensors_distance-sensor-selector',
                    fields: { 'field_flippersensors_distance-sensor-selector': 'A' }
                }
            },
            {
                type: 'field_dropdown',
                name: 'COMPARATOR',
                options: [
                    ['closer than', '<'],
                    ['exactly at', '='],
                    ['further than', '>']
                ]
            },
            {
                type: 'input_value',
                name: 'VALUE',
                value: 36,
                check: 'Number',
                shadow: {
                    type: 'math_number',
                    fields: {
                        NUM: '15'
                    }
                }
            },
            {
                type: 'field_dropdown',
                name: 'UNIT',
                options: [
                    ['%', '%'],
                    ['cm', 'cm'],
                    ['in', 'in']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/SensorUltra.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#3fccf1',
        tooltip: 'flippersensors_isDistance',
        output: 'Boolean',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_isPressed',
        message0: '%3 %1 is %2 ?',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippersensors_force-sensor-selector',
                    fields: { 'field_flippersensors_force-sensor-selector': 'A' }
                }
            },
            {
                type: 'field_dropdown',
                name: 'OPTION',
                options: [
                    ['pressed', 'pressed'],
                    ['hard-pressed', 'hard-pressed'],
                    ['released', 'released']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/SensorPressure.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#3fccf1',
        tooltip: 'flippersensors_isPressed',
        output: 'Boolean',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_isReflectivity',
        message0: '%4 %1 reflection %2  %3 %% ?',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippersensors_color-sensor-selector',
                    fields: { 'field_flippersensors_color-sensor-selector': 'A' }
                }
            },
            {
                type: 'field_dropdown',
                name: 'COMPARATOR',
                options: [
                    ['<', '<'],
                    ['=', '='],
                    ['>', '>']
                ]
            },
            {
                type: 'input_value',
                name: 'VALUE',
                value: 36,
                check: 'Number',
                shadow: {
                    type: 'math_number',
                    fields: {
                        NUM: '50'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/SensorLight.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#3fccf1',
        tooltip: 'flippersensors_isReflectivity',
        output: 'Boolean',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_isTilted',
        message0: '%2 Is tilted %1 ?',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'VALUE',
                shadow: {
                    type: 'flippersensors_custom-tilted',
                    fields: {
                        'field_flippersensors_custom-tilted': '1'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/SensorHub.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#3fccf1',
        tooltip: 'flippersensors_isTilted',
        output: 'Boolean',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_ismotion',
        message0: '%2 is %1 ?',
        args0: [
            {
                type: 'field_dropdown',
                name: 'MOTION',
                options: [
                    ['shaken', 'shake'],
                    ['tapped', 'tapped'],
                    ['falling', 'falling']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/SensorHub.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#3fccf1',
        tooltip: 'flippersensors_ismotion',
        output: 'Boolean',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_isorientation',
        message0: '%2 is %1 up?',
        args0: [
            {
                type: 'field_dropdown',
                name: 'ORIENTATION',
                options: [
                    ['front', 'front'],
                    ['back', 'back'],
                    ['top', 'top'],
                    ['bottom', 'bottom'],
                    ['left side', 'left side'],
                    ['right side', 'right side']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/SensorHub.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#3fccf1',
        tooltip: 'flippersensors_isorientation',
        output: 'Boolean',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_orientationAxis',
        message0: '%2 %1 angle',
        args0: [
            {
                type: 'field_dropdown',
                name: 'AXIS',
                options: [
                    ['pitch', 'pitch'],
                    ['roll', 'roll'],
                    ['yaw', 'yaw']
                ]
            },
            {
                type: 'field_image',
                src: 'icons/SensorHub.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#3fccf1',
        tooltip: 'flippersensors_orientationAxis',
        output: 'Number',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_reflectivity',
        message0: '%2 %1 reflected light',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'PORT',
                shadow: {
                    type: 'flippersensors_color-sensor-selector',
                    fields: { 'field_flippersensors_color-sensor-selector': 'A' }
                }
            },
            {
                type: 'field_image',
                src: 'icons/SensorLight.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#3fccf1',
        tooltip: 'flippersensors_reflectivity',
        output: 'Number',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_resetTimer',
        message0: 'reset timer',
        args0: [],
        colour: '#3fccf1',
        tooltip: 'flippersensors_resetTimer',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_resetYaw',
        message0: '%1 set yaw angle to 0',
        args0: [
            {
                type: 'field_image',
                src: 'icons/SensorHub.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#3fccf1',
        tooltip: 'flippersensors_resetYaw',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippersensors_timer',
        message0: 'timer',
        args0: [],
        colour: '#3fccf1',
        tooltip: 'flippersensors_timer',
        output: 'Number',
        extensions: ['shadow_input']
    },
    {
        type: 'flippersound_beep',
        message0: '%2 start playing beep %1',
        args0: [
            {
                type: 'input_value',
                check: 'Number',
                name: 'NOTE',
                shadow: {
                    type: 'flippersound_custom-piano',
                    fields: {
                        'field_flippersound_custom-piano': '60'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Light.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#c061f1',
        tooltip: 'flippersound_beep',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippersound_beepForTime',
        message0: '%3 play beep %1 for %2 seconds',
        args0: [
            {
                type: 'input_value',
                name: 'NOTE',
                value: 22,
                check: 'Number',
                shadow: {
                    type: 'flippersound_custom-piano',
                    fields: {
                        'field_flippersound_custom-piano': '60'
                    }
                }
            },
            {
                type: 'input_value',
                name: 'DURATION',
                value: 10,
                check: 'Number',
                shadow: {
                    type: 'math_number',
                    fields: {
                        NUM: '0.2'
                    }
                }
            },
            {
                type: 'field_image',
                src: 'icons/Light.svg',
                width: 24,
                height: 24
            }
        ],
        inputsInline: true,
        colour: '#c061f1',
        tooltip: 'flippersound_beepForTime',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippersound_playSound',
        message0: 'start sound %1',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'SOUND',
                shadow: {
                    type: 'flippersound_sound-selector',
                    fields: {
                        'field_flippersound_sound-selector':
                            '{"name":"Cat Meow 1","location":"device"}'
                    }
                }
            }
        ],
        inputsInline: true,
        colour: '#c061f1',
        tooltip: 'flippersound_playSound',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippersound_playSoundUntilDone',
        message0: 'play sound %1 until done',
        args0: [
            {
                type: 'input_value',
                check: 'String',
                name: 'SOUND',
                shadow: {
                    type: 'flippersound_sound-selector',
                    fields: {
                        'field_flippersound_sound-selector':
                            '{"name":"Cat Meow 1","location":"device"}'
                    }
                }
            }
        ],
        inputsInline: true,
        colour: '#c061f1',
        tooltip: 'flippersound_playSoundUntilDone',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'flippersound_stopSound',
        message0: 'stop all sounds',
        args0: [],
        colour: '#c061f1',
        tooltip: 'flippersound_stopSound',
        previousStatement: null,
        nextStatement: null,
        extensions: ['shadow_input']
    },
    {
        type: 'operator_add',
        message0: '%1 + %2',
        args0: [
            {
                type: 'input_value',
                name: 'NUM1'
            },
            {
                type: 'input_value',
                name: 'NUM2'
            }
        ],
        inputsInline: true,
        output: 'Number',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_and',
        message0: '%1 and %2',
        args0: [
            {
                type: 'input_value',
                name: 'OPERAND1',
                check: 'Boolean'
            },
            {
                type: 'input_value',
                name: 'OPERAND2',
                check: 'Boolean'
            }
        ],
        inputsInline: true,
        output: 'Boolean',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_contains',
        message0: '%1 contains %2?',
        args0: [
            {
                type: 'input_value',
                name: 'STRING1',
                check: 'String',
                shadow: {
                    type: 'text',
                    fields: {
                        TEXT: 'apple'
                    }
                }
            },
            {
                type: 'input_value',
                name: 'STRING2',
                check: 'String',
                shadow: {
                    type: 'text',
                    fields: {
                        TEXT: 'a'
                    }
                }
            }
        ],
        inputsInline: true,
        output: 'Boolean',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_divide',
        message0: '%1 / %2',
        args0: [
            {
                type: 'input_value',
                name: 'NUM1'
            },
            {
                type: 'input_value',
                name: 'NUM2'
            }
        ],
        inputsInline: true,
        output: 'Number',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_equals',
        message0: '%1 = %2',
        args0: [
            {
                type: 'input_value',
                name: 'OPERAND1'
            },
            {
                type: 'input_value',
                name: 'OPERAND2'
            }
        ],
        inputsInline: true,
        output: 'Boolean',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_gt',
        message0: '%1 > %2',
        args0: [
            {
                type: 'input_value',
                name: 'OPERAND1'
            },
            {
                type: 'input_value',
                name: 'OPERAND2'
            }
        ],
        inputsInline: true,
        output: 'Boolean',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_join',
        message0: 'join %1 %2',
        args0: [
            {
                type: 'input_value',
                name: 'STRING1',
                check: 'String',
                shadow: {
                    type: 'text',
                    fields: {
                        TEXT: 'apple'
                    }
                }
            },
            {
                type: 'input_value',
                name: 'STRING2',
                shadow: {
                    type: 'text',
                    fields: {
                        TEXT: 'banana'
                    }
                }
            }
        ],
        inputsInline: true,
        output: 'String',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_length',
        message0: 'length of %1',
        args0: [
            {
                type: 'input_value',
                name: 'STRING',
                check: 'String',
                shadow: {
                    type: 'text',
                    fields: {
                        TEXT: 'apple'
                    }
                }
            }
        ],
        inputsInline: true,
        output: 'String',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_letter_of',
        message0: 'letter %1 of %2',
        args0: [
            {
                type: 'input_value',
                name: 'LETTER',
                shadow: {
                    type: 'math_whole_number',
                    fields: {
                        NUM: '1'
                    }
                }
            },
            {
                type: 'input_value',
                name: 'STRING',
                check: 'String',
                shadow: {
                    type: 'text',
                    fields: {
                        TEXT: 'apple'
                    }
                }
            }
        ],
        inputsInline: true,
        output: 'String',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_lt',
        message0: '%1 < %2',
        args0: [
            {
                type: 'input_value',
                name: 'OPERAND1'
            },
            {
                type: 'input_value',
                name: 'OPERAND2'
            }
        ],
        inputsInline: true,
        output: 'Boolean',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_mathop',
        message0: '%1 of %2',
        args0: [
            {
                type: 'field_dropdown',
                name: 'OPERATOR',
                options: [
                    ['abs', 'abs'],
                    ['floor', 'floor'],
                    ['ceiling', 'ceiling'],
                    ['sqrt', 'sqrt'],
                    ['sin', 'sin'],
                    ['cos', 'cos'],
                    ['tan', 'tan'],
                    ['asin', 'asin'],
                    ['acos', 'acos'],
                    ['atan', 'atan'],
                    ['ln', 'ln'],
                    ['log', 'log'],
                    ['e ^', 'e ^'],
                    ['10 ^', '10 ^']
                ]
            },
            {
                type: 'input_value',
                name: 'NUM'
            }
        ],
        inputsInline: true,
        output: 'Number',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_mod',
        message0: '%1 mod %2',
        args0: [
            {
                type: 'input_value',
                name: 'NUM1'
            },
            {
                type: 'input_value',
                name: 'NUM2'
            }
        ],
        inputsInline: true,
        output: 'Number',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_multiply',
        message0: '%1 * %2',
        args0: [
            {
                type: 'input_value',
                name: 'NUM1'
            },
            {
                type: 'input_value',
                name: 'NUM2'
            }
        ],
        inputsInline: true,
        output: 'Number',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_not',
        message0: 'not %1',
        args0: [
            {
                type: 'input_value',
                name: 'OPERAND',
                check: 'Boolean'
            }
        ],
        inputsInline: true,
        output: 'Boolean',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_or',
        message0: '%1 or %2',
        args0: [
            {
                type: 'input_value',
                name: 'OPERAND1',
                check: 'Boolean'
            },
            {
                type: 'input_value',
                name: 'OPERAND2',
                check: 'Boolean'
            }
        ],
        inputsInline: true,
        output: 'Boolean',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_random',
        message0: 'pick random %1 to %2',
        args0: [
            {
                type: 'input_value',
                name: 'FROM'
            },
            {
                type: 'input_value',
                name: 'TO'
            }
        ],
        inputsInline: true,
        output: 'Number',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_round',
        message0: 'round %1',
        args0: [
            {
                type: 'input_value',
                name: 'NUM'
            }
        ],
        inputsInline: true,
        output: 'Number',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'operator_subtract',
        message0: '%1 - %2',
        args0: [
            {
                type: 'input_value',
                name: 'NUM1'
            },
            {
                type: 'input_value',
                name: 'NUM2'
            }
        ],
        inputsInline: true,
        output: 'Number',
        colour: '#00b94d',
        extensions: ['shadow_input']
    },
    {
        type: 'procedures_call',
        previousStatement: null,
        nextStatement: null,
        colour: '#ff5d64',
        extensions: ['shadow_input']
    },
    {
        type: 'procedures_definition',
        message0: 'define %1',
        args0: [
            {
                type: 'input_statement',
                name: 'custom_block'
            }
        ],
        colour: '#ff5d64',
        extensions: ['shadow_input']
    },
    {
        type: 'sound_changeeffectby',
        message0: 'change %1 effect by %2',
        args0: [
            {
                type: 'field_dropdown',
                name: 'EFFECT',
                options: [
                    ['pitch', 'PITCH'],
                    ['pan left/right', 'PAN']
                ]
            },
            {
                type: 'input_value',
                name: 'VALUE',
                check: 'Number'
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: '#c061f1',
        extensions: ['shadow_input']
    },
    {
        type: 'sound_changevolumeby',
        message0: 'change volume by %1',
        args0: [
            {
                type: 'input_value',
                name: 'VOLUME',
                check: 'Number'
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: '#c061f1',
        extensions: ['shadow_input']
    },
    {
        type: 'sound_cleareffects',
        message0: 'clear sound effects',
        previousStatement: null,
        nextStatement: null,
        colour: '#c061f1',
        extensions: ['shadow_input']
    },
    {
        type: 'sound_seteffectto',
        message0: 'set %1 effect to %2',
        args0: [
            {
                type: 'field_dropdown',
                name: 'EFFECT',
                options: [
                    ['pitch', 'PITCH'],
                    ['pan left/right', 'PAN']
                ]
            },
            {
                type: 'input_value',
                name: 'VALUE',
                check: 'Number'
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: '#c061f1',
        extensions: ['shadow_input']
    },
    {
        type: 'sound_setvolumeto',
        message0: 'set volume to %1%',
        args0: [
            {
                type: 'input_value',
                name: 'VOLUME',
                check: 'Number'
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: '#c061f1',
        extensions: ['shadow_input']
    },
    {
        type: 'sound_volume',
        message0: 'volume',
        checkboxInFlyout: true,
        output: 'Number',
        colour: '#c061f1',
        extensions: ['shadow_input']
    }
];
