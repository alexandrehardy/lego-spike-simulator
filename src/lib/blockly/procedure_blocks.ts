export const procedureBlocks = [
    {
        //top: 1,
        type: 'procedures_definition',
        message0: 'define %1',
        args0: [
            {
                type: 'input_statement',
                name: 'custom_block'
            }
        ],
        style: 'procedure_blocks',
        nextStatement: null,
        inputsInline: true,
        hat: false
    },
    {
        type: 'procedures_prototype',
        message0: '%1',
        args0: [
            {
                type: 'field_label_serializable',
                name: 'NAME'
            }
        ],
        style: 'procedure_blocks',
        previousStatement: null,
        nextStatement: null,
        inputsInline: true
    },
    {
        type: 'procedures_call',
        message0: '%1 %2',
        args0: [
            {
                type: 'field_metadata',
                name: 'ID'
            },
            {
                type: 'field_label_serializable',
                name: 'NAME'
            }
        ],
        style: 'procedure_blocks',
        previousStatement: null,
        nextStatement: null,
        inputsInline: true
    },
    {
        type: 'argument_reporter_boolean',
        message0: ' %1',
        args0: [
            {
                type: 'field_label_serializable',
                name: 'VALUE',
                text: ''
            }
        ],
        style: 'procedure_blocks',
        output: ['Boolean']
    },
    {
        type: 'argument_reporter_string_number',
        message0: ' %1',
        args0: [
            {
                type: 'field_label_serializable',
                name: 'VALUE',
                text: ''
            }
        ],
        style: 'procedure_blocks',
        output: ['Number', 'String']
    }
];
