export interface BlocklyStateVariable {
    id: string;
    name: string;
    type: string;
}

export interface BlocklyStateVariableRef {
    id: string;
}

export interface BlocklyStateShadow {
    id: string;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields: Record<string, any>; // string, or number, or variable ref, or shadow
}

export interface BlocklyStateNextBlock {
    block: BlocklyStateBlock;
}

export interface BlocklyStateBlock {
    id: string;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields: Record<string, any>; // string, or number, or variable ref, or shadow
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inputs: Record<string, any>; // typically a block or a shadow
    next?: BlocklyStateNextBlock;
    x?: number;
    y?: number;
}

export interface BlocklyStateVersionedBlocks {
    blocks: BlocklyStateBlock[];
    languageVersion: number;
}

export interface BlocklyState {
    variables: BlocklyStateVariable[];
    blocks: BlocklyStateVersionedBlocks;
}
