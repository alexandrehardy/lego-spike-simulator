import { ldrawColourMap } from '$lib/ldraw/colours';
import { writable } from 'svelte/store';
import JSZip from 'jszip';

export type Matrix = number[];

export interface Colour {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface BrickColour {
    inheritSurface: boolean;
    inheritEdge: boolean;
    edge: Colour;
    surface: Colour;
}
export interface Vertex {
    x: number;
    y: number;
    z: number;
}

export interface Line {
    colour: BrickColour;
    p1: Vertex;
    p2: Vertex;
}

export interface Triangle {
    colour: BrickColour;
    p1: Vertex;
    p2: Vertex;
    p3: Vertex;
}

export interface Quad {
    colour: BrickColour;
    p1: Vertex;
    p2: Vertex;
    p3: Vertex;
    p4: Vertex;
}

export interface OptionalLine {
    colour: BrickColour;
    p1: Vertex;
    p2: Vertex;
    c1: Vertex;
    c2: Vertex;
}

export interface Subpart {
    colour: BrickColour;
    matrix: Matrix;
    model: Model | undefined;
    modelNumber: string;
}

export interface Model {
    subparts: Subpart[];
    lines: Line[];
    triangles: Triangle[];
    quads: Quad[];
    optionalLines: OptionalLine[];
}

export interface PartDetail {
    partNumber: string;
    model: Model;
}

export interface LDrawStore {
    robotModel: Model | undefined;
    unresolved: string[];
}

type ResolverCallback = (part: PartDetail) => void;

export let robotModel: Model | undefined;
export const components = new Map<string, Model>();
export const unresolved = new Map<string, ResolverCallback[]>();

function hexColor(hex: string) {
    const bigint = parseInt(hex.substring(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r: r / 255.0, g: g / 255.0, b: b / 255.0, a: 1.0 };
}

export function brickColour(id: string): BrickColour {
    const record = ldrawColourMap.get(id);
    if (id == '16') {
        return {
            inheritSurface: true,
            inheritEdge: false,
            edge: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            surface: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }
        };
    }
    if (id == '24') {
        return {
            inheritSurface: false,
            inheritEdge: true,
            edge: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            surface: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }
        };
    }
    if (record) {
        return {
            inheritSurface: false,
            inheritEdge: false,
            edge: hexColor(record.EDGE),
            surface: hexColor(record.VALUE)
        };
    } else {
        return {
            inheritSurface: false,
            inheritEdge: false,
            edge: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            surface: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }
        };
    }
}

export function getUnresolvedParts() {
    return Array.from(unresolved.keys());
}

export async function setRobotFromFile(file: File) {
    robotModel = loadModel(await file.text());
    componentStore.set({ robotModel: robotModel, unresolved: getUnresolvedParts() });
    return robotModel;
}

export function getRobotModel() {
    return robotModel;
}

export function resolveSubpart(subpart: Subpart) {
    const model = components.get(subpart.modelNumber);
    if (model) {
        subpart.model = model;
    } else {
        let callbacks = unresolved.get(subpart.modelNumber);
        if (!callbacks) {
            callbacks = [];
        }
        callbacks.push((part: PartDetail) => {
            subpart.model = part.model;
        });
        unresolved.set(subpart.modelNumber, callbacks);
    }
}

interface MPDFile {
    name: string;
    content: string;
}

export function loadMPD(content: string): Model {
    const files: MPDFile[] = [];
    const lines = content.split('\n');
    let lastFile: string = '';
    let lastContents: string[] = [];

    for (let line of lines) {
        line = line.trim();
        let parts = line.split(' ');
        parts = parts.map((x) => x.trim()).filter((x) => x.length > 0);
        if (parts.length > 1 && parts[0] == '0' && parts[1].toUpperCase() == 'FILE') {
            if (lastFile.length > 0) {
                files.push({ name: lastFile, content: lastContents.join('\n') });
            }
            lastFile = parts.slice(2).join(' ');
            lastContents = [];
        } else {
            lastContents.push(line);
        }
    }
    if (lastFile.length > 0) {
        files.push({ name: lastFile, content: lastContents.join('\n') });
    }
    lastContents = [];
    const models: Model[] = [];
    for (const mpdPart of files) {
        const part = mpdPart.name;
        console.log(part);
        const content = mpdPart.content;
        const model = loadModel(content);
        models.push(model);
        components.set(part, model);
        const callbacks = unresolved.get(part);
        if (callbacks) {
            for (const callback of callbacks) {
                callback({ partNumber: part, model: model });
            }
        }
        unresolved.delete(part);
    }
    return models[0];
}

export function loadModel(content: string): Model {
    const model: Model = { subparts: [], lines: [], triangles: [], quads: [], optionalLines: [] };
    const lines = content.split('\n');
    for (let line of lines) {
        line = line.trim();
        let parts = line.split(' ');
        parts = parts.map((x) => x.trim()).filter((x) => x.length > 0);
        if (parts.length > 1) {
            if (parts[0] == '0' && parts[1].toUpperCase() == 'FILE') {
                return loadMPD(content);
            }
        }
    }
    for (let line of lines) {
        line = line.trim();
        let parts = line.split(' ');
        parts = parts.map((x) => x.trim()).filter((x) => x.length > 0);
        if (parts[0] == '0') {
            // comment or meta
            // we don't worry about meta
            continue;
        } else if (parts[0] == '1') {
            // subpart
            const colour = parts[1];
            const x = parts[2];
            const y = parts[3];
            const z = parts[4];
            const a = parts[5];
            const b = parts[6];
            const c = parts[7];
            const d = parts[8];
            const e = parts[9];
            const f = parts[10];
            const g = parts[11];
            const h = parts[12];
            const i = parts[13];
            const subpart = parts.slice(14).join(' ');
            const entry: Subpart = {
                colour: brickColour(colour),
                matrix: [+a, +d, +g, 0, +b, +e, +h, 0, +c, +f, +i, 0, +x, +y, +z, 1],
                model: undefined,
                modelNumber: subpart
            };
            model.subparts.push(entry);
            resolveSubpart(entry);
        } else if (parts[0] == '2') {
            // line
            const colour = parts[1];
            const x1 = parts[2];
            const y1 = parts[3];
            const z1 = parts[4];
            const x2 = parts[5];
            const y2 = parts[6];
            const z2 = parts[7];
            model.lines.push({
                colour: brickColour(colour),
                p1: { x: +x1, y: +y1, z: +z1 },
                p2: { x: +x2, y: +y2, z: +z2 }
            });
        } else if (parts[0] == '3') {
            // triangle
            const colour = parts[1];
            const x1 = parts[2];
            const y1 = parts[3];
            const z1 = parts[4];
            const x2 = parts[5];
            const y2 = parts[6];
            const z2 = parts[7];
            const x3 = parts[8];
            const y3 = parts[9];
            const z3 = parts[10];
            model.triangles.push({
                colour: brickColour(colour),
                p1: { x: +x1, y: +y1, z: +z1 },
                p2: { x: +x2, y: +y2, z: +z2 },
                p3: { x: +x3, y: +y3, z: +z3 }
            });
        } else if (parts[0] == '4') {
            // quad
            const colour = parts[1];
            const x1 = parts[2];
            const y1 = parts[3];
            const z1 = parts[4];
            const x2 = parts[5];
            const y2 = parts[6];
            const z2 = parts[7];
            const x3 = parts[8];
            const y3 = parts[9];
            const z3 = parts[10];
            const x4 = parts[11];
            const y4 = parts[12];
            const z4 = parts[13];
            model.quads.push({
                colour: brickColour(colour),
                p1: { x: +x1, y: +y1, z: +z1 },
                p2: { x: +x2, y: +y2, z: +z2 },
                p3: { x: +x3, y: +y3, z: +z3 },
                p4: { x: +x4, y: +y4, z: +z4 }
            });
        } else if (parts[0] == '5') {
            // optional line
            const colour = parts[1];
            const x1 = parts[2];
            const y1 = parts[3];
            const z1 = parts[4];
            const x2 = parts[5];
            const y2 = parts[6];
            const z2 = parts[7];
            const x3 = parts[8];
            const y3 = parts[9];
            const z3 = parts[10];
            const x4 = parts[11];
            const y4 = parts[12];
            const z4 = parts[13];
            model.optionalLines.push({
                colour: brickColour(colour),
                p1: { x: +x1, y: +y1, z: +z1 },
                p2: { x: +x2, y: +y2, z: +z2 },
                c1: { x: +x3, y: +y3, z: +z3 },
                c2: { x: +x4, y: +y4, z: +z4 }
            });
        }
    }
    return model;
}

export async function resolveFromZip(f: File) {
    let unresolvedParts = getUnresolvedParts();
    const failedParts: string[] = [];
    const zip = new JSZip();
    const zipFile = await zip.loadAsync(f);
    while (unresolvedParts.length > 0) {
        for (const part of unresolvedParts) {
            const unixPart = part.replace('\\', '/');
            let file = zipFile.file(`ldraw/parts/${unixPart}`);
            if (!file) {
                file = zipFile.file(`ldraw/p/${unixPart}`);
            }
            if (!file) {
                console.log(`Missing ldraw/parts/${unixPart} in part library`);
                failedParts.push(part);
                continue;
            }
            const content = await file.async('string');
            const model = loadModel(content);
            components.set(part, model);
            const callbacks = unresolved.get(part);
            if (callbacks) {
                for (const callback of callbacks) {
                    callback({ partNumber: part, model: model });
                }
            }
            unresolved.delete(part);
        }
        unresolvedParts = getUnresolvedParts();
        componentStore.set({ robotModel: robotModel, unresolved: unresolvedParts });
        unresolvedParts = unresolvedParts.filter((p) => failedParts.findIndex((v) => v == p) < 0);
    }
}

export const componentStore = writable<LDrawStore>({ robotModel: undefined, unresolved: [] });
