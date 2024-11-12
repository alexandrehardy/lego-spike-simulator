export const procedureBlocks = [
    {
        type: 'procedures_defnoreturn',
        message0: 'define %1 %2 %3',
        args0: [
            {
                type: 'field_input',
                name: 'NAME',
                text: '',
                spellcheck: false
            },
            {
                type: 'field_label',
                name: 'PARAMS',
                text: ''
            },
            {
                type: 'input_dummy',
                name: 'TOP'
            }
        ],
        style: 'procedure_blocks',
        helpUrl: '%{BKY_PROCEDURES_DEFNORETURN_HELPURL}',
        tooltip: '%{BKY_PROCEDURES_DEFNORETURN_TOOLTIP}',
        extensions: [
            'procedure_def_get_def_mixin',
            'procedure_def_var_mixin',
            'procedure_def_update_shape_mixin',
            'procedure_def_context_menu_mixin',
            'procedure_def_onchange_mixin',
            'procedure_def_validator_helper',
            'procedure_defnoreturn_get_caller_block_mixin',
            //'procedure_defnoreturn_set_comment_helper',
            'procedure_def_set_no_return_helper'
        ],
        nextStatement: null,
        hat: false
        //mutator: 'procedure_def_mutator',
    },
    {
        type: 'procedures_callnoreturn',
        message0: '%1 %2',
        args0: [
            { type: 'field_label', name: 'NAME', text: '%{BKY_UNNAMED_KEY}' },
            {
                type: 'input_dummy',
                name: 'TOPROW'
            }
        ],
        nextStatement: null,
        previousStatement: null,
        style: 'procedure_blocks',
        helpUrl: '%{BKY_PROCEDURES_CALLNORETURN_HELPURL}',
        extensions: [
            'procedure_caller_get_def_mixin',
            'procedure_caller_var_mixin',
            'procedure_caller_update_shape_mixin',
            'procedure_caller_context_menu_mixin',
            'procedure_caller_onchange_mixin',
            'procedure_callernoreturn_get_def_block_mixin'
        ],
        mutator: 'procedure_caller_mutator',
        inputsInline: true
    },
    {
        type: 'procedures_defreturn',
        message0: '%{BKY_PROCEDURES_DEFRETURN_TITLE} %1 %2 %3',
        message1: '%{BKY_PROCEDURES_DEFRETURN_DO} %1',
        message2: '%{BKY_PROCEDURES_DEFRETURN_RETURN} %1',
        args0: [
            {
                type: 'field_input',
                name: 'NAME',
                text: '',
                spellcheck: false
            },
            {
                type: 'field_label',
                name: 'PARAMS',
                text: ''
            },
            {
                type: 'input_dummy',
                name: 'TOP'
            }
        ],
        args1: [
            {
                type: 'input_statement',
                name: 'STACK'
            }
        ],
        args2: [
            {
                type: 'input_value',
                align: 'right',
                name: 'RETURN'
            }
        ],
        style: 'procedure_blocks',
        helpUrl: '%{BKY_PROCEDURES_DEFRETURN_HELPURL}',
        tooltip: '%{BKY_PROCEDURES_DEFRETURN_TOOLTIP}',
        extensions: [
            'procedure_def_get_def_mixin',
            'procedure_def_var_mixin',
            'procedure_def_update_shape_mixin',
            'procedure_def_context_menu_mixin',
            'procedure_def_onchange_mixin',
            'procedure_def_validator_helper',
            'procedure_defreturn_get_caller_block_mixin',
            'procedure_defreturn_set_comment_helper',
            'procedure_def_set_return_helper'
        ],
        mutator: 'procedure_def_mutator'
    },
    {
        type: 'procedures_callreturn',
        message0: '%1 %2',
        args0: [
            { type: 'field_label', name: 'NAME', text: '%{BKY_UNNAMED_KEY}' },
            {
                type: 'input_dummy',
                name: 'TOPROW'
            }
        ],
        output: null,
        style: 'procedure_blocks',
        helpUrl: '%{BKY_PROCEDURES_CALLRETURN_HELPURL}',
        extensions: [
            'procedure_caller_get_def_mixin',
            'procedure_caller_var_mixin',
            'procedure_caller_update_shape_mixin',
            'procedure_caller_context_menu_mixin',
            'procedure_caller_onchange_mixin',
            'procedure_callerreturn_get_def_block_mixin'
        ],
        mutator: 'procedure_caller_mutator'
    }
];
