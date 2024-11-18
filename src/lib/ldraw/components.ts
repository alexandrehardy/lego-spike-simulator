import JSZip from 'jszip';

export type Matrix = number[];

export interface Vertex {
    x: number;
    y: number;
    z: number;
}

export interface Line {
    colour: number;
    p1: Vertex;
    p2: Vertex;
}

export interface Triangle {
    colour: number;
    p1: Vertex;
    p2: Vertex;
    p3: Vertex;
}

export interface Quad {
    colour: number;
    p1: Vertex;
    p2: Vertex;
    p3: Vertex;
    p4: Vertex;
}

export interface OptionalLine {
    colour: number;
    p1: Vertex;
    p2: Vertex;
    c1: Vertex;
    c2: Vertex;
}

export interface Subpart {
    colour: number;
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

type ResolverCallback = (part: PartDetail) => boolean;

export let robotModel: Model | undefined;
export const components = new Map<string, Model>();
export const unresolved = new Map<string, Model[]>();

export function getUnresolvedParts() {
    return Array.from(unresolved.keys());
}

export async function setRobotFromFile(file: File) {
    robotModel = loadModel(await file.text());
    return robotModel;
}

export function loadModel(content: string): Model {
    const model: Model = { subparts: [], lines: [], triangles: [], quads: [], optionalLines: [] };
    const lines = content.split('\n');
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
            const subpart = parts[14];
            const entry = {
                colour: +colour,
                matrix: [+a, +b, +c, +x, +d, +e, +f, +y, +g, +h, +i, +z, 0, 0, 0, 1],
                model: undefined,
                modelNumber: subpart
            };
            // TODO: Check for if the model is defined
            // And register a resolver if not
            model.subparts.push(entry);
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
                colour: +colour,
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
                colour: +colour,
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
                colour: +colour,
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
            model.quads.push({
                colour: +colour,
                p1: { x: +x1, y: +y1, z: +z1 },
                p2: { x: +x2, y: +y2, z: +z2 },
                c1: { x: +x3, y: +y3, z: +z3 },
                c2: { x: +x4, y: +y4, z: +z4 }
            });
        }
    }
    return model;
}

export function resolveFromZip(zipFile: File) {}
