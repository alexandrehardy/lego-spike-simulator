export const toolbox = {
    kind: 'categoryToolbox',
    contents: [
        {
            kind: 'category',
            name: 'MOTOR',
            contents: [
                {
                    kind: 'block',
                    type: 'flippermotor_motorTurnForDirection'
                },
                {
                    kind: 'block',
                    type: 'flippermotor_motorGoDirectionToPosition'
                },
                {
                    kind: 'block',
                    type: 'flippermotor_motorStartDirection'
                },
                {
                    kind: 'block',
                    type: 'flippermotor_motorStop'
                },
                {
                    kind: 'block',
                    type: 'flippermotor_motorSetSpeed'
                },
                {
                    kind: 'block',
                    type: 'flippermotor_absolutePosition'
                },
                {
                    kind: 'block',
                    type: 'flippermotor_speed'
                }
            ],
            colour: '#0090f5'
        },
        {
            kind: 'category',
            name: 'MOVEMENT',
            contents: [
                {
                    kind: 'block',
                    type: 'flippermove_move'
                },
                {
                    kind: 'block',
                    type: 'flippermove_startMove'
                },
                {
                    kind: 'block',
                    type: 'flippermove_steer'
                },
                {
                    kind: 'block',
                    type: 'flippermove_startSteer'
                },
                {
                    kind: 'block',
                    type: 'flippermove_stopMove'
                },
                {
                    kind: 'block',
                    type: 'flippermove_movementSpeed'
                },
                {
                    kind: 'block',
                    type: 'flippermove_setMovementPair'
                },
                {
                    kind: 'block',
                    type: 'flippermove_setDistance'
                }
            ],
            colour: '#ff4ccd'
        },
        {
            kind: 'category',
            name: 'LIGHT',
            contents: [
                {
                    kind: 'block',
                    type: 'flipperlight_lightDisplayImageOnForTime'
                },
                {
                    kind: 'block',
                    type: 'flipperlight_lightDisplayImageOn'
                },
                {
                    kind: 'block',
                    type: 'flipperlight_lightDisplayText'
                },
                {
                    kind: 'block',
                    type: 'flipperlight_lightDisplayOff'
                },
                {
                    kind: 'block',
                    type: 'flipperlight_lightDisplaySetBrightness'
                },
                {
                    kind: 'block',
                    type: 'flipperlight_lightDisplaySetPixel'
                },
                {
                    kind: 'block',
                    type: 'flipperlight_lightDisplayRotate'
                },
                {
                    kind: 'block',
                    type: 'flipperlight_lightDisplaySetOrientation'
                },
                {
                    kind: 'block',
                    type: 'flipperlight_centerButtonLight'
                },
                {
                    kind: 'block',
                    type: 'flipperlight_ultrasonicLightUp'
                }
            ],
            colour: '#9b6af6'
        },
        {
            kind: 'category',
            name: 'SOUND',
            contents: [
                {
                    kind: 'button',
                    text: 'Add sound from Library',
                    callbackkey: 'ADD_SPIKE_AUDIO'
                },
                {
                    kind: 'block',
                    type: 'flippersound_playSoundUntilDone'
                },
                {
                    kind: 'block',
                    type: 'flippersound_playSound'
                },
                {
                    kind: 'block',
                    type: 'flippersound_beepForTime'
                },
                {
                    kind: 'block',
                    type: 'flippersound_beep'
                },
                {
                    kind: 'block',
                    type: 'flippersound_stopSound'
                },
                {
                    kind: 'block',
                    type: 'sound_changeeffectby'
                },
                {
                    kind: 'block',
                    type: 'sound_seteffectto'
                },
                {
                    kind: 'block',
                    type: 'sound_cleareffects'
                },
                {
                    kind: 'block',
                    type: 'sound_changevolumeby'
                },
                {
                    kind: 'block',
                    type: 'sound_setvolumeto'
                },
                {
                    kind: 'block',
                    type: 'sound_volume'
                }
            ],
            colour: '#c061f1'
        },
        {
            kind: 'category',
            name: 'EVENT',
            contents: [
                {
                    kind: 'block',
                    type: 'flipperevents_whenProgramStarts'
                },
                {
                    kind: 'block',
                    type: 'flipperevents_whenColor'
                },
                {
                    kind: 'block',
                    type: 'flipperevents_whenPressed'
                },
                {
                    kind: 'block',
                    type: 'flipperevents_whenDistance'
                },
                {
                    kind: 'block',
                    type: 'flipperevents_whenTilted'
                },
                {
                    kind: 'block',
                    type: 'flipperevents_whenOrientation'
                },
                {
                    kind: 'block',
                    type: 'flipperevents_whenGesture'
                },
                {
                    kind: 'block',
                    type: 'flipperevents_whenButton'
                },
                {
                    kind: 'block',
                    type: 'flipperevents_whenTimer'
                },
                {
                    kind: 'block',
                    type: 'flipperevents_whenCondition'
                },
                {
                    kind: 'block',
                    type: 'event_whenbroadcastreceived'
                },
                {
                    kind: 'block',
                    type: 'event_broadcast'
                },
                {
                    kind: 'block',
                    type: 'event_broadcastandwait'
                }
            ],
            colour: '#f5c402'
        },
        {
            kind: 'category',
            name: 'CONTROL',
            contents: [
                {
                    kind: 'block',
                    type: 'control_wait'
                },
                {
                    kind: 'block',
                    type: 'control_repeat'
                },
                {
                    kind: 'block',
                    type: 'control_forever'
                },
                {
                    kind: 'block',
                    type: 'control_if'
                },
                {
                    kind: 'block',
                    type: 'control_if_else'
                },
                {
                    kind: 'block',
                    type: 'control_wait_until'
                },
                {
                    kind: 'block',
                    type: 'control_repeat_until'
                },
                {
                    kind: 'block',
                    type: 'flippercontrol_stopOtherStacks'
                },
                {
                    kind: 'block',
                    type: 'flippercontrol_stop'
                }
            ],
            colour: '#ffb515'
        },
        {
            kind: 'category',
            name: 'SENSOR',
            contents: [
                {
                    kind: 'block',
                    type: 'flippersensors_isColor'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_color'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_isReflectivity'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_reflectivity'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_isPressed'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_force'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_isDistance'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_distance'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_isTilted'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_isorientation'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_ismotion'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_orientationAxis'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_resetYaw'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_buttonIsPressed'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_timer'
                },
                {
                    kind: 'block',
                    type: 'flippersensors_resetTimer'
                }
            ],
            colour: '#3fccf1'
        },
        {
            kind: 'category',
            name: 'OPERATOR',
            contents: [
                {
                    kind: 'block',
                    type: 'operator_random'
                },
                {
                    kind: 'block',
                    type: 'operator_add'
                },
                {
                    kind: 'block',
                    type: 'operator_subtract'
                },
                {
                    kind: 'block',
                    type: 'operator_multiply'
                },
                {
                    kind: 'block',
                    type: 'operator_divide'
                },
                {
                    kind: 'block',
                    type: 'operator_lt'
                },
                {
                    kind: 'block',
                    type: 'operator_equals'
                },
                {
                    kind: 'block',
                    type: 'operator_gt'
                },
                {
                    kind: 'block',
                    type: 'operator_and'
                },
                {
                    kind: 'block',
                    type: 'operator_or'
                },
                {
                    kind: 'block',
                    type: 'operator_not'
                },
                {
                    kind: 'block',
                    type: 'flipperoperator_isInBetween'
                },
                {
                    kind: 'block',
                    type: 'operator_join'
                },
                {
                    kind: 'block',
                    type: 'operator_letter_of'
                },
                {
                    kind: 'block',
                    type: 'operator_length'
                },
                {
                    kind: 'block',
                    type: 'operator_contains'
                },
                {
                    kind: 'block',
                    type: 'operator_mod'
                },
                {
                    kind: 'block',
                    type: 'operator_round'
                },
                {
                    kind: 'block',
                    type: 'operator_mathop'
                }
            ],
            colour: '#00b94d'
        },
        {
            kind: 'category',
            name: 'MORE-MOTOR',
            contents: [
                {
                    kind: 'block',
                    type: 'flippermoremotor_motorGoToRelativePosition'
                },
                {
                    kind: 'block',
                    type: 'flippermoremotor_motorStartPower'
                },
                {
                    kind: 'block',
                    type: 'flippermoremotor_motorSetStopMethod'
                },
                {
                    kind: 'block',
                    type: 'flippermoremotor_motorSetAcceleration'
                }
            ],
            colour: '#0090f5'
        },
        {
            kind: 'category',
            name: 'MORE-SENSOR',
            contents: [
                {
                    kind: 'block',
                    type: 'flippermoresensors_rawColor'
                },
                {
                    kind: 'block',
                    type: 'flippermoresensors_acceleration'
                },
                {
                    kind: 'block',
                    type: 'flippermoresensors_angularVelocity'
                },
                {
                    kind: 'block',
                    type: 'flippermoresensors_orientation'
                }
            ],
            colour: '#3fccf1'
        },
        {
            kind: 'category',
            name: 'VARIABLES',
            custom: 'SPIKE_VARIABLES',
            colour: '#ff9835'
        },
        {
            kind: 'category',
            name: 'MY BLOCKS',
            custom: 'SPIKE_BLOCKS',
            colour: '#ff5d64'
        }
    ]
};
