import { ldrawColourMap, studioColourMap } from '$lib/ldraw/colours';
import { writable } from 'svelte/store';
import * as m4 from '$lib/ldraw/m4';
import JSZip from 'jszip';

let studioMode = false;

export function setStudioMode(mode: boolean) {
    studioMode = mode;
}

export type Matrix = number[];

export interface Colour {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface BrickColour {
    code: string;
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

export interface PortConnection {
    hub: string;
    port: string;
}

export interface Subpart {
    colour: BrickColour;
    port?: PortConnection;
    matrix: Matrix;
    model: Model | undefined;
    modelNumber: string;
    id: number;
}

export interface Model {
    name: string;
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
    canFetchComponents: boolean;
}

type ResolverCallback = (part: PartDetail) => void;

export let robotModel: Model | undefined;
export const components = new Map<string, Model>();
export const unresolved = new Map<string, ResolverCallback[]>();
let canFetchComponents = (window?.location?.href ?? 'file://').startsWith('http');
let subpartId = 0;

function nextSubpartId() {
    subpartId++;
    return subpartId;
}

function hexColor(hex: string) {
    const bigint = parseInt(hex.substring(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r: r / 255.0, g: g / 255.0, b: b / 255.0, a: 1.0 };
}

export function brickColour(id: string): BrickColour {
    if (studioMode) {
        const ldrawId = studioColourMap.get(id);
        if (ldrawId) {
            id = ldrawId;
        }
    }
    const record = ldrawColourMap.get(id);
    if (id == '16' || id == '-1') {
        return {
            code: id,
            inheritSurface: true,
            inheritEdge: false,
            edge: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            surface: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }
        };
    }
    if (id == '24' || id == '-2') {
        return {
            code: id,
            inheritSurface: false,
            inheritEdge: true,
            edge: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            surface: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }
        };
    }
    if (record) {
        return {
            code: id,
            inheritSurface: false,
            inheritEdge: false,
            edge: hexColor(record.EDGE),
            surface: hexColor(record.VALUE)
        };
    } else {
        return {
            code: '0',
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

export function updateUnresolvedParts() {
    componentStore.update((old) => {
        return {
            robotModel: old.robotModel,
            unresolved: getUnresolvedParts(),
            canFetchComponents: old.canFetchComponents
        };
    });
}

export function setRobotFromContent(content: string) {
    robotModel = loadModel('main.ldr', content);
    componentStore.set({
        robotModel: robotModel,
        unresolved: getUnresolvedParts(),
        canFetchComponents: canFetchComponents
    });
    if (canFetchComponents) {
        fetchAndResolveParts();
    }
    return robotModel;
}

export async function setRobotFromFile(file: File) {
    return setRobotFromContent(await file.text());
}

export async function fetchAndResolveParts() {
    try {
        // Try for individual parts first
        let response = await fetch('ldraw/parts.lst');
        if (response.ok) {
            const content = await response.text();
            if (content.startsWith('<!doctype html>')) {
                // This is served by npm run dev.
                // It isn't a list of files
            } else {
                await resolveFromHttp(content);
                return;
            }
        }

        // Try the zip file
        response = await fetch('complete.zip');
        if (response.ok) {
            const blob = await response.blob();
            await resolveFromZip(blob);
        } else {
            canFetchComponents = false;
            componentStore.update((old) => ({ ...old, canFetchComponents: false }));
        }
    } catch {
        canFetchComponents = false;
        componentStore.update((old) => ({ ...old, canFetchComponents: false }));
    }
}

export function getRobotModel() {
    return robotModel;
}

const substituteParts: Record<string, string> = {
    'bb1142c01.dat': '45601c01.dat',
    '37308c01.dat': '37308.dat',
    '37312c01.dat': '37312.dat',
    '37316c01.dat': '37316.dat',
    '54696c01.dat': '54696.dat',
    '54675c01.dat': '54675.dat',
    '68488c01.dat': '68488.dat'
};

export function resolveSubpart(subpart: Subpart) {
    let partNumber = subpart.modelNumber.toLowerCase();
    // Lego studio workaround
    const replacement = substituteParts[partNumber];
    if (replacement) {
        partNumber = replacement;
        subpart.modelNumber = replacement;
    }
    const model = components.get(partNumber);
    if (model) {
        subpart.model = model;
    } else {
        let callbacks = unresolved.get(partNumber);
        if (!callbacks) {
            callbacks = [];
        }
        callbacks.push((part: PartDetail) => {
            subpart.model = part.model;
        });
        unresolved.set(partNumber, callbacks);
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
        let part = mpdPart.name.toLowerCase();
        const replacement = substituteParts[part];
        if (replacement) {
            part = replacement;
        }
        const content = mpdPart.content;
        const model = loadModel(part, content);
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

export function saveMPD(model: Model) {
    const content: string[] = [];
    const saved = new Map<string, Model>();
    const queue = new Map<string, Model>();
    queue.set('main.ldr', model);
    let items = [...queue];
    while (items.length > 0) {
        const [name, model] = items[0];
        queue.delete(name);
        saved.set(name.toLowerCase(), model);
        content.push(`0 FILE ${name}`);
        content.push(`0 ${name.replace('.ldr', '').replace('.dat', '')}`);
        content.push(`0 Name: ${name}`);
        for (const line of model.lines) {
            const c = line.colour.code;
            const x1 = line.p1.x;
            const y1 = line.p1.y;
            const z1 = line.p1.z;
            const x2 = line.p2.x;
            const y2 = line.p2.y;
            const z2 = line.p2.z;
            content.push(`2 ${c} ${x1} ${y1} ${z1} ${x2} ${y2} ${z2}`);
        }
        for (const triangle of model.triangles) {
            const c = triangle.colour.code;
            const x1 = triangle.p1.x;
            const y1 = triangle.p1.y;
            const z1 = triangle.p1.z;
            const x2 = triangle.p2.x;
            const y2 = triangle.p2.y;
            const z2 = triangle.p2.z;
            const x3 = triangle.p3.x;
            const y3 = triangle.p3.y;
            const z3 = triangle.p3.z;
            content.push(`3 ${c} ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ${x3} ${y3} ${z3}`);
        }
        for (const quad of model.quads) {
            const c = quad.colour.code;
            const x1 = quad.p1.x;
            const y1 = quad.p1.y;
            const z1 = quad.p1.z;
            const x2 = quad.p2.x;
            const y2 = quad.p2.y;
            const z2 = quad.p2.z;
            const x3 = quad.p3.x;
            const y3 = quad.p3.y;
            const z3 = quad.p3.z;
            const x4 = quad.p4.x;
            const y4 = quad.p4.y;
            const z4 = quad.p4.z;
            content.push(
                `4 ${c} ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ${x3} ${y3} ${z3} ${x4} ${y4} ${z4}`
            );
        }
        for (const opt of model.optionalLines) {
            const c = opt.colour.code;
            const x1 = opt.p1.x;
            const y1 = opt.p1.y;
            const z1 = opt.p1.z;
            const x2 = opt.p2.x;
            const y2 = opt.p2.y;
            const z2 = opt.p2.z;
            const x3 = opt.c1.x;
            const y3 = opt.c1.y;
            const z3 = opt.c1.z;
            const x4 = opt.c2.x;
            const y4 = opt.c2.y;
            const z4 = opt.c2.z;
            content.push(
                `5 ${c} ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ${x3} ${y3} ${z3} ${x4} ${y4} ${z4}`
            );
        }
        for (const subpart of model.subparts) {
            const clr = subpart.colour.code;
            if (subpart.port) {
                // Add main to support multiple hubs in the future
                content.push(`0 !SPIKE_PORT ${subpart.port.hub} ${subpart.port.port}`);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [a, d, g, zero1, b, e, h, zero2, c, f, i, zero3, x, y, z, one] = subpart.matrix;
            const sname = subpart.modelNumber;
            content.push(
                `1 ${clr} ${x} ${y} ${z} ${a} ${b} ${c} ${d} ${e} ${f} ${g} ${h} ${i} ${sname}`
            );
            if (subpart.model) {
                if (
                    !saved.get(subpart.modelNumber.toLowerCase()) &&
                    !queue.get(subpart.modelNumber.toLowerCase())
                ) {
                    queue.set(subpart.modelNumber.toLowerCase(), subpart.model);
                }
            }
        }
        content.push('');
        items = [...queue];
    }
    content.push('');
    return content.join('\r\n');
}

export function loadModel(name: string, content: string): Model {
    let lastPort: string | undefined = undefined;
    let lastHub: string | undefined = undefined;
    const model: Model = {
        name: name,
        subparts: [],
        lines: [],
        triangles: [],
        quads: [],
        optionalLines: []
    };
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
            // we don't worry about meta, except spike ports
            if (parts[1] !== '!SPIKE_PORT') {
                continue;
            }
            lastHub = parts[2];
            lastPort = parts[3];
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
                id: nextSubpartId(),
                colour: brickColour(colour),
                matrix: [+a, +d, +g, 0, +b, +e, +h, 0, +c, +f, +i, 0, +x, +y, +z, 1],
                model: undefined,
                modelNumber: subpart
            };
            if (lastPort && lastHub) {
                entry.port = { hub: lastHub, port: lastPort };
            }
            model.subparts.push(entry);
            resolveSubpart(entry);
            lastPort = undefined;
            lastHub = undefined;
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
            lastPort = undefined;
            lastHub = undefined;
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
            lastPort = undefined;
            lastHub = undefined;
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
            lastPort = undefined;
            lastHub = undefined;
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
            lastPort = undefined;
            lastHub = undefined;
        }
    }
    return model;
}

export async function resolveFromZip(f: Blob) {
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
            const model = loadModel(part, content);
            components.set(part.toLowerCase(), model);
            const callbacks = unresolved.get(part.toLowerCase());
            if (callbacks) {
                for (const callback of callbacks) {
                    callback({ partNumber: part, model: model });
                }
            }
            unresolved.delete(part);
        }
        unresolvedParts = getUnresolvedParts();
        componentStore.set({
            robotModel: robotModel,
            unresolved: unresolvedParts,
            canFetchComponents: canFetchComponents
        });
        unresolvedParts = unresolvedParts.filter((p) => failedParts.findIndex((v) => v == p) < 0);
    }
}

export async function resolveFromHttp(partList: string) {
    const partsArray = partList.split('\n').map((x) => x.trim());
    const availableParts = new Set(partsArray);
    let unresolvedParts = getUnresolvedParts();
    const failedParts: string[] = [];
    while (unresolvedParts.length > 0) {
        for (const part of unresolvedParts) {
            const unixPart = part.replace('\\', '/');
            let response: Response;
            if (availableParts.has(`parts/${unixPart}`)) {
                response = await fetch(`ldraw/parts/${unixPart}`);
                if (!response.ok) {
                    console.log(`Missing ldraw/parts/${unixPart} from HTTP`);
                    failedParts.push(part);
                    continue;
                }
            } else if (availableParts.has(`p/${unixPart}`)) {
                response = await fetch(`ldraw/p/${unixPart}`);
                if (!response.ok) {
                    console.log(`Missing ldraw/p/${unixPart} from HTTP`);
                    failedParts.push(part);
                    continue;
                }
            } else {
                console.log(`Missing ldraw/parts/${unixPart} from HTTP`);
                failedParts.push(part);
                continue;
            }
            const content = await response.text();
            const model = loadModel(part, content);
            components.set(part.toLowerCase(), model);
            const callbacks = unresolved.get(part.toLowerCase());
            if (callbacks) {
                for (const callback of callbacks) {
                    callback({ partNumber: part, model: model });
                }
            }
            unresolved.delete(part);
        }
        unresolvedParts = getUnresolvedParts();
        componentStore.set({
            robotModel: robotModel,
            unresolved: unresolvedParts,
            canFetchComponents: canFetchComponents
        });
        unresolvedParts = unresolvedParts.filter((p) => failedParts.findIndex((v) => v == p) < 0);
    }
}

export const componentStore = writable<LDrawStore>({
    robotModel: undefined,
    unresolved: [],
    canFetchComponents: canFetchComponents
});

export interface PartMatch {
    id: number;
    part: string;
}

export function findParts(model: Model | undefined, partList: string[]): PartMatch[] {
    const result: PartMatch[] = [];
    if (!model) {
        return result;
    }
    for (const subpart of model.subparts) {
        const match = partList.find((x) => `${x}.dat` === subpart.modelNumber);
        if (match) {
            result.push({ id: subpart.id, part: subpart.modelNumber.replace('.dat', '') });
        } else {
            if (subpart.model) {
                const subMatches = findParts(subpart.model, partList);
                for (const match of subMatches) {
                    result.push(match);
                }
            }
        }
    }
    return result;
}

export function makeInverse(m: m4.Matrix4) {
    // Simple inverse, for only rotations and translations.
    // We invert the rotation by a transpose of the 3x3 matrix
    // and negate the translation
    const rotate = [m[0], m[4], m[8], 0, m[1], m[5], m[9], 0, m[2], m[6], m[10], 0, 0, 0, 0, 1];
    const translate = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -m[12], -m[13], -m[14], 1];
    return m4.multiply(rotate, translate);
}

export interface PartTransform {
    forward: m4.Matrix4;
    inverse: m4.Matrix4;
    model: Model;
}

export function findPartTransform(model: Model | undefined, id: number): PartTransform | undefined {
    if (!model) {
        return undefined;
    }
    for (const subpart of model.subparts) {
        if (subpart.id == id) {
            return {
                forward: subpart.matrix,
                inverse: makeInverse(subpart.matrix),
                model: subpart.model
            };
        } else {
            if (subpart.model) {
                const result = findPartTransform(subpart.model, id);
                if (result) {
                    const matrix = m4.multiply(subpart.matrix, result.forward);
                    return { forward: matrix, inverse: makeInverse(matrix), model: result.model };
                }
            }
        }
    }
    return undefined;
}

export function clearPorts(model: Model | undefined) {
    if (!model) {
        return;
    }
    for (const subpart of model.subparts) {
        subpart.port = undefined;
        clearPorts(subpart.model);
    }
}

export function setPort(model: Model | undefined, hub: string, port: string, id: number) {
    if (!model) {
        return;
    }
    for (const subpart of model.subparts) {
        if (subpart.id === id) {
            subpart.port = { hub: hub, port: port };
        } else {
            setPort(subpart.model, hub, port, id);
        }
    }
}
