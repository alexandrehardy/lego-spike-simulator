import scratchParser from 'scratch-parser';
import JSZip from 'jszip';

export interface Sb3Meta {
    semver: string;
    vm: string;
    agent: string;
}

export interface Sb3Monitor {
    id: string;
    mode: 'default' | 'large' | 'slider' | 'list';
    opcode: string; // block this belongs to
    params: Record<string, string>;
    spriteName?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    width: number;
    height: number;
    x: number;
    y: number;
    visible: boolean;
    // for lists
    sliderMin?: number;
    sliderMax?: number;
    isDiscrete?: number;
}

export interface Sb3Asset {
    assetId: string;
    name: string;
    md5ext: string;
    dataFormat: string;
}

export interface Sb3Costume extends Sb3Asset {
    bitmapResolution: number;
    rotationCenterX: number;
    rotationCenterY: number;
}

export interface Sb3Sound extends Sb3Asset {
    rate: number;
    sampleCount: number;
}

export interface Sb3Comment {
    blockId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    minimized: boolean;
    text: string;
}

export interface Sb3Mutation {
    tagName: 'mutation';
    children: string[];
    proccode: string;
    argumentids: string[];
    warp: boolean;
    argumentnames?: string[];
    argumentdefaults?: string[];
    hasnext?: boolean;
}

export interface Sb3Block {
    opcode: string;
    next?: string;
    parent?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inputs: Record<string, any[]>; //array: [1=shadow/2=no shadow/3=obscured,id/const array,id?]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields: Record<string, any[]>; //array: [value, id?]
    shadow: boolean;
    topLevel: boolean;
    comment?: string | null;
    x?: number;
    y?: number;
    mutation?: Sb3Mutation;
}

export interface Sb3Target {
    isStage?: boolean | null;
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variables: Record<string, any[]>; // The key is the id of the variable, the first array item is the name, the second is the value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lists: Record<string, any[]>; // The key is the of the list, the first array item is the name, the second item is the array value
    broadcasts: Record<string, string>; // id to name map
    blocks: Record<string, Sb3Block>;
    comments: Record<string, Sb3Comment>;
    currentCostume: number;
    costumes: Sb3Costume[];
    sounds: Sb3Sound[];
    layerOrder?: number;
    volume?: number;
}

export interface Sb3Stage extends Sb3Target {
    tempo: number;
    videoState: 'on' | 'off' | 'on-flipped';
    videoTransparency: number;
    textToSpeechLanguage: string | null;
}

export interface Sb3Sprite extends Sb3Target {
    visible: boolean;
    x: number;
    y: number;
    size: number;
    direction: number;
    draggable: boolean;
    rotationStyle: 'all around' | 'left-right' | "don't rotate";
}

export interface Sb3Project {
    meta: Sb3Meta;
    monitors: Sb3Monitor[];
    extensions: string[];
    targets: Sb3Target[];
}

export async function loadScratchSb3(sb3: ArrayBuffer): Promise<Sb3Project | undefined> {
    const zip = new JSZip();
    const zipFile = await zip.loadAsync(sb3);

    const file = zipFile.file('project.json');
    if (!file) {
        console.log('Failed to load sb3: Missing project.json');
        return undefined;
    }

    const content = await file.async('text');
    const promise = new Promise<Sb3Project[] | undefined>((resolve) => {
        scratchParser(content, false, (err, project) => {
            if (err) {
                console.log(`Error opening file: ${err} ${typeof content}`);
                resolve(undefined);
            } else {
                resolve(project);
            }
        });
    });

    const result = await promise;
    if (!result) {
        return undefined;
    }
    return result[0] as Sb3Project;
}
