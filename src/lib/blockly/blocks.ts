export const blocks = [
    {
        "type": "control_forever",
        "id": "control_forever",
        "message0": "forever",
        "message1": "%1",
        "message2": "%1",
        "lastDummyAlign2": "RIGHT",
        "args1": [
            {
                "type": "input_statement",
                "name": "SUBSTACK"
            }
        ],
        "args2": [
            {
                "type": "field_image",
                "src": "repeat.svg",
                "width": 24,
                "height": 24,
                "alt": "*",
                "flip_rtl": true
            }
        ],
        "colour": "#ffb515",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "control_if",
        "message0": "if %1 then",
        "message1": "%1",
        "args0": [
            {
                "type": "input_value",
                "name": "CONDITION",
                "check": "Boolean"
            }
        ],
        "args1": [
            {
                "type": "input_statement",
                "name": "SUBSTACK"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ffb515"
    },
    {
        "type": "control_if_else",
        "message0": "if %1 then",
        "message1": "%1",
        "message2": "else",
        "message3": "%1",
        "args0": [
            {
                "type": "input_value",
                "name": "CONDITION",
                "check": "Boolean"
            }
        ],
        "args1": [
            {
                "type": "input_statement",
                "name": "SUBSTACK"
            }
        ],
        "args3": [
            {
                "type": "input_statement",
                "name": "SUBSTACK2"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ffb515"
    },
    {
        "type": "control_repeat",
        "id": "control_repeat",
        "message0": "repeat %1",
        "message1": "%1",
        "message2": "%1",
        "lastDummyAlign2": "RIGHT",
        "args0": [
            {
                "type": "input_value",
                "name": "TIMES"
            }
        ],
        "args1": [
            {
                "type": "input_statement",
                "name": "SUBSTACK"
            }
        ],
        "args2": [
            {
                "type": "field_image",
                "src": "repeat.svg",
                "width": 24,
                "height": 24,
                "alt": "*",
                "flip_rtl": true
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ffb515"
    },
    {
        "type": "control_repeat_until",
        "message0": "repeat until %1",
        "message1": "%1",
        "message2": "%1",
        "lastDummyAlign2": "RIGHT",
        "args0": [
            {
                "type": "input_value",
                "name": "CONDITION",
                "check": "Boolean"
            }
        ],
        "args1": [
            {
                "type": "input_statement",
                "name": "SUBSTACK"
            }
        ],
        "args2": [
            {
                "type": "field_image",
                "src": "repeat.svg",
                "width": 24,
                "height": 24,
                "alt": "*",
                "flip_rtl": true
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ffb515"
    },
    {
        "type": "control_wait",
        "id": "control_wait",
        "message0": "wait %1 seconds",
        "args0": [
            {
                "type": "input_value",
                "name": "DURATION"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ffb515"
    },
    {
        "type": "control_wait_until",
        "message0": "wait until %1",
        "args0": [
            {
                "type": "input_value",
                "name": "CONDITION",
                "check": "Boolean"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ffb515"
    },
    {
        "type": "data_addtolist",
        "message0": "add %1 to %2",
        "args0": [
            {
                "type": "input_value",
                "name": "ITEM"
            },
            {
                "type": "field_variable",
                "name": "LIST",
                "variableTypes": [
                    "list"
                ]
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ff9835"
    },
    {
        "type": "data_changevariableby",
        "message0": "change %1 by %2",
        "args0": [
            {
                "type": "field_variable",
                "name": "VARIABLE"
            },
            {
                "type": "input_value",
                "name": "VALUE"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ff9835"
    },
    {
        "type": "data_deletealloflist",
        "message0": "delete all of %1",
        "args0": [
            {
                "type": "field_variable",
                "name": "LIST",
                "variableTypes": [
                    "list"
                ]
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ff9835"
    },
    {
        "type": "data_deleteoflist",
        "message0": "delete %1 of %2",
        "args0": [
            {
                "type": "input_value",
                "name": "INDEX"
            },
            {
                "type": "field_variable",
                "name": "LIST",
                "variableTypes": [
                    "list"
                ]
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ff9835"
    },
    {
        "type": "data_insertatlist",
        "message0": "insert %1 at %2 of %3",
        "args0": [
            {
                "type": "input_value",
                "name": "ITEM"
            },
            {
                "type": "input_value",
                "name": "INDEX"
            },
            {
                "type": "field_variable",
                "name": "LIST",
                "variableTypes": [
                    "list"
                ]
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ff9835"
    },
    {
        "type": "data_itemnumoflist",
        "message0": "item # of %1 in %2",
        "args0": [
            {
                "type": "input_value",
                "name": "ITEM"
            },
            {
                "type": "field_variable",
                "name": "LIST",
                "variableTypes": [
                    "list"
                ]
            }
        ],
        "output": null,
        "outputShape": 2,
        "colour": "#ff9835"
    },
    {
        "type": "data_itemoflist",
        "message0": "item %1 of %2",
        "args0": [
            {
                "type": "input_value",
                "name": "INDEX"
            },
            {
                "type": "field_variable",
                "name": "LIST",
                "variableTypes": [
                    "list"
                ]
            }
        ],
        "output": null,
        "outputShape": 2,
        "colour": "#ff9835"
    },
    {
        "type": "data_lengthoflist",
        "message0": "length of %1",
        "args0": [
            {
                "type": "field_variable",
                "name": "LIST",
                "variableTypes": [
                    "list"
                ]
            }
        ],
        "output": "Number",
        "colour": "#ff9835"
    },
    {
        "type": "data_listcontainsitem",
        "message0": "%1 contains %2?",
        "args0": [
            {
                "type": "field_variable",
                "name": "LIST",
                "variableTypes": [
                    "list"
                ]
            },
            {
                "type": "input_value",
                "name": "ITEM"
            }
        ],
        "output": "Boolean",
        "colour": "#ff9835"
    },
    {
        "type": "data_listcontents",
        "message0": "%1",
        "args0": [
            {
                "type": "field_variable_getter",
                "text": "",
                "name": "LIST",
                "variableType": "list"
            }
        ],
        "checkboxInFlyout": true,
        "output": "String",
        "colour": "#ff9835"
    },
    {
        "type": "data_replaceitemoflist",
        "message0": "replace item %1 of %2 with %3",
        "args0": [
            {
                "type": "input_value",
                "name": "INDEX"
            },
            {
                "type": "field_variable",
                "name": "LIST",
                "variableTypes": [
                    "list"
                ]
            },
            {
                "type": "input_value",
                "name": "ITEM"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ff9835"
    },
    {
        "type": "data_setvariableto",
        "message0": "set %1 to %2",
        "args0": [
            {
                "type": "field_variable",
                "name": "VARIABLE"
            },
            {
                "type": "input_value",
                "name": "VALUE"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ff9835"
    },
    {
        "type": "data_variable",
        "message0": "%1",
        "lastDummyAlign0": "CENTRE",
        "args0": [
            {
                "type": "field_variable_getter",
                "text": "",
                "name": "VARIABLE"
            }
        ],
        "checkboxInFlyout": true,
        "output": "String",
        "colour": "#ff9835"
    },
    {
        "type": "event_broadcast",
        "id": "event_broadcast",
        "message0": "broadcast %1",
        "args0": [
            {
                "type": "input_value",
                "name": "BROADCAST_INPUT"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#f5c402"
    },
    {
        "type": "event_broadcastandwait",
        "message0": "broadcast %1 and wait",
        "args0": [
            {
                "type": "input_value",
                "name": "BROADCAST_INPUT"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#f5c402"
    },
    {
        "type": "event_whenbroadcastreceived",
        "id": "event_whenbroadcastreceived",
        "message0": "when I receive %1",
        "args0": [
            {
                "type": "field_variable",
                "name": "BROADCAST_OPTION",
                "variable": "message1"
            }
        ],
        "colour": "#f5c402"
    },
    {
        "type": "flippercontrol_stop",
        "message0": "stop %1",
        "args0": [
            {
                "type": "field_number",
                "name": "STOP_OPTION",
                "value": 32
            }
        ],
        "colour": "#ffb515",
        "tooltip": "flippercontrol_stop",
        "previousStatement": null
    },
    {
        "type": "flippercontrol_stopOtherStacks",
        "message0": "stop other stacks",
        "args0": [],
        "colour": "#ffb515",
        "tooltip": "flippercontrol_stopOtherStacks",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flipperevents_whenButton",
        "message0": "when %1 button %2",
        "args0": [
            {
                "type": "field_number",
                "name": "BUTTON",
                "value": 4
            },
            {
                "type": "field_number",
                "name": "EVENT",
                "value": 12
            }
        ],
        "colour": "#f5c402",
        "tooltip": "flipperevents_whenButton",
        "nextStatement": null
    },
    {
        "type": "flipperevents_whenColor",
        "message0": "%1 when colour is %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "OPTION",
                "value": 23
            }
        ],
        "colour": "#f5c402",
        "tooltip": "flipperevents_whenColor",
        "nextStatement": null
    },
    {
        "type": "flipperevents_whenCondition",
        "message0": "when %1",
        "args0": [
            {
                "type": "field_number",
                "name": "CONDITION",
                "value": 7
            }
        ],
        "colour": "#f5c402",
        "tooltip": "flipperevents_whenCondition",
        "nextStatement": null
    },
    {
        "type": "flipperevents_whenDistance",
        "message0": "%1 when %2  %3  %4",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "COMPARATOR",
                "value": 6
            },
            {
                "type": "field_number",
                "name": "VALUE",
                "value": 36
            },
            {
                "type": "field_dropdown",
                "name": "UNIT",
                "options": [
                    [
                        "rotations",
                        "rotations"
                    ],
                    [
                        "degrees",
                        "degrees"
                    ],
                    [
                        "seconds",
                        "seconds"
                    ],
                    [
                        "cm",
                        "cm"
                    ],
                    [
                        "in",
                        "in"
                    ]
                ]
            }
        ],
        "colour": "#f5c402",
        "tooltip": "flipperevents_whenDistance",
        "nextStatement": null
    },
    {
        "type": "flipperevents_whenGesture",
        "message0": "when %1",
        "args0": [
            {
                "type": "field_number",
                "name": "EVENT",
                "value": 12
            }
        ],
        "colour": "#f5c402",
        "tooltip": "flipperevents_whenGesture",
        "nextStatement": null
    },
    {
        "type": "flipperevents_whenOrientation",
        "message0": "when %1 is up",
        "args0": [
            {
                "type": "field_number",
                "name": "VALUE",
                "value": 36
            }
        ],
        "colour": "#f5c402",
        "tooltip": "flipperevents_whenOrientation",
        "nextStatement": null
    },
    {
        "type": "flipperevents_whenPressed",
        "message0": "%1 when %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "OPTION",
                "value": 23
            }
        ],
        "colour": "#f5c402",
        "tooltip": "flipperevents_whenPressed",
        "nextStatement": null
    },
    {
        "type": "flipperevents_whenProgramStarts",
        "message0": "when program starts",
        "args0": [],
        "colour": "#f5c402",
        "tooltip": "flipperevents_whenProgramStarts",
        "nextStatement": null
    },
    {
        "type": "flipperevents_whenTilted",
        "message0": "when tilted %1",
        "args0": [
            {
                "type": "field_number",
                "name": "VALUE",
                "value": 36
            }
        ],
        "colour": "#f5c402",
        "tooltip": "flipperevents_whenTilted",
        "nextStatement": null
    },
    {
        "type": "flipperevents_whenTimer",
        "message0": "when timer > %1",
        "args0": [
            {
                "type": "field_number",
                "name": "VALUE",
                "value": 36
            }
        ],
        "colour": "#f5c402",
        "tooltip": "flipperevents_whenTimer",
        "nextStatement": null
    },
    {
        "type": "flipperlight_centerButtonLight",
        "message0": "%2 set Centre Button Light to %1",
        "args0": [
            {
                "type": "field_number",
                "name": "COLOR",
                "value": 5
            },
            {
                "type": "field_image",
                "src": "icons/Light.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#9b6af6",
        "tooltip": "flipperlight_centerButtonLight",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flipperlight_lightDisplayImageOn",
        "message0": "%2 turn on %1",
        "args0": [
            {
                "type": "field_number",
                "name": "MATRIX",
                "value": 50
            },
            {
                "type": "field_image",
                "src": "icons/Light.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#9b6af6",
        "tooltip": "flipperlight_lightDisplayImageOn",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flipperlight_lightDisplayImageOnForTime",
        "message0": "%3 turn on %1 for %2 seconds",
        "args0": [
            {
                "type": "field_number",
                "name": "MATRIX",
                "value": 50
            },
            {
                "type": "field_number",
                "name": "VALUE",
                "value": 36
            },
            {
                "type": "field_image",
                "src": "icons/Light.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#9b6af6",
        "tooltip": "flipperlight_lightDisplayImageOnForTime",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flipperlight_lightDisplayOff",
        "message0": "%1 turn off pixels",
        "args0": [
            {
                "type": "field_image",
                "src": "icons/Light.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#9b6af6",
        "tooltip": "flipperlight_lightDisplayOff",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flipperlight_lightDisplayRotate",
        "message0": "%2 rotate %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "DIRECTION",
                "options": [
                    [
                        "shortest path",
                        "shortest path"
                    ],
                    [
                        "clockwise",
                        "clockwise"
                    ],
                    [
                        "counterclockwise",
                        "counterclockwise"
                    ]
                ]
            },
            {
                "type": "field_image",
                "src": "icons/Light.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#9b6af6",
        "tooltip": "flipperlight_lightDisplayRotate",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flipperlight_lightDisplaySetBrightness",
        "message0": "%2 set pixel brightness to %1 %%",
        "args0": [
            {
                "type": "field_number",
                "name": "BRIGHTNESS",
                "value": 2
            },
            {
                "type": "field_image",
                "src": "icons/Light.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#9b6af6",
        "tooltip": "flipperlight_lightDisplaySetBrightness",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flipperlight_lightDisplaySetOrientation",
        "message0": "%2 set orientation to %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "ORIENTATION",
                "options": [
                    [
                        "upright",
                        "upright"
                    ],
                    [
                        "left",
                        "left"
                    ],
                    [
                        "right",
                        "right"
                    ],
                    [
                        "upside down",
                        "upside down"
                    ]
                ]
            },
            {
                "type": "field_image",
                "src": "icons/Light.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#9b6af6",
        "tooltip": "flipperlight_lightDisplaySetOrientation",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flipperlight_lightDisplaySetPixel",
        "message0": "%4 set pixel at %1 , %2 to %3 %%",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "X",
                "options": [
                    [
                        "1",
                        "1"
                    ],
                    [
                        "2",
                        "2"
                    ],
                    [
                        "3",
                        "3"
                    ],
                    [
                        "4",
                        "4"
                    ],
                    [
                        "5",
                        "5"
                    ]
                ]
            },
            {
                "type": "field_dropdown",
                "name": "Y",
                "options": [
                    [
                        "1",
                        "1"
                    ],
                    [
                        "2",
                        "2"
                    ],
                    [
                        "3",
                        "3"
                    ],
                    [
                        "4",
                        "4"
                    ],
                    [
                        "5",
                        "5"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "BRIGHTNESS",
                "value": 2
            },
            {
                "type": "field_image",
                "src": "icons/Light.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#9b6af6",
        "tooltip": "flipperlight_lightDisplaySetPixel",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flipperlight_lightDisplayText",
        "message0": "%2 write %1",
        "args0": [
            {
                "type": "input_value",
                "name": "TEXT",
                "value": 51
            },
            {
                "type": "field_image",
                "src": "icons/Light.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#9b6af6",
        "tooltip": "flipperlight_lightDisplayText",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flipperlight_ultrasonicLightUp",
        "message0": "%1 light up %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "VALUE",
                "value": 36
            }
        ],
        "colour": "#3fccf1",
        "tooltip": "flipperlight_ultrasonicLightUp",
        "output": "Number"
    },
    {
        "type": "flippermoremotor_motorGoToRelativePosition",
        "message0": "%4 %1 go to relative position %2 at %3 %% speed",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "POSITION",
                "value": 26
            },
            {
                "type": "field_number",
                "name": "SPEED",
                "value": 29
            },
            {
                "type": "field_image",
                "src": "icons/Motors.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#0090f5",
        "tooltip": "flippermoremotor_motorGoToRelativePosition",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermoremotor_motorSetAcceleration",
        "message0": "%3 %1 set acceleration to %2 seconds",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "TIME",
                "value": 33
            },
            {
                "type": "field_image",
                "src": "icons/Motors.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#0090f5",
        "tooltip": "flippermoremotor_motorSetAcceleration",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermoremotor_motorSetStopMethod",
        "message0": "%3 %1 set motors to %2 at stop",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "STOP",
                "value": 31
            },
            {
                "type": "field_image",
                "src": "icons/Motors.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#0090f5",
        "tooltip": "flippermoremotor_motorSetStopMethod",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermoremotor_motorStartPower",
        "message0": "%3 %1 start motor at %2 %% power",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "POWER",
                "value": 27
            },
            {
                "type": "field_image",
                "src": "icons/Motors.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#0090f5",
        "tooltip": "flippermoremotor_motorStartPower",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermoresensors_acceleration",
        "message0": "acceleration %1",
        "args0": [
            {
                "type": "field_number",
                "name": "AXIS",
                "value": 1
            }
        ],
        "colour": "#34ccf1",
        "tooltip": "flippermoresensors_acceleration",
        "output": "Number"
    },
    {
        "type": "flippermoresensors_angularVelocity",
        "message0": "angular velocity %1",
        "args0": [
            {
                "type": "field_number",
                "name": "AXIS",
                "value": 1
            }
        ],
        "colour": "#34ccf1",
        "tooltip": "flippermoresensors_angularVelocity",
        "output": "Number"
    },
    {
        "type": "flippermoresensors_orientation",
        "message0": "orientation",
        "args0": [],
        "colour": "#34ccf1",
        "tooltip": "flippermoresensors_orientation",
        "output": "Number"
    },
    {
        "type": "flippermoresensors_rawColor",
        "message0": "%1 raw %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "COLOR",
                "value": 5
            }
        ],
        "colour": "#34ccf1",
        "tooltip": "flippermoresensors_rawColor",
        "output": "Number"
    },
    {
        "type": "flippermotor_absolutePosition",
        "message0": "%2 %1 position",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_image",
                "src": "icons/Motors.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#0090f5",
        "tooltip": "flippermotor_absolutePosition",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermotor_motorGoDirectionToPosition",
        "message0": "%4 %1 go %2 to position %3",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_dropdown",
                "name": "DIRECTION",
                "options": [
                    [
                        "shortest path",
                        "shortest path"
                    ],
                    [
                        "clockwise",
                        "clockwise"
                    ],
                    [
                        "counterclockwise",
                        "counterclockwise"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "POSITION",
                "value": 26
            },
            {
                "type": "field_image",
                "src": "icons/Motors.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#0090f5",
        "tooltip": "flippermotor_motorGoDirectionToPosition",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermotor_motorSetSpeed",
        "message0": "%3 %1 set speed to %2 %%",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "SPEED",
                "value": 29
            },
            {
                "type": "field_image",
                "src": "icons/Motors.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#0090f5",
        "tooltip": "flippermotor_motorSetSpeed",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermotor_motorStartDirection",
        "message0": "%3 %1 start motor %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_dropdown",
                "name": "DIRECTION",
                "options": [
                    [
                        "shortest path",
                        "shortest path"
                    ],
                    [
                        "clockwise",
                        "clockwise"
                    ],
                    [
                        "counterclockwise",
                        "counterclockwise"
                    ]
                ]
            },
            {
                "type": "field_image",
                "src": "icons/Motors.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#0090f5",
        "tooltip": "flippermotor_motorStartDirection",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermotor_motorStop",
        "message0": "%2 %1 stop motor",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_image",
                "src": "icons/Motors.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#0090f5",
        "tooltip": "flippermotor_motorStop",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermotor_motorTurnForDirection",
        "message0": "%5 %1 run %2 for %3  %4",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_dropdown",
                "name": "DIRECTION",
                "options": [
                    [
                        "shortest path",
                        "shortest path"
                    ],
                    [
                        "clockwise",
                        "clockwise"
                    ],
                    [
                        "counterclockwise",
                        "counterclockwise"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "VALUE",
                "value": 36
            },
            {
                "type": "field_dropdown",
                "name": "UNIT",
                "options": [
                    [
                        "rotations",
                        "rotations"
                    ],
                    [
                        "degrees",
                        "degrees"
                    ],
                    [
                        "seconds",
                        "seconds"
                    ],
                    [
                        "cm",
                        "cm"
                    ],
                    [
                        "in",
                        "in"
                    ]
                ]
            },
            {
                "type": "field_image",
                "src": "icons/Motors.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#0090f5",
        "tooltip": "flippermotor_motorTurnForDirection",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermotor_speed",
        "message0": "%2 %1 speed",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_image",
                "src": "icons/Motors.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#0090f5",
        "tooltip": "flippermotor_speed",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermove_movementSpeed",
        "message0": "%2 set movement speed to %1 %%",
        "args0": [
            {
                "type": "field_number",
                "name": "SPEED",
                "value": 29
            },
            {
                "type": "field_image",
                "src": "icons/Movement.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#ff4ccd",
        "tooltip": "flippermove_movementSpeed",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermove_setDistance",
        "message0": "%3 set 1 motor rotation to %1  %2 moved",
        "args0": [
            {
                "type": "field_number",
                "name": "DISTANCE",
                "value": 60
            },
            {
                "type": "field_dropdown",
                "name": "UNIT",
                "options": [
                    [
                        "rotations",
                        "rotations"
                    ],
                    [
                        "degrees",
                        "degrees"
                    ],
                    [
                        "seconds",
                        "seconds"
                    ],
                    [
                        "cm",
                        "cm"
                    ],
                    [
                        "in",
                        "in"
                    ]
                ]
            },
            {
                "type": "field_image",
                "src": "icons/Movement.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#ff4ccd",
        "tooltip": "flippermove_setDistance",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermove_setMovementPair",
        "message0": "%2 set movement motors to %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PAIR",
                "options": [
                    [
                        "A+B",
                        "A+B"
                    ],
                    [
                        "A+C",
                        "A+C"
                    ],
                    [
                        "A+D",
                        "A+D"
                    ],
                    [
                        "A+E",
                        "A+E"
                    ],
                    [
                        "A+F",
                        "A+F"
                    ],
                    [
                        "B+A",
                        "B+A"
                    ],
                    [
                        "B+C",
                        "B+C"
                    ],
                    [
                        "B+D",
                        "B+D"
                    ],
                    [
                        "B+E",
                        "B+E"
                    ],
                    [
                        "B+F",
                        "B+F"
                    ],
                    [
                        "C+A",
                        "C+A"
                    ],
                    [
                        "C+B",
                        "C+B"
                    ],
                    [
                        "C+D",
                        "C+D"
                    ],
                    [
                        "C+E",
                        "C+E"
                    ],
                    [
                        "C+F",
                        "C+F"
                    ],
                    [
                        "D+A",
                        "D+A"
                    ],
                    [
                        "D+B",
                        "D+B"
                    ],
                    [
                        "D+C",
                        "D+C"
                    ],
                    [
                        "D+E",
                        "D+E"
                    ],
                    [
                        "D+F",
                        "D+F"
                    ],
                    [
                        "E+A",
                        "E+A"
                    ],
                    [
                        "E+B",
                        "E+B"
                    ],
                    [
                        "E+C",
                        "E+C"
                    ],
                    [
                        "E+D",
                        "E+D"
                    ],
                    [
                        "E+F",
                        "E+F"
                    ],
                    [
                        "F+A",
                        "F+A"
                    ],
                    [
                        "F+B",
                        "F+B"
                    ],
                    [
                        "F+C",
                        "F+C"
                    ],
                    [
                        "F+D",
                        "F+D"
                    ],
                    [
                        "F+E",
                        "F+E"
                    ]
                ]
            },
            {
                "type": "field_image",
                "src": "icons/Movement.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#ff4ccd",
        "tooltip": "flippermove_setMovementPair",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermove_startMove",
        "message0": "%2 start moving %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "DIRECTION",
                "options": [
                    [
                        "shortest path",
                        "shortest path"
                    ],
                    [
                        "clockwise",
                        "clockwise"
                    ],
                    [
                        "counterclockwise",
                        "counterclockwise"
                    ]
                ]
            },
            {
                "type": "field_image",
                "src": "icons/Movement.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#ff4ccd",
        "tooltip": "flippermove_startMove",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermove_startSteer",
        "message0": "%2 start moving %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "STEERING",
                "options": [
                    [
                        "angle100",
                        "angle100"
                    ]
                ]
            },
            {
                "type": "field_image",
                "src": "icons/Movement.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#ff4ccd",
        "tooltip": "flippermove_startSteer",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermove_steer",
        "message0": "%4 move %1 for %2  %3",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "STEERING",
                "options": [
                    [
                        "angle100",
                        "angle100"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "VALUE",
                "value": 36
            },
            {
                "type": "field_dropdown",
                "name": "UNIT",
                "options": [
                    [
                        "rotations",
                        "rotations"
                    ],
                    [
                        "degrees",
                        "degrees"
                    ],
                    [
                        "seconds",
                        "seconds"
                    ],
                    [
                        "cm",
                        "cm"
                    ],
                    [
                        "in",
                        "in"
                    ]
                ]
            },
            {
                "type": "field_image",
                "src": "icons/Movement.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#ff4ccd",
        "tooltip": "flippermove_steer",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippermove_stopMove",
        "message0": "%1 stop moving",
        "args0": [
            {
                "type": "field_image",
                "src": "icons/Movement.svg",
                "width": 24,
                "height": 24
            }
        ],
        "colour": "#ff4ccd",
        "tooltip": "flippermove_stopMove",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flipperoperator_isInBetween",
        "message0": "is %1 in between %2 and %3 ?",
        "args0": [
            {
                "type": "field_number",
                "name": "VALUE",
                "value": 36
            },
            {
                "type": "field_number",
                "name": "LOW",
                "value": 20
            },
            {
                "type": "field_number",
                "name": "HIGH",
                "value": 13
            }
        ],
        "colour": "#00b94d",
        "tooltip": "flipperoperator_isInBetween",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippersensors_buttonIsPressed",
        "message0": "is %1 button %2 ?",
        "args0": [
            {
                "type": "field_number",
                "name": "BUTTON",
                "value": 4
            },
            {
                "type": "field_number",
                "name": "EVENT",
                "value": 12
            }
        ],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_buttonIsPressed",
        "output": "Number"
    },
    {
        "type": "flippersensors_color",
        "message0": "%1 colour",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            }
        ],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_color",
        "output": "Number"
    },
    {
        "type": "flippersensors_distance",
        "message0": "%1 distance in %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_dropdown",
                "name": "UNIT",
                "options": [
                    [
                        "rotations",
                        "rotations"
                    ],
                    [
                        "degrees",
                        "degrees"
                    ],
                    [
                        "seconds",
                        "seconds"
                    ],
                    [
                        "cm",
                        "cm"
                    ],
                    [
                        "in",
                        "in"
                    ]
                ]
            }
        ],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_distance",
        "output": "Number"
    },
    {
        "type": "flippersensors_force",
        "message0": "%1 pressure in %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_dropdown",
                "name": "UNIT",
                "options": [
                    [
                        "rotations",
                        "rotations"
                    ],
                    [
                        "degrees",
                        "degrees"
                    ],
                    [
                        "seconds",
                        "seconds"
                    ],
                    [
                        "cm",
                        "cm"
                    ],
                    [
                        "in",
                        "in"
                    ]
                ]
            }
        ],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_force",
        "output": "Number"
    },
    {
        "type": "flippersensors_isColor",
        "message0": "%1 is colour %2 ?",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "VALUE",
                "value": 36
            }
        ],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_isColor",
        "output": "Boolean"
    },
    {
        "type": "flippersensors_isDistance",
        "message0": "%1 is %2  %3  %4 ?",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "COMPARATOR",
                "value": 6
            },
            {
                "type": "field_number",
                "name": "VALUE",
                "value": 36
            },
            {
                "type": "field_dropdown",
                "name": "UNIT",
                "options": [
                    [
                        "rotations",
                        "rotations"
                    ],
                    [
                        "degrees",
                        "degrees"
                    ],
                    [
                        "seconds",
                        "seconds"
                    ],
                    [
                        "cm",
                        "cm"
                    ],
                    [
                        "in",
                        "in"
                    ]
                ]
            }
        ],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_isDistance",
        "output": "Boolean"
    },
    {
        "type": "flippersensors_isPressed",
        "message0": "%1 is %2 ?",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "OPTION",
                "value": 23
            }
        ],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_isPressed",
        "output": "Boolean"
    },
    {
        "type": "flippersensors_isReflectivity",
        "message0": "%1 reflection %2  %3 %% ?",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "COMPARATOR",
                "value": 6
            },
            {
                "type": "field_number",
                "name": "VALUE",
                "value": 36
            }
        ],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_isReflectivity",
        "output": "Boolean"
    },
    {
        "type": "flippersensors_isTilted",
        "message0": "Is tilted %1 ?",
        "args0": [
            {
                "type": "field_number",
                "name": "VALUE",
                "value": 36
            }
        ],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_isTilted",
        "output": "Boolean"
    },
    {
        "type": "flippersensors_ismotion",
        "message0": "is %1 ?",
        "args0": [
            {
                "type": "field_number",
                "name": "MOTION",
                "value": 21
            }
        ],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_ismotion",
        "output": "Boolean"
    },
    {
        "type": "flippersensors_isorientation",
        "message0": "is %1 up?",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "ORIENTATION",
                "options": [
                    [
                        "upright",
                        "upright"
                    ],
                    [
                        "left",
                        "left"
                    ],
                    [
                        "right",
                        "right"
                    ],
                    [
                        "upside down",
                        "upside down"
                    ]
                ]
            }
        ],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_isorientation",
        "output": "Boolean"
    },
    {
        "type": "flippersensors_reflectivity",
        "message0": "%1 reflected light",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PORT",
                "options": [
                    [
                        "A",
                        "A"
                    ],
                    [
                        "B",
                        "B"
                    ],
                    [
                        "C",
                        "C"
                    ],
                    [
                        "D",
                        "D"
                    ],
                    [
                        "E",
                        "E"
                    ],
                    [
                        "F",
                        "F"
                    ]
                ]
            }
        ],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_reflectivity",
        "output": "Number"
    },
    {
        "type": "flippersensors_resetTimer",
        "message0": "reset timer",
        "args0": [],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_resetTimer",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippersensors_resetYaw",
        "message0": "set yaw angle to 0",
        "args0": [],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_resetYaw",
        "output": "Number"
    },
    {
        "type": "flippersensors_timer",
        "message0": "timer",
        "args0": [],
        "colour": "#3fccf1",
        "tooltip": "flippersensors_timer",
        "output": "Number"
    },
    {
        "type": "flippersound_beep",
        "message0": "start playing beep %1",
        "args0": [
            {
                "type": "field_number",
                "name": "NOTE",
                "value": 22
            }
        ],
        "colour": "#c061f1",
        "tooltip": "flippersound_beep",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippersound_beepForTime",
        "message0": "play beep %1 for %2 seconds",
        "args0": [
            {
                "type": "field_number",
                "name": "NOTE",
                "value": 22
            },
            {
                "type": "field_number",
                "name": "DURATION",
                "value": 10
            }
        ],
        "colour": "#c061f1",
        "tooltip": "flippersound_beepForTime",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippersound_playSound",
        "message0": "start sound %1",
        "args0": [
            {
                "type": "field_number",
                "name": "SOUND",
                "value": 28
            }
        ],
        "colour": "#c061f1",
        "tooltip": "flippersound_playSound",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippersound_playSoundUntilDone",
        "message0": "play sound %1 until done",
        "args0": [
            {
                "type": "field_number",
                "name": "SOUND",
                "value": 28
            }
        ],
        "colour": "#c061f1",
        "tooltip": "flippersound_playSoundUntilDone",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "flippersound_stopSound",
        "message0": "stop all sounds",
        "args0": [],
        "colour": "#c061f1",
        "tooltip": "flippersound_stopSound",
        "previousStatement": null,
        "nextStatement": null
    },
    {
        "type": "operator_add",
        "message0": "%1 + %2",
        "args0": [
            {
                "type": "input_value",
                "name": "NUM1"
            },
            {
                "type": "input_value",
                "name": "NUM2"
            }
        ],
        "output": "Number",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_and",
        "message0": "%1 and %2",
        "args0": [
            {
                "type": "input_value",
                "name": "OPERAND1",
                "check": "Boolean"
            },
            {
                "type": "input_value",
                "name": "OPERAND2",
                "check": "Boolean"
            }
        ],
        "output": "Boolean",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_contains",
        "message0": "%1 contains %2?",
        "args0": [
            {
                "type": "input_value",
                "name": "STRING1"
            },
            {
                "type": "input_value",
                "name": "STRING2"
            }
        ],
        "output": "Boolean",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_divide",
        "message0": "%1 / %2",
        "args0": [
            {
                "type": "input_value",
                "name": "NUM1"
            },
            {
                "type": "input_value",
                "name": "NUM2"
            }
        ],
        "output": "Number",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_equals",
        "message0": "%1 = %2",
        "args0": [
            {
                "type": "input_value",
                "name": "OPERAND1"
            },
            {
                "type": "input_value",
                "name": "OPERAND2"
            }
        ],
        "output": "Boolean",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_gt",
        "message0": "%1 > %2",
        "args0": [
            {
                "type": "input_value",
                "name": "OPERAND1"
            },
            {
                "type": "input_value",
                "name": "OPERAND2"
            }
        ],
        "output": "Boolean",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_join",
        "message0": "join %1 %2",
        "args0": [
            {
                "type": "input_value",
                "name": "STRING1"
            },
            {
                "type": "input_value",
                "name": "STRING2"
            }
        ],
        "output": "String",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_length",
        "message0": "length of %1",
        "args0": [
            {
                "type": "input_value",
                "name": "STRING"
            }
        ],
        "output": "String",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_letter_of",
        "message0": "letter %1 of %2",
        "args0": [
            {
                "type": "input_value",
                "name": "LETTER"
            },
            {
                "type": "input_value",
                "name": "STRING"
            }
        ],
        "output": "String",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_lt",
        "message0": "%1 < %2",
        "args0": [
            {
                "type": "input_value",
                "name": "OPERAND1"
            },
            {
                "type": "input_value",
                "name": "OPERAND2"
            }
        ],
        "output": "Boolean",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_mathop",
        "message0": "%1 of %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "OPERATOR",
                "options": [
                    [
                        "abs",
                        "abs"
                    ],
                    [
                        "floor",
                        "floor"
                    ],
                    [
                        "ceiling",
                        "ceiling"
                    ],
                    [
                        "sqrt",
                        "sqrt"
                    ],
                    [
                        "sin",
                        "sin"
                    ],
                    [
                        "cos",
                        "cos"
                    ],
                    [
                        "tan",
                        "tan"
                    ],
                    [
                        "asin",
                        "asin"
                    ],
                    [
                        "acos",
                        "acos"
                    ],
                    [
                        "atan",
                        "atan"
                    ],
                    [
                        "ln",
                        "ln"
                    ],
                    [
                        "log",
                        "log"
                    ],
                    [
                        "e ^",
                        "e ^"
                    ],
                    [
                        "10 ^",
                        "10 ^"
                    ]
                ]
            },
            {
                "type": "input_value",
                "name": "NUM"
            }
        ],
        "output": "Number",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_mod",
        "message0": "%1 mod %2",
        "args0": [
            {
                "type": "input_value",
                "name": "NUM1"
            },
            {
                "type": "input_value",
                "name": "NUM2"
            }
        ],
        "output": "Number",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_multiply",
        "message0": "%1 * %2",
        "args0": [
            {
                "type": "input_value",
                "name": "NUM1"
            },
            {
                "type": "input_value",
                "name": "NUM2"
            }
        ],
        "output": "Number",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_not",
        "message0": "not %1",
        "args0": [
            {
                "type": "input_value",
                "name": "OPERAND",
                "check": "Boolean"
            }
        ],
        "output": "Boolean",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_or",
        "message0": "%1 or %2",
        "args0": [
            {
                "type": "input_value",
                "name": "OPERAND1",
                "check": "Boolean"
            },
            {
                "type": "input_value",
                "name": "OPERAND2",
                "check": "Boolean"
            }
        ],
        "output": "Boolean",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_random",
        "message0": "pick random %1 to %2",
        "args0": [
            {
                "type": "input_value",
                "name": "FROM"
            },
            {
                "type": "input_value",
                "name": "TO"
            }
        ],
        "output": "Number",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_round",
        "message0": "round %1",
        "args0": [
            {
                "type": "input_value",
                "name": "NUM"
            }
        ],
        "output": "Number",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "operator_subtract",
        "message0": "%1 - %2",
        "args0": [
            {
                "type": "input_value",
                "name": "NUM1"
            },
            {
                "type": "input_value",
                "name": "NUM2"
            }
        ],
        "output": "Number",
        "colour": "#00b94d",
        "inputsInline": true
    },
    {
        "type": "procedures_call",
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ff5d64"
    },
    {
        "type": "procedures_definition",
        "message0": "define %1",
        "args0": [
            {
                "type": "input_statement",
                "name": "custom_block"
            }
        ],
        "colour": "#ff5d64"
    },
    {
        "type": "sound_changeeffectby",
        "message0": "change %1 effect by %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "EFFECT",
                "options": [
                    [
                        "pitch",
                        "PITCH"
                    ],
                    [
                        "pan left/right",
                        "PAN"
                    ]
                ]
            },
            {
                "type": "input_value",
                "name": "VALUE"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#c061f1"
    },
    {
        "type": "sound_changevolumeby",
        "message0": "change volume by %1",
        "args0": [
            {
                "type": "input_value",
                "name": "VOLUME"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#c061f1"
    },
    {
        "type": "sound_cleareffects",
        "message0": "clear sound effects",
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#c061f1"
    },
    {
        "type": "sound_seteffectto",
        "message0": "set %1 effect to %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "EFFECT",
                "options": [
                    [
                        "pitch",
                        "PITCH"
                    ],
                    [
                        "pan left/right",
                        "PAN"
                    ]
                ]
            },
            {
                "type": "input_value",
                "name": "VALUE"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#c061f1"
    },
    {
        "type": "sound_setvolumeto",
        "message0": "set volume to %1%",
        "args0": [
            {
                "type": "input_value",
                "name": "VOLUME"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#c061f1"
    },
    {
        "type": "sound_volume",
        "message0": "volume",
        "checkboxInFlyout": true,
        "output": "Number",
        "colour": "#c061f1"
    }
];
