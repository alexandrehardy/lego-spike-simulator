export interface BlocklyStateVariable {
    id: string;
    name: string;
    type: string;
}

export interface BlocklyStateVariableRef {
    id: string;
}

export interface BlocklyStateShadow {
    id?: string;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields: Record<string, any>; // string, or number, or variable ref, or shadow
}

export interface BlocklyStateNextBlock {
    block: BlocklyStateBlock;
}

export interface BlockOrShadowState {
    block?: BlocklyStateBlock;
    shadow?: BlocklyStateShadow;
}

export interface BlocklyStateBlock {
    id?: string;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields: Record<string, any>; // string, or number, or variable ref, or shadow
    inputs: Record<string, BlockOrShadowState>; // typically a block or a shadow
    next?: BlocklyStateNextBlock;
    x?: number;
    y?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraState?: any;
}

export interface BlocklyStateVersionedBlocks {
    blocks: BlocklyStateBlock[];
    languageVersion: number;
}

export interface BlocklyState {
    variables: BlocklyStateVariable[];
    blocks: BlocklyStateVersionedBlocks;
}
