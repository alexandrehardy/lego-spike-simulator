import {
    lego_vertex_shader,
    lego_fragment_shader,
    lego_fragment_shader_df,
    map_vertex_shader,
    map_fragment_shader
} from '$lib/ldraw/shaders';
import {
    type Vertex,
    type Model,
    type Line,
    type Triangle,
    type Quad,
    type Colour,
    type BrickColour
} from '$lib/ldraw/components';

import * as m4 from '$lib/ldraw/m4';

export interface BBox {
    min: Vertex;
    max: Vertex;
    radius: number; // Radius from center of bbox, squared
}

let nextCompiledId = 0;

export interface CompiledModel {
    id: number;
    vertices: Float32Array;
    colours: Float32Array;
    lineOffset: number;
    lines: number;
    triangleOffset: number;
    triangles: number;
    bbox: BBox;
    recenter: Vertex;
}

export interface CompileOptions {
    recenter?: boolean;
    rescale?: boolean;
    maxDepth?: number;
    wireframe?: boolean;
    select?: number[] | undefined;
}

export interface PipeLine {
    program: WebGLProgram;
    vertexAttribute: GLint;
    texcoordAttribute: GLint;
    colourAttribute: GLint;
    projectionMatrixUniform: WebGLUniformLocation | null;
    modelMatrixUniform: WebGLUniformLocation | null;
    samplerUniform: WebGLUniformLocation | null;
    brightnessUniform: WebGLUniformLocation | null;
    nearUniform: WebGLUniformLocation | null;
    farUniform: WebGLUniformLocation | null;
    renderDepthUniform: WebGLUniformLocation | null;
}

export interface MapTexture {
    width: number;
    height: number;
    texture: WebGLTexture;
}

export interface ColourBuffer {
    width: number;
    height: number;
    buffer: Uint8Array;
}

export class WebGLCompiler {
    compileVertices: number[];
    compileColours: number[];
    compileMatrix: m4.Matrix4;
    compiledLines: number;
    compiledTriangles: number;
    parentColour: BrickColour;

    constructor() {
        this.parentColour = {
            code: '0',
            inheritSurface: false,
            inheritEdge: false,
            surface: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
            edge: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }
        };
        this.compileMatrix = m4.identity();
        this.compileColours = [];
        this.compileVertices = [];
        this.compiledLines = 0;
        this.compiledTriangles = 0;
    }

    getColour(colour: BrickColour, edge: boolean): Colour {
        if (colour.inheritEdge) {
            return this.parentColour.edge;
        }
        if (colour.inheritSurface) {
            return this.parentColour.surface;
        }
        if (edge) {
            return colour.edge;
        } else {
            return colour.surface;
        }
    }

    getParentColour(colour: BrickColour): BrickColour {
        const inherit = colour.inheritEdge || colour.inheritSurface;
        return {
            code: inherit ? this.parentColour.code : colour.code,
            inheritEdge: false,
            inheritSurface: false,
            edge: inherit ? this.parentColour.edge : colour.edge,
            surface: inherit ? this.parentColour.surface : colour.surface
        };
    }

    computeBoundingBox(model: Model): BBox | undefined {
        let minx: number | undefined = undefined;
        let miny: number | undefined = undefined;
        let minz: number | undefined = undefined;
        let maxx: number | undefined = undefined;
        let maxy: number | undefined = undefined;
        let maxz: number | undefined = undefined;
        let cx = 0;
        let cy = 0;
        let cz = 0;
        let radius = 0;

        for (const line of model.lines) {
            for (const v of [line.p1, line.p2]) {
                if (!minx || v.x < minx) {
                    minx = v.x;
                }
                if (!maxx || v.x > maxx) {
                    maxx = v.x;
                }
                if (!miny || v.y < miny) {
                    miny = v.y;
                }
                if (!maxy || v.y > maxy) {
                    maxy = v.y;
                }
                if (!minz || v.z < minz) {
                    minz = v.z;
                }
                if (!maxz || v.z > maxz) {
                    maxz = v.z;
                }
            }
        }
        for (const t of model.triangles) {
            for (const v of [t.p1, t.p2, t.p3]) {
                if (!minx || v.x < minx) {
                    minx = v.x;
                }
                if (!maxx || v.x > maxx) {
                    maxx = v.x;
                }
                if (!miny || v.y < miny) {
                    miny = v.y;
                }
                if (!maxy || v.y > maxy) {
                    maxy = v.y;
                }
                if (!minz || v.z < minz) {
                    minz = v.z;
                }
                if (!maxz || v.z > maxz) {
                    maxz = v.z;
                }
            }
        }
        for (const q of model.quads) {
            for (const v of [q.p1, q.p2, q.p3, q.p4]) {
                if (!minx || v.x < minx) {
                    minx = v.x;
                }
                if (!maxx || v.x > maxx) {
                    maxx = v.x;
                }
                if (!miny || v.y < miny) {
                    miny = v.y;
                }
                if (!maxy || v.y > maxy) {
                    maxy = v.y;
                }
                if (!minz || v.z < minz) {
                    minz = v.z;
                }
                if (!maxz || v.z > maxz) {
                    maxz = v.z;
                }
            }
        }

        cx = 0.5 * ((minx ?? 0) + (maxx ?? 0));
        cy = 0.5 * ((miny ?? 0) + (maxy ?? 0));
        cz = 0.5 * ((minz ?? 0) + (maxz ?? 0));

        for (const line of model.lines) {
            for (const v of [line.p1, line.p2]) {
                const r =
                    (v.x - cx) * (v.x - cx) + (v.y - cy) * (v.y - cy) + (v.z - cz) * (v.z - cz);
                if (r > radius) {
                    radius = r;
                }
            }
        }
        for (const t of model.triangles) {
            for (const v of [t.p1, t.p2, t.p3]) {
                const r =
                    (v.x - cx) * (v.x - cx) + (v.y - cy) * (v.y - cy) + (v.z - cz) * (v.z - cz);
                if (r > radius) {
                    radius = r;
                }
            }
        }
        for (const q of model.quads) {
            for (const v of [q.p1, q.p2, q.p3, q.p4]) {
                const r =
                    (v.x - cx) * (v.x - cx) + (v.y - cy) * (v.y - cy) + (v.z - cz) * (v.z - cz);
                if (r > radius) {
                    radius = r;
                }
            }
        }

        for (const submodel of model.subparts) {
            if (submodel.model) {
                const bbox = this.computeBoundingBox(submodel.model);
                if (!bbox) {
                    continue;
                }
                const vertices: Vertex[] = [
                    { x: bbox.min.x, y: bbox.min.y, z: bbox.min.z },
                    { x: bbox.max.x, y: bbox.min.y, z: bbox.min.z },
                    { x: bbox.max.x, y: bbox.max.y, z: bbox.min.z },
                    { x: bbox.min.x, y: bbox.max.y, z: bbox.min.z },
                    { x: bbox.min.x, y: bbox.min.y, z: bbox.max.z },
                    { x: bbox.max.x, y: bbox.min.y, z: bbox.max.z },
                    { x: bbox.max.x, y: bbox.max.y, z: bbox.max.z },
                    { x: bbox.min.x, y: bbox.max.y, z: bbox.max.z }
                ];
                for (const b of vertices) {
                    const v4 = m4.transformVector(submodel.matrix, [b.x, b.y, b.z, 1]);
                    const v = { x: v4[0], y: v4[1], z: v4[2] };
                    if (!minx || v.x < minx) {
                        minx = v.x;
                    }
                    if (!maxx || v.x > maxx) {
                        maxx = v.x;
                    }
                    if (!miny || v.y < miny) {
                        miny = v.y;
                    }
                    if (!maxy || v.y > maxy) {
                        maxy = v.y;
                    }
                    if (!minz || v.z < minz) {
                        minz = v.z;
                    }
                    if (!maxz || v.z > maxz) {
                        maxz = v.z;
                    }
                }
            }
        }

        if (
            minx === undefined ||
            miny === undefined ||
            minz === undefined ||
            maxx === undefined ||
            maxy === undefined ||
            maxz === undefined
        ) {
            return undefined;
        }
        return {
            min: { x: minx, y: miny, z: minz },
            max: { x: maxx, y: maxy, z: maxz },
            radius: radius
        };
    }

    compileQuads(quads: Quad[]) {
        for (const q of quads) {
            const colour = this.getColour(q.colour, false);
            this.compileColours.push(colour.r);
            this.compileColours.push(colour.g);
            this.compileColours.push(colour.b);
            this.compileColours.push(colour.a);
            this.compileColours.push(colour.r);
            this.compileColours.push(colour.g);
            this.compileColours.push(colour.b);
            this.compileColours.push(colour.a);
            this.compileColours.push(colour.r);
            this.compileColours.push(colour.g);
            this.compileColours.push(colour.b);
            this.compileColours.push(colour.a);
            let v = m4.transformVector(this.compileMatrix, [q.p1.x, q.p1.y, q.p1.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [q.p2.x, q.p2.y, q.p2.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [q.p4.x, q.p4.y, q.p4.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            this.compiledTriangles++;

            this.compileColours.push(colour.r);
            this.compileColours.push(colour.g);
            this.compileColours.push(colour.b);
            this.compileColours.push(colour.a);
            this.compileColours.push(colour.r);
            this.compileColours.push(colour.g);
            this.compileColours.push(colour.b);
            this.compileColours.push(colour.a);
            this.compileColours.push(colour.r);
            this.compileColours.push(colour.g);
            this.compileColours.push(colour.b);
            this.compileColours.push(colour.a);
            v = m4.transformVector(this.compileMatrix, [q.p4.x, q.p4.y, q.p4.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [q.p2.x, q.p2.y, q.p2.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [q.p3.x, q.p3.y, q.p3.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            this.compiledTriangles++;
        }
    }

    compileTriangles(triangles: Triangle[]) {
        for (const t of triangles) {
            const colour = this.getColour(t.colour, false);
            this.compileColours.push(colour.r);
            this.compileColours.push(colour.g);
            this.compileColours.push(colour.b);
            this.compileColours.push(colour.a);
            this.compileColours.push(colour.r);
            this.compileColours.push(colour.g);
            this.compileColours.push(colour.b);
            this.compileColours.push(colour.a);
            this.compileColours.push(colour.r);
            this.compileColours.push(colour.g);
            this.compileColours.push(colour.b);
            this.compileColours.push(colour.a);
            let v = m4.transformVector(this.compileMatrix, [t.p1.x, t.p1.y, t.p1.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [t.p2.x, t.p2.y, t.p2.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [t.p3.x, t.p3.y, t.p3.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            this.compiledTriangles++;
        }
    }

    compileLines(lines: Line[], overrideColour: Colour | undefined) {
        for (const l of lines) {
            const colour = overrideColour ?? this.getColour(l.colour, true);
            this.compileColours.push(colour.r);
            this.compileColours.push(colour.g);
            this.compileColours.push(colour.b);
            this.compileColours.push(colour.a);
            this.compileColours.push(colour.r);
            this.compileColours.push(colour.g);
            this.compileColours.push(colour.b);
            this.compileColours.push(colour.a);
            let v = m4.transformVector(this.compileMatrix, [l.p1.x, l.p1.y, l.p1.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [l.p2.x, l.p2.y, l.p2.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            this.compiledLines++;
        }
    }

    compileSubModelQuads(model: Model, maxDepth: number, selected: number[] | undefined) {
        if (maxDepth <= 0) {
            // Only one subpart need do this.
            // We get triangles to do this
            return;
        }
        if (!selected) {
            this.compileQuads(model.quads);
        }
        const oldParent = this.parentColour;
        for (const subpart of model.subparts) {
            this.parentColour = this.getParentColour(subpart.colour);
            if (subpart.model) {
                const oldMatrix = this.compileMatrix;
                this.compileMatrix = m4.multiply(this.compileMatrix, subpart.matrix);
                if (selected) {
                    if (selected.find((id) => subpart.id == id)) {
                        this.compileSubModelQuads(subpart.model, maxDepth - 1, undefined);
                    } else {
                        this.compileSubModelQuads(subpart.model, maxDepth - 1, selected);
                    }
                } else {
                    this.compileSubModelQuads(subpart.model, maxDepth - 1, selected);
                }
                this.compileMatrix = oldMatrix;
            }
            this.parentColour = oldParent;
        }
    }

    compileBQuad(v1: m4.Vector4, v2: m4.Vector4, v3: m4.Vector4, v4: m4.Vector4) {
        this.compileVertices.push(v1[0]);
        this.compileVertices.push(v1[1]);
        this.compileVertices.push(v1[2]);
        this.compileVertices.push(v1[3]);
        this.compileVertices.push(v2[0]);
        this.compileVertices.push(v2[1]);
        this.compileVertices.push(v2[2]);
        this.compileVertices.push(v2[3]);
        this.compileVertices.push(v4[0]);
        this.compileVertices.push(v4[1]);
        this.compileVertices.push(v4[2]);
        this.compileVertices.push(v4[3]);
        this.compileVertices.push(v4[0]);
        this.compileVertices.push(v4[1]);
        this.compileVertices.push(v4[2]);
        this.compileVertices.push(v4[3]);
        this.compileVertices.push(v2[0]);
        this.compileVertices.push(v2[1]);
        this.compileVertices.push(v2[2]);
        this.compileVertices.push(v2[3]);
        this.compileVertices.push(v3[0]);
        this.compileVertices.push(v3[1]);
        this.compileVertices.push(v3[2]);
        this.compileVertices.push(v3[3]);
    }

    compileSubModelTriangles(model: Model, maxDepth: number, selected: number[] | undefined) {
        if (maxDepth <= 0) {
            const bbox = this.computeBoundingBox(model);
            if (!bbox) {
                return;
            }
            for (let i = 0; i < 36; i++) {
                this.compileColours.push(this.parentColour.surface.r);
                this.compileColours.push(this.parentColour.surface.g);
                this.compileColours.push(this.parentColour.surface.b);
                this.compileColours.push(this.parentColour.surface.a);
            }
            let v1 = m4.transformVector(this.compileMatrix, [
                bbox.min.x,
                bbox.min.y,
                bbox.min.z,
                1
            ]);
            let v2 = m4.transformVector(this.compileMatrix, [
                bbox.max.x,
                bbox.min.y,
                bbox.min.z,
                1
            ]);
            let v3 = m4.transformVector(this.compileMatrix, [
                bbox.max.x,
                bbox.max.y,
                bbox.min.z,
                1
            ]);
            let v4 = m4.transformVector(this.compileMatrix, [
                bbox.min.x,
                bbox.max.y,
                bbox.min.z,
                1
            ]);
            this.compileBQuad(v1, v2, v3, v4);
            v1 = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.min.y, bbox.max.z, 1]);
            v2 = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.min.y, bbox.max.z, 1]);
            v3 = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.max.y, bbox.max.z, 1]);
            v4 = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.max.y, bbox.max.z, 1]);
            this.compileBQuad(v1, v2, v3, v4);
            v1 = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.min.y, bbox.min.z, 1]);
            v2 = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.min.y, bbox.min.z, 1]);
            v3 = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.min.y, bbox.max.z, 1]);
            v4 = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.min.y, bbox.max.z, 1]);
            this.compileBQuad(v1, v2, v3, v4);
            v1 = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.max.y, bbox.min.z, 1]);
            v2 = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.max.y, bbox.min.z, 1]);
            v3 = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.max.y, bbox.max.z, 1]);
            v4 = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.max.y, bbox.max.z, 1]);
            this.compileBQuad(v1, v2, v3, v4);
            v1 = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.min.y, bbox.min.z, 1]);
            v2 = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.max.y, bbox.min.z, 1]);
            v3 = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.max.y, bbox.max.z, 1]);
            v4 = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.min.y, bbox.max.z, 1]);
            this.compileBQuad(v1, v2, v3, v4);
            v1 = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.min.y, bbox.min.z, 1]);
            v2 = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.max.y, bbox.min.z, 1]);
            v3 = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.max.y, bbox.max.z, 1]);
            v4 = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.min.y, bbox.max.z, 1]);
            this.compileBQuad(v1, v2, v3, v4);
            this.compiledTriangles += 12;
            return;
        }
        if (!selected) {
            this.compileTriangles(model.triangles);
        }
        const oldParent = this.parentColour;
        for (const subpart of model.subparts) {
            this.parentColour = this.getParentColour(subpart.colour);
            if (subpart.model) {
                const oldMatrix = this.compileMatrix;
                this.compileMatrix = m4.multiply(this.compileMatrix, subpart.matrix);
                if (selected) {
                    if (selected.find((id) => subpart.id == id)) {
                        this.compileSubModelTriangles(subpart.model, maxDepth - 1, undefined);
                    } else {
                        this.compileSubModelTriangles(subpart.model, maxDepth - 1, selected);
                    }
                } else {
                    this.compileSubModelTriangles(subpart.model, maxDepth - 1, selected);
                }
                this.compileMatrix = oldMatrix;
            }
            this.parentColour = oldParent;
        }
    }

    compileSubModelLines(model: Model, maxDepth: number, selected: number[] | undefined) {
        if (maxDepth <= 0) {
            const bbox = this.computeBoundingBox(model);
            if (!bbox) {
                return;
            }
            for (let i = 0; i < 24; i++) {
                this.compileColours.push(this.parentColour.edge.r);
                this.compileColours.push(this.parentColour.edge.g);
                this.compileColours.push(this.parentColour.edge.b);
                this.compileColours.push(this.parentColour.edge.a);
            }
            let v = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.min.y, bbox.min.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.min.y, bbox.min.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.max.y, bbox.min.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.max.y, bbox.min.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.min.y, bbox.max.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.min.y, bbox.max.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.max.y, bbox.max.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.max.y, bbox.max.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.min.y, bbox.min.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.min.y, bbox.max.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.max.y, bbox.min.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.max.y, bbox.max.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.min.y, bbox.min.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.min.y, bbox.max.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.max.y, bbox.min.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.max.y, bbox.max.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.min.y, bbox.min.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.max.y, bbox.min.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.min.y, bbox.min.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.max.y, bbox.min.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.min.y, bbox.max.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.min.x, bbox.max.y, bbox.max.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.min.y, bbox.max.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            v = m4.transformVector(this.compileMatrix, [bbox.max.x, bbox.max.y, bbox.max.z, 1]);
            this.compileVertices.push(v[0]);
            this.compileVertices.push(v[1]);
            this.compileVertices.push(v[2]);
            this.compileVertices.push(v[3]);
            this.compiledLines += 12;
            return;
        }
        if (selected) {
            this.compileLines(model.lines, { r: 0.5, g: 0.5, b: 0.5, a: 1.0 });
        } else {
            this.compileLines(model.lines, undefined);
        }
        const oldParent = this.parentColour;
        for (const subpart of model.subparts) {
            this.parentColour = this.getParentColour(subpart.colour);
            if (subpart.model) {
                const oldMatrix = this.compileMatrix;
                this.compileMatrix = m4.multiply(this.compileMatrix, subpart.matrix);
                if (selected) {
                    if (selected.find((id) => subpart.id == id)) {
                        this.compileSubModelLines(subpart.model, maxDepth - 1, undefined);
                    } else {
                        this.compileSubModelLines(subpart.model, maxDepth - 1, selected);
                    }
                } else {
                    this.compileSubModelLines(subpart.model, maxDepth - 1, selected);
                }
                this.compileMatrix = oldMatrix;
            }
            this.parentColour = oldParent;
        }
    }

    compileModel(model: Model, options?: CompileOptions): CompiledModel {
        const recenter = options?.recenter ?? true;
        const rescale = options?.rescale ?? true;
        const maxDepth = options?.maxDepth ?? 1000;
        const wireframe = options?.wireframe ?? false;
        const selected = options?.select;
        let roffset: Vertex = { x: 0, y: 0, z: 0 };
        this.compiledLines = 0;
        this.compiledTriangles = 0;
        this.compileColours = [];
        this.compileVertices = [];

        // LDRAW axes don't match GL axes.
        // Rotate by PI to get them the same
        this.compileMatrix = m4.xRotation(Math.PI);
        // Make all units in mm
        this.compileMatrix = m4.multiply(this.compileMatrix, m4.scaling(0.4, 0.4, 0.4));
        this.compileSubModelLines(model, maxDepth, selected);

        const triangleOffset = this.compileVertices.length;
        this.compileMatrix = m4.xRotation(Math.PI);
        this.compileMatrix = m4.multiply(this.compileMatrix, m4.scaling(0.4, 0.4, 0.4));
        if (!wireframe) {
            this.compileSubModelTriangles(model, maxDepth, selected);
        }

        this.compileMatrix = m4.xRotation(Math.PI);
        this.compileMatrix = m4.multiply(this.compileMatrix, m4.scaling(0.4, 0.4, 0.4));
        if (!wireframe) {
            this.compileSubModelQuads(model, maxDepth, selected);
        }

        if ((recenter || rescale) && this.compileVertices.length > 0) {
            let minx = this.compileVertices[0];
            let maxx = this.compileVertices[0];
            let miny = this.compileVertices[1];
            let maxy = this.compileVertices[1];
            let minz = this.compileVertices[2];
            let maxz = this.compileVertices[2];
            for (let i = 0; i < this.compileVertices.length; i += 4) {
                const x = this.compileVertices[i + 0];
                const y = this.compileVertices[i + 1];
                const z = this.compileVertices[i + 2];
                if (x < minx) minx = x;
                if (y < miny) miny = y;
                if (z < minz) minz = z;
                if (x > maxx) maxx = x;
                if (y > maxy) maxy = y;
                if (z > maxz) maxz = z;
            }

            if (recenter || rescale) {
                const midx = (minx + maxx) / 2.0;
                const midy = (miny + maxy) / 2.0;
                const midz = (minz + maxz) / 2.0;
                for (let i = 0; i < this.compileVertices.length; i += 4) {
                    this.compileVertices[i + 0] -= midx;
                    this.compileVertices[i + 1] -= midy;
                    this.compileVertices[i + 2] -= midz;
                }
                minx -= midx;
                miny -= midy;
                minz -= midz;
                maxx -= midx;
                maxy -= midy;
                maxz -= midz;
                roffset = { x: -midx, y: -midy, z: -midz };
            }
            if (rescale) {
                let maxsize = maxx - minx;
                if (maxy - miny > maxsize) {
                    maxsize = maxy - miny;
                }
                if (maxz - minz > maxsize) {
                    maxsize = maxz - minz;
                }
                for (let i = 0; i < this.compileVertices.length; i += 4) {
                    this.compileVertices[i + 0] /= maxsize * 0.004;
                    this.compileVertices[i + 1] /= maxsize * 0.004;
                    this.compileVertices[i + 2] /= maxsize * 0.004;
                }
            }
        }

        // compute a bounding box
        let minx = this.compileVertices[0];
        let maxx = this.compileVertices[0];
        let miny = this.compileVertices[1];
        let maxy = this.compileVertices[1];
        let minz = this.compileVertices[2];
        let maxz = this.compileVertices[2];
        for (let i = 0; i < this.compileVertices.length; i += 4) {
            const x = this.compileVertices[i + 0];
            const y = this.compileVertices[i + 1];
            const z = this.compileVertices[i + 2];
            if (x < minx) minx = x;
            if (y < miny) miny = y;
            if (z < minz) minz = z;
            if (x > maxx) maxx = x;
            if (y > maxy) maxy = y;
            if (z > maxz) maxz = z;
        }

        const cx = 0.5 * (minx + maxx);
        const cy = 0.5 * (miny + maxy);
        const cz = 0.5 * (minz + maxz);
        let radius = 0;
        for (let i = 0; i < this.compileVertices.length; i += 4) {
            const x = this.compileVertices[i + 0];
            const y = this.compileVertices[i + 1];
            const z = this.compileVertices[i + 2];
            const r = (x - cx) * (x - cx) + (y - cy) * (y - cy) + (z - cz) * (z - cz);
            if (r > radius) {
                radius = r;
            }
        }

        const compiledModel = {
            id: nextCompiledId,
            vertexBuffer: null,
            colourBuffer: null,
            vertices: new Float32Array(this.compileVertices),
            colours: new Float32Array(this.compileColours),
            lineOffset: 0,
            lines: this.compiledLines,
            triangleOffset: triangleOffset / 4,
            triangles: this.compiledTriangles,
            bbox: {
                min: { x: minx, y: miny, z: minz },
                max: { x: maxx, y: maxy, z: maxz },
                radius: radius
            },
            recenter: roffset
        };
        nextCompiledId = nextCompiledId + 1;
        this.compileMatrix = m4.identity();
        this.compileColours = [];
        this.compileVertices = [];
        return compiledModel;
    }
}

export interface ModelBuffer {
    vertexBuffer: WebGLBuffer | null;
    colourBuffer: WebGLBuffer | null;
}

export class WebGL extends WebGLCompiler {
    modelBuffers: Map<number, ModelBuffer>;
    gl: WebGLRenderingContext;
    canvas: HTMLCanvasElement;
    pipeline: PipeLine | undefined;
    brickPipeline: PipeLine | undefined;
    mapPipeline: PipeLine | undefined;
    projectionMatrix: m4.Matrix4;
    modelMatrix: m4.Matrix4;
    matrixStack: m4.Matrix4[];
    vertexBuffer: WebGLBuffer | null;
    colourBuffer: WebGLBuffer | null;
    texcoordBuffer: WebGLBuffer | null;
    brightness: number;
    perspectiveAngle: number;
    mindist: number;
    maxdist: number;
    fragmentDerivative: boolean;

    static create(canvas: HTMLCanvasElement): WebGL | undefined {
        const gl = canvas.getContext('webgl');
        if (!gl) {
            console.log('No WebGL available');
            return undefined;
        }
        return new WebGL(canvas, gl);
    }

    constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
        super();
        this.canvas = canvas;
        this.gl = gl;
        this.matrixStack = [];
        this.modelMatrix = m4.identity();
        this.projectionMatrix = m4.identity();
        this.vertexBuffer = null;
        this.colourBuffer = null;
        this.texcoordBuffer = null;
        this.brightness = 1.0;
        this.perspectiveAngle = 45;
        this.mindist = 0.1;
        this.maxdist = 1000.0;
        this.setupPipeline();
        this.fragmentDerivative = false;
        this.modelBuffers = new Map<number, ModelBuffer>();
    }

    setPerspective(fieldOfViewDegrees: number, aspect: number, near: number, far: number) {
        this.projectionMatrix = m4.perspective(
            (fieldOfViewDegrees * Math.PI) / 180.0,
            aspect,
            near,
            far
        );
        if (this.brickPipeline?.projectionMatrixUniform) {
            this.gl.uniformMatrix4fv(
                this.brickPipeline.projectionMatrixUniform,
                false,
                this.projectionMatrix
            );
        }
        if (this.brickPipeline?.nearUniform) {
            this.gl.uniform1f(this.brickPipeline.nearUniform, near);
        }
        if (this.brickPipeline?.farUniform) {
            this.gl.uniform1f(this.brickPipeline.farUniform, far);
        }
    }

    setFrustum(
        left: number,
        right: number,
        bottom: number,
        top: number,
        near: number,
        far: number
    ) {
        this.projectionMatrix = m4.frustum(left, right, bottom, top, near, far);
        if (this.brickPipeline?.projectionMatrixUniform) {
            this.gl.uniformMatrix4fv(
                this.brickPipeline.projectionMatrixUniform,
                false,
                this.projectionMatrix
            );
        }
        if (this.brickPipeline?.nearUniform) {
            this.gl.uniform1f(this.brickPipeline.nearUniform, near);
        }
        if (this.brickPipeline?.farUniform) {
            this.gl.uniform1f(this.brickPipeline.farUniform, far);
        }
    }

    setOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        this.projectionMatrix = m4.orthographic(left, right, bottom, top, near, far);
        if (this.brickPipeline?.projectionMatrixUniform) {
            this.gl.uniformMatrix4fv(
                this.brickPipeline.projectionMatrixUniform,
                false,
                this.projectionMatrix
            );
        }
        if (this.brickPipeline?.nearUniform) {
            this.gl.uniform1f(this.brickPipeline.nearUniform, near);
        }
        if (this.brickPipeline?.farUniform) {
            this.gl.uniform1f(this.brickPipeline.farUniform, far);
        }
    }

    setProjectionIdentity() {
        this.projectionMatrix = m4.identity();
        if (this.brickPipeline?.projectionMatrixUniform) {
            this.gl.uniformMatrix4fv(
                this.brickPipeline.projectionMatrixUniform,
                false,
                this.projectionMatrix
            );
        }
    }

    setModelIdentity() {
        this.modelMatrix = m4.identity();
        if (this.brickPipeline?.modelMatrixUniform) {
            this.gl.uniformMatrix4fv(
                this.brickPipeline.modelMatrixUniform,
                false,
                this.modelMatrix
            );
        }
    }

    pushMatrix() {
        this.matrixStack.push(m4.copy(this.modelMatrix));
    }

    popMatrix() {
        this.modelMatrix = this.matrixStack.pop()!;
        if (this.brickPipeline?.modelMatrixUniform) {
            this.gl.uniformMatrix4fv(
                this.brickPipeline.modelMatrixUniform,
                false,
                this.modelMatrix
            );
        }
    }

    translate(x: number, y: number, z: number) {
        this.modelMatrix = m4.translate(this.modelMatrix, x, y, z);
        if (this.brickPipeline?.modelMatrixUniform) {
            this.gl.uniformMatrix4fv(
                this.brickPipeline.modelMatrixUniform,
                false,
                this.modelMatrix
            );
        }
    }

    rotate(angle: number, x: number, y: number, z: number) {
        const radians = (angle * Math.PI) / 180.0;
        this.modelMatrix = m4.axisRotate(this.modelMatrix, [x, y, z], radians);
        if (this.brickPipeline?.modelMatrixUniform) {
            this.gl.uniformMatrix4fv(
                this.brickPipeline.modelMatrixUniform,
                false,
                this.modelMatrix
            );
        }
    }

    scale(s: number) {
        // The inverse is incorrect for non-unifor scaling
        this.modelMatrix = m4.scale(this.modelMatrix, s, s, s);
        if (this.brickPipeline?.modelMatrixUniform) {
            this.gl.uniformMatrix4fv(
                this.brickPipeline.modelMatrixUniform,
                false,
                this.modelMatrix
            );
        }
    }

    multMatrix(m: m4.Matrix4) {
        this.modelMatrix = m4.multiply(this.modelMatrix, m);
        if (this.brickPipeline?.modelMatrixUniform) {
            this.gl.uniformMatrix4fv(
                this.brickPipeline.modelMatrixUniform,
                false,
                this.modelMatrix
            );
        }
    }

    clearColour(r: number, g: number, b: number) {
        this.gl.clearColor(r, g, b, 1.0);
    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    flush() {
        this.gl.flush();
    }

    finish() {
        this.gl.finish();
    }

    setBrightness(brightness: number) {
        if (brightness < 0.0) {
            brightness = 0.0;
        }
        if (brightness > 1.0) {
            brightness = 1.0;
        }
        this.brightness = brightness;
    }

    drawBox(width: number, height: number, depth: number) {
        if (!this.vertexBuffer) {
            return;
        }
        if (!this.colourBuffer) {
            return;
        }
        if (!this.brickPipeline) {
            return;
        }
        const vertices: number[] = [];
        const colours: number[] = [];
        const w = width / 2;
        const d = depth / 2;
        const h = height;
        let colour: Colour = { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(0);
        vertices.push(d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(0);
        vertices.push(d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(h);
        vertices.push(d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(h);
        vertices.push(d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(0);
        vertices.push(d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(h);
        vertices.push(d);
        vertices.push(1.0);

        colour = { r: 1.0, g: 0.0, b: 0.0, a: 1.0 };
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(0);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(0);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(h);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(h);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(0);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(h);
        vertices.push(-d);
        vertices.push(1.0);

        colour = { r: 0.0, g: 1.0, b: 0.0, a: 1.0 };
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(0);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(0);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(0);
        vertices.push(d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(0);
        vertices.push(d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(0);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(0);
        vertices.push(d);
        vertices.push(1.0);

        colour = { r: 0.0, g: 1.0, b: 0.0, a: 1.0 };
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(h);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(h);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(h);
        vertices.push(d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(h);
        vertices.push(d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(h);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(h);
        vertices.push(d);
        vertices.push(1.0);

        colour = { r: 0.0, g: 0.0, b: 1.0, a: 1.0 };
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(0);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(h);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(0);
        vertices.push(d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(0);
        vertices.push(d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(h);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(w);
        vertices.push(h);
        vertices.push(d);
        vertices.push(1.0);

        colour = { r: 0.0, g: 0.0, b: 1.0, a: 1.0 };
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(0);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(h);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(0);
        vertices.push(d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(0);
        vertices.push(d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(h);
        vertices.push(-d);
        vertices.push(1.0);
        colours.push(colour.r);
        colours.push(colour.g);
        colours.push(colour.b);
        colours.push(colour.a);
        vertices.push(-w);
        vertices.push(h);
        vertices.push(d);
        vertices.push(1.0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.uniform1f(this.brickPipeline.brightnessUniform, this.brightness);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            this.brickPipeline.vertexAttribute,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colours), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            this.brickPipeline.colourAttribute,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 36);
    }

    drawTriangles(triangles: Triangle[]) {
        if (!this.vertexBuffer) {
            return;
        }
        if (!this.colourBuffer) {
            return;
        }
        if (!this.brickPipeline) {
            return;
        }
        const vertices: number[] = [];
        const colours: number[] = [];
        for (const t of triangles) {
            const colour = this.getColour(t.colour, false);
            colours.push(colour.r);
            colours.push(colour.g);
            colours.push(colour.b);
            colours.push(colour.a);
            vertices.push(t.p1.x);
            vertices.push(t.p1.y);
            vertices.push(t.p1.z);
            vertices.push(1.0);
            colours.push(colour.r);
            colours.push(colour.g);
            colours.push(colour.b);
            colours.push(colour.a);
            vertices.push(t.p2.x);
            vertices.push(t.p2.y);
            vertices.push(t.p2.z);
            vertices.push(1.0);
            colours.push(colour.r);
            colours.push(colour.g);
            colours.push(colour.b);
            colours.push(colour.a);
            vertices.push(t.p3.x);
            vertices.push(t.p3.y);
            vertices.push(t.p3.z);
            vertices.push(1.0);
        }
        this.gl.uniform1f(this.brickPipeline.brightnessUniform, this.brightness);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            this.brickPipeline.vertexAttribute,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colours), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            this.brickPipeline.colourAttribute,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.drawArrays(this.gl.TRIANGLES, 0, triangles.length * 3);
    }

    drawLines(lines: Line[]) {
        if (!this.vertexBuffer) {
            return;
        }
        if (!this.colourBuffer) {
            return;
        }
        if (!this.brickPipeline) {
            return;
        }
        const vertices: number[] = [];
        const colours: number[] = [];
        for (const l of lines) {
            const colour = this.getColour(l.colour, true);
            colours.push(colour.r);
            colours.push(colour.g);
            colours.push(colour.b);
            colours.push(colour.a);
            vertices.push(l.p1.x);
            vertices.push(l.p1.y);
            vertices.push(l.p1.z);
            vertices.push(1.0);
            colours.push(colour.r);
            colours.push(colour.g);
            colours.push(colour.b);
            colours.push(colour.a);
            vertices.push(l.p2.x);
            vertices.push(l.p2.y);
            vertices.push(l.p2.z);
            vertices.push(1.0);
        }
        this.gl.uniform1f(this.brickPipeline.brightnessUniform, this.brightness);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            this.brickPipeline.vertexAttribute,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colours), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            this.brickPipeline.colourAttribute,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.drawArrays(this.gl.LINES, 0, lines.length * 2);
    }

    drawQuads(quads: Quad[]) {
        if (!this.vertexBuffer) {
            return;
        }
        if (!this.colourBuffer) {
            return;
        }
        if (!this.brickPipeline) {
            return;
        }
        const vertices: number[] = [];
        const colours: number[] = [];
        for (const q of quads) {
            const colour = this.getColour(q.colour, false);
            colours.push(colour.r);
            colours.push(colour.g);
            colours.push(colour.b);
            colours.push(colour.a);
            vertices.push(q.p1.x);
            vertices.push(q.p1.y);
            vertices.push(q.p1.z);
            vertices.push(1.0);
            colours.push(colour.r);
            colours.push(colour.g);
            colours.push(colour.b);
            colours.push(colour.a);
            vertices.push(q.p2.x);
            vertices.push(q.p2.y);
            vertices.push(q.p2.z);
            vertices.push(1.0);
            colours.push(colour.r);
            colours.push(colour.g);
            colours.push(colour.b);
            colours.push(colour.a);
            vertices.push(q.p4.x);
            vertices.push(q.p4.y);
            vertices.push(q.p4.z);
            vertices.push(1.0);
            colours.push(colour.r);
            colours.push(colour.g);
            colours.push(colour.b);
            colours.push(colour.a);
            vertices.push(q.p4.x);
            vertices.push(q.p4.y);
            vertices.push(q.p4.z);
            vertices.push(1.0);
            colours.push(colour.r);
            colours.push(colour.g);
            colours.push(colour.b);
            colours.push(colour.a);
            vertices.push(q.p2.x);
            vertices.push(q.p2.y);
            vertices.push(q.p2.z);
            vertices.push(1.0);
            colours.push(colour.r);
            colours.push(colour.g);
            colours.push(colour.b);
            colours.push(colour.a);
            vertices.push(q.p3.x);
            vertices.push(q.p3.y);
            vertices.push(q.p3.z);
            vertices.push(1.0);
        }
        this.gl.uniform1f(this.brickPipeline.brightnessUniform, this.brightness);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            this.brickPipeline.vertexAttribute,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colours), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            this.brickPipeline.colourAttribute,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.drawArrays(this.gl.TRIANGLES, 0, quads.length * 6);
    }

    drawModel(model: Model) {
        if (!this.brickPipeline) {
            return;
        }
        this.gl.useProgram(this.brickPipeline.program);
        this.drawLines(model.lines);
        this.drawTriangles(model.triangles);
        this.drawQuads(model.quads);
        const oldParent = this.parentColour;
        for (const subpart of model.subparts) {
            this.parentColour = this.getParentColour(subpart.colour);
            if (subpart.model) {
                this.pushMatrix();
                this.multMatrix(subpart.matrix);
                this.drawModel(subpart.model);
                this.popMatrix();
            }
            this.parentColour = oldParent;
        }
    }

    drawCompiled(model: CompiledModel) {
        if (!this.brickPipeline) {
            return;
        }
        if (model.lines + model.triangles == 0) {
            return;
        }

        let buffers = this.modelBuffers.get(model.id);
        if (!buffers) {
            const vertexBuffer = this.gl.createBuffer();
            if (!vertexBuffer) {
                return;
            }
            const colourBuffer = this.gl.createBuffer();
            if (!colourBuffer) {
                return;
            }
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, model.vertices, this.gl.STATIC_DRAW);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colourBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, model.colours, this.gl.STATIC_DRAW);
            buffers = {
                vertexBuffer: vertexBuffer,
                colourBuffer: colourBuffer
            };
            this.modelBuffers.set(model.id, buffers);
        }

        this.gl.useProgram(this.brickPipeline.program);
        this.gl.uniform1f(this.brickPipeline.brightnessUniform, this.brightness);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.vertexBuffer);
        this.gl.vertexAttribPointer(
            this.brickPipeline.vertexAttribute,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.colourBuffer);
        this.gl.vertexAttribPointer(
            this.brickPipeline.colourAttribute,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.drawArrays(this.gl.LINES, model.lineOffset, model.lines * 2);
        this.gl.drawArrays(this.gl.TRIANGLES, model.triangleOffset, model.triangles * 3);
    }

    drawDepthQuad(texture: MapTexture) {
        if (!this.vertexBuffer) {
            return;
        }
        if (!this.texcoordBuffer) {
            return;
        }
        if (!this.brickPipeline) {
            return;
        }
        const w = texture.width / 2;
        const h = texture.height / 2;
        this.gl.useProgram(this.brickPipeline.program);
        this.gl.uniform1f(this.brickPipeline.brightnessUniform, this.brightness);
        if (this.brickPipeline.modelMatrixUniform) {
            this.gl.uniformMatrix4fv(
                this.brickPipeline.modelMatrixUniform,
                false,
                this.modelMatrix
            );
        }
        if (this.brickPipeline.projectionMatrixUniform) {
            this.gl.uniformMatrix4fv(
                this.brickPipeline.projectionMatrixUniform,
                false,
                this.projectionMatrix
            );
        }
        const vertices: number[] = [];
        vertices.push(-w);
        vertices.push(0.0);
        vertices.push(h);
        vertices.push(1.0);
        vertices.push(w);
        vertices.push(0.0);
        vertices.push(h);
        vertices.push(1.0);
        vertices.push(-w);
        vertices.push(0.0);
        vertices.push(-h);
        vertices.push(1.0);

        vertices.push(-w);
        vertices.push(0.0);
        vertices.push(-h);
        vertices.push(1.0);
        vertices.push(w);
        vertices.push(0.0);
        vertices.push(h);
        vertices.push(1.0);
        vertices.push(w);
        vertices.push(0.0);
        vertices.push(-h);
        vertices.push(1.0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            this.brickPipeline.vertexAttribute,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 2 * 3);
        if (this.brickPipeline) {
            this.gl.useProgram(this.brickPipeline.program);
        }
    }

    drawTexturedQuad(texture: MapTexture) {
        if (!this.vertexBuffer) {
            return;
        }
        if (!this.texcoordBuffer) {
            return;
        }
        if (!this.mapPipeline) {
            return;
        }
        const w = texture.width / 2;
        const h = texture.height / 2;
        this.gl.useProgram(this.mapPipeline.program);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture.texture);
        this.gl.uniform1i(this.mapPipeline.samplerUniform, 0);
        this.gl.uniform1f(this.mapPipeline.brightnessUniform, this.brightness);
        if (this.mapPipeline.modelMatrixUniform) {
            this.gl.uniformMatrix4fv(this.mapPipeline.modelMatrixUniform, false, this.modelMatrix);
        }
        if (this.mapPipeline.projectionMatrixUniform) {
            this.gl.uniformMatrix4fv(
                this.mapPipeline.projectionMatrixUniform,
                false,
                this.projectionMatrix
            );
        }
        const vertices: number[] = [];
        const texcoords: number[] = [];
        vertices.push(-w);
        vertices.push(0.0);
        vertices.push(h);
        vertices.push(1.0);
        texcoords.push(0.0);
        texcoords.push(0.0);
        vertices.push(w);
        vertices.push(0.0);
        vertices.push(h);
        vertices.push(1.0);
        texcoords.push(1.0);
        texcoords.push(0.0);
        vertices.push(-w);
        vertices.push(0.0);
        vertices.push(-h);
        vertices.push(1.0);
        texcoords.push(0.0);
        texcoords.push(1.0);

        vertices.push(-w);
        vertices.push(0.0);
        vertices.push(-h);
        vertices.push(1.0);
        texcoords.push(0.0);
        texcoords.push(1.0);
        vertices.push(w);
        vertices.push(0.0);
        vertices.push(h);
        vertices.push(1.0);
        texcoords.push(1.0);
        texcoords.push(0.0);
        vertices.push(w);
        vertices.push(0.0);
        vertices.push(-h);
        vertices.push(1.0);
        texcoords.push(1.0);
        texcoords.push(1.0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            this.mapPipeline.vertexAttribute,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texcoords), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            this.mapPipeline.texcoordAttribute,
            2,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 2 * 3);
        if (this.brickPipeline) {
            this.gl.useProgram(this.brickPipeline.program);
        }
    }

    resizeToFit() {
        this.resizeCanvasToDisplaySize();
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        const aspect = this.canvas.width / this.canvas.height;
        this.setPerspective(this.perspectiveAngle, aspect, this.mindist, this.maxdist);
    }

    setupPipeline() {
        this.resizeToFit();
        const vertexShaderSource = lego_vertex_shader;
        let fragmentShaderSource = lego_fragment_shader;
        const extensions = this.gl.getSupportedExtensions();
        const hasDerivative =
            extensions != null && extensions.findIndex((x) => x == 'OES_standard_derivatives') >= 0;

        if (hasDerivative) {
            this.gl.getExtension('OES_standard_derivatives');
            fragmentShaderSource = lego_fragment_shader_df;
            this.fragmentDerivative = true;
        }
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (vertexShader && fragmentShader) {
            const legoProgram = this.createProgram(vertexShader, fragmentShader);
            if (legoProgram) {
                this.gl.useProgram(legoProgram);
                const colourAttribute = this.gl.getAttribLocation(legoProgram, 'a_colour');
                const vertexAttribute = this.gl.getAttribLocation(legoProgram, 'a_vertex');
                const brightnessUniform = this.gl.getUniformLocation(legoProgram, 'brightness');
                const modelMatrixUniform = this.gl.getUniformLocation(legoProgram, 'model_matrix');
                const projectionMatrixUniform = this.gl.getUniformLocation(
                    legoProgram,
                    'projection_matrix'
                );
                const nearUniform = this.gl.getUniformLocation(legoProgram, 'near');
                const farUniform = this.gl.getUniformLocation(legoProgram, 'far');
                const renderDepthUniform = this.gl.getUniformLocation(legoProgram, 'renderDepth');
                this.brickPipeline = {
                    program: legoProgram,
                    vertexAttribute: vertexAttribute,
                    colourAttribute: colourAttribute,
                    texcoordAttribute: -1,
                    projectionMatrixUniform: projectionMatrixUniform,
                    modelMatrixUniform: modelMatrixUniform,
                    samplerUniform: null,
                    brightnessUniform: brightnessUniform,
                    nearUniform: nearUniform,
                    farUniform: farUniform,
                    renderDepthUniform: renderDepthUniform
                };
                this.pipeline = this.brickPipeline;
                if (modelMatrixUniform) {
                    this.gl.uniformMatrix4fv(modelMatrixUniform, false, this.modelMatrix);
                }
                if (projectionMatrixUniform) {
                    this.gl.uniformMatrix4fv(projectionMatrixUniform, false, this.projectionMatrix);
                }
                if (brightnessUniform) {
                    this.gl.uniform1f(brightnessUniform, 1.0);
                }
                if (vertexAttribute >= 0) {
                    this.gl.enableVertexAttribArray(vertexAttribute);
                }
                if (colourAttribute >= 0) {
                    this.gl.enableVertexAttribArray(colourAttribute);
                }
            }
        }

        const mapVertexShaderSource = map_vertex_shader;
        const mapFragmentShaderSource = map_fragment_shader;

        const mapVertexShader = this.createShader(this.gl.VERTEX_SHADER, mapVertexShaderSource);
        const mapFragmentShader = this.createShader(
            this.gl.FRAGMENT_SHADER,
            mapFragmentShaderSource
        );
        if (mapVertexShader && mapFragmentShader) {
            const mapProgram = this.createProgram(mapVertexShader, mapFragmentShader);
            if (mapProgram) {
                this.gl.useProgram(mapProgram);
                const texcoordAttribute = this.gl.getAttribLocation(mapProgram, 'a_texture');
                const vertexAttribute = this.gl.getAttribLocation(mapProgram, 'a_vertex');
                const brightnessUniform = this.gl.getUniformLocation(mapProgram, 'brightness');
                const modelMatrixUniform = this.gl.getUniformLocation(mapProgram, 'model_matrix');
                const projectionMatrixUniform = this.gl.getUniformLocation(
                    mapProgram,
                    'projection_matrix'
                );
                const samplerUniform = this.gl.getUniformLocation(mapProgram, 'sampler');
                this.mapPipeline = {
                    program: mapProgram,
                    colourAttribute: -1,
                    vertexAttribute: vertexAttribute,
                    texcoordAttribute: texcoordAttribute,
                    projectionMatrixUniform: projectionMatrixUniform,
                    modelMatrixUniform: modelMatrixUniform,
                    samplerUniform: samplerUniform,
                    brightnessUniform: brightnessUniform,
                    nearUniform: null,
                    farUniform: null,
                    renderDepthUniform: null
                };
                if (modelMatrixUniform) {
                    this.gl.uniformMatrix4fv(modelMatrixUniform, false, this.modelMatrix);
                }
                if (projectionMatrixUniform) {
                    this.gl.uniformMatrix4fv(projectionMatrixUniform, false, this.projectionMatrix);
                }
                if (brightnessUniform) {
                    this.gl.uniform1f(brightnessUniform, 1.0);
                }
                if (vertexAttribute >= 0) {
                    this.gl.enableVertexAttribArray(vertexAttribute);
                }
                if (texcoordAttribute >= 0) {
                    this.gl.enableVertexAttribArray(texcoordAttribute);
                }
            }
        }

        this.vertexBuffer = this.gl.createBuffer();
        this.colourBuffer = this.gl.createBuffer();
        this.texcoordBuffer = this.gl.createBuffer();
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);
        if (this.brickPipeline) {
            this.gl.useProgram(this.brickPipeline.program);
        }
    }

    renderDepth(visible: boolean) {
        if (this.brickPipeline) {
            this.gl.uniform1i(this.brickPipeline.renderDepthUniform, visible ? 1 : 0);
        }
    }

    createShader(type: GLenum, source: string): WebGLShader | undefined {
        const shader = this.gl.createShader(type);
        if (!shader) {
            console.log('Shader create failed');
            return undefined;
        }
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        console.log(this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
        return undefined;
    }

    createProgram(
        vertexShader: WebGLShader,
        fragmentShader: WebGLShader
    ): WebGLProgram | undefined {
        const program = this.gl.createProgram();
        if (!program) {
            console.log('Program create failed');
            return;
        }
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        if (success) {
            return program;
        }

        console.log(this.gl.getProgramInfoLog(program));
        this.gl.deleteProgram(program);
    }

    getPixelRatio() {
        return window.devicePixelRatio || 1;
    }

    resizeCanvasToDisplaySize() {
        // Lookup the size the browser is displaying the canvas in CSS pixels.
        const pixelRatio = this.getPixelRatio();
        const displayWidth = Math.floor(this.canvas.clientWidth * pixelRatio);
        const displayHeight = Math.floor(this.canvas.clientHeight * pixelRatio);

        // Check if the canvas is not the same size.
        const needResize = this.canvas.width != displayWidth || this.canvas.height != displayHeight;

        if (needResize) {
            // Make the canvas the same size
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
        }

        return needResize;
    }

    loadImage(f: Blob) {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            const url = URL.createObjectURL(f);
            image.onload = () => {
                URL.revokeObjectURL(url);
                resolve(image);
            };
            image.onerror = (err) => {
                URL.revokeObjectURL(url);
                reject(err);
            };
            image.src = url;
        });
    }

    async loadTexture(f: Blob): Promise<MapTexture | null> {
        const image = await this.loadImage(f);
        const texture = this.gl.createTexture();

        if (!texture) {
            return null;
        }

        const level = 0;
        const internalFormat = this.gl.RGBA;
        const srcFormat = this.gl.RGBA;
        const srcType = this.gl.UNSIGNED_BYTE;

        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        // WebGL1 has different requirements for power of 2 images
        // vs. non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_WRAP_S,
                this.gl.CLAMP_TO_EDGE
            );
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_WRAP_T,
                this.gl.CLAMP_TO_EDGE
            );
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        }

        return { width: image.naturalWidth, height: image.naturalHeight, texture: texture };
    }

    isPowerOf2(value: number) {
        return (value & (value - 1)) === 0;
    }

    deleteTexture(t: WebGLTexture) {
        this.gl.deleteTexture(t);
    }

    getColourBuffer(): ColourBuffer {
        const pixels = new Uint8Array(this.gl.drawingBufferWidth * this.gl.drawingBufferHeight * 4);
        this.gl.readPixels(
            0,
            0,
            this.gl.drawingBufferWidth,
            this.gl.drawingBufferHeight,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            pixels
        );
        return {
            width: this.gl.drawingBufferWidth,
            height: this.gl.drawingBufferHeight,
            buffer: pixels
        };
    }

    getCanvasWidth() {
        return this.canvas.width;
    }

    getCanvasHeight() {
        return this.canvas.height;
    }

    getCanvasAspect() {
        return this.canvas.width / this.canvas.height;
    }
}
