import { vertex_shader, fragment_shader } from '$lib/ldraw/shaders';
import {
    type Model,
    type Line,
    type Triangle,
    type Quad,
    type Colour,
    type BrickColour
} from '$lib/ldraw/components';

import * as m4 from '$lib/ldraw/m4';

export interface CompiledModel {
    vertices: Float32Array;
    colours: Float32Array;
    lineOffset: number;
    lines: number;
    triangleOffset: number;
    triangles: number;
}

export class WebGL {
    gl: WebGLRenderingContext;
    pipeline: WebGLProgram | undefined;
    canvas: HTMLCanvasElement;
    projectionMatrix: m4.Matrix4;
    modelMatrix: m4.Matrix4;
    matrixStack: m4.Matrix4[];
    vertexAttribute: GLint;
    colourAttribute: GLint;
    projectionMatrixUniform: WebGLUniformLocation | null;
    modelMatrixUniform: WebGLUniformLocation | null;
    vertexBuffer: WebGLBuffer | null;
    colourBuffer: WebGLBuffer | null;
    parentColour: BrickColour;
    compileVertices: number[];
    compileColours: number[];
    compileMatrix: m4.Matrix4;
    compiledLines: number;
    compiledTriangles: number;

    static create(canvas: HTMLCanvasElement): WebGL | undefined {
        const gl = canvas.getContext('webgl');
        if (!gl) {
            console.log('No WebGL available');
            return undefined;
        }
        return new WebGL(canvas, gl);
    }

    constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
        this.canvas = canvas;
        this.gl = gl;
        this.matrixStack = [];
        this.modelMatrix = m4.identity();
        this.projectionMatrix = m4.identity();
        this.vertexAttribute = -1;
        this.colourAttribute = -1;
        this.projectionMatrixUniform = -1;
        this.modelMatrixUniform = -1;
        this.projectionMatrixUniform = null;
        this.modelMatrixUniform = null;
        this.vertexBuffer = null;
        this.colourBuffer = null;
        this.parentColour = {
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
        this.setupPipeline();
    }

    setPerspective(fieldOfViewDegrees: number, aspect: number, near: number, far: number) {
        this.projectionMatrix = m4.perspective(
            (fieldOfViewDegrees * Math.PI) / 180.0,
            aspect,
            near,
            far
        );
        if (this.projectionMatrixUniform) {
            this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, this.projectionMatrix);
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
        if (this.projectionMatrixUniform) {
            this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, this.projectionMatrix);
        }
    }

    setOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        this.projectionMatrix = m4.orthographic(left, right, bottom, top, near, far);
        if (this.projectionMatrixUniform) {
            this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, this.projectionMatrix);
        }
    }

    setProjectionIdentity() {
        this.projectionMatrix = m4.identity();
        if (this.projectionMatrixUniform) {
            this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, this.projectionMatrix);
        }
    }

    setModelIdentity() {
        this.modelMatrix = m4.identity();
        if (this.modelMatrixUniform) {
            this.gl.uniformMatrix4fv(this.modelMatrixUniform, false, this.modelMatrix);
        }
    }

    pushMatrix() {
        this.matrixStack.push(m4.copy(this.modelMatrix));
    }

    popMatrix() {
        this.modelMatrix = this.matrixStack.pop()!;
        if (this.modelMatrixUniform) {
            this.gl.uniformMatrix4fv(this.modelMatrixUniform, false, this.modelMatrix);
        }
    }

    translate(x: number, y: number, z: number) {
        this.modelMatrix = m4.translate(this.modelMatrix, x, y, z);
        if (this.modelMatrixUniform) {
            this.gl.uniformMatrix4fv(this.modelMatrixUniform, false, this.modelMatrix);
        }
    }

    rotate(angle: number, x: number, y: number, z: number) {
        const radians = (angle * Math.PI) / 180.0;
        this.modelMatrix = m4.axisRotate(this.modelMatrix, [x, y, z], radians);
        if (this.modelMatrixUniform) {
            this.gl.uniformMatrix4fv(this.modelMatrixUniform, false, this.modelMatrix);
        }
    }

    scale(s: number) {
        // The inverse is incorrect for non-unifor scaling
        this.modelMatrix = m4.scale(this.modelMatrix, s, s, s);
        if (this.modelMatrixUniform) {
            this.gl.uniformMatrix4fv(this.modelMatrixUniform, false, this.modelMatrix);
        }
    }

    multMatrix(m: m4.Matrix4) {
        this.modelMatrix = m4.multiply(this.modelMatrix, m);
        if (this.modelMatrixUniform) {
            this.gl.uniformMatrix4fv(this.modelMatrixUniform, false, this.modelMatrix);
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
            inheritEdge: false,
            inheritSurface: false,
            edge: inherit ? this.parentColour.edge : colour.edge,
            surface: inherit ? this.parentColour.surface : colour.surface
        };
    }

    drawTriangles(triangles: Triangle[]) {
        if (!this.vertexBuffer) {
            return;
        }
        if (!this.colourBuffer) {
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
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.vertexAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colours), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.colourAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, triangles.length * 3);
    }

    drawLines(lines: Line[]) {
        if (!this.vertexBuffer) {
            return;
        }
        if (!this.colourBuffer) {
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
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.vertexAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colours), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.colourAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.LINES, 0, lines.length * 2);
    }

    drawQuads(quads: Quad[]) {
        if (!this.vertexBuffer) {
            return;
        }
        if (!this.colourBuffer) {
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
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.vertexAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colours), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.colourAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, quads.length * 6);
    }

    drawModel(model: Model) {
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

    compileLines(lines: Line[]) {
        for (const l of lines) {
            const colour = this.getColour(l.colour, true);
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

    compileSubModelQuads(model: Model) {
        this.compileQuads(model.quads);
        const oldParent = this.parentColour;
        for (const subpart of model.subparts) {
            this.parentColour = this.getParentColour(subpart.colour);
            if (subpart.model) {
                const oldMatrix = this.compileMatrix;
                this.compileMatrix = m4.multiply(this.compileMatrix, subpart.matrix);
                this.compileSubModelQuads(subpart.model);
                this.compileMatrix = oldMatrix;
            }
            this.parentColour = oldParent;
        }
    }

    compileSubModelTriangles(model: Model) {
        this.compileTriangles(model.triangles);
        const oldParent = this.parentColour;
        for (const subpart of model.subparts) {
            this.parentColour = this.getParentColour(subpart.colour);
            if (subpart.model) {
                const oldMatrix = this.compileMatrix;
                this.compileMatrix = m4.multiply(this.compileMatrix, subpart.matrix);
                this.compileSubModelTriangles(subpart.model);
                this.compileMatrix = oldMatrix;
            }
            this.parentColour = oldParent;
        }
    }

    compileSubModelLines(model: Model) {
        this.compileLines(model.lines);
        const oldParent = this.parentColour;
        for (const subpart of model.subparts) {
            this.parentColour = this.getParentColour(subpart.colour);
            if (subpart.model) {
                const oldMatrix = this.compileMatrix;
                this.compileMatrix = m4.multiply(this.compileMatrix, subpart.matrix);
                this.compileSubModelLines(subpart.model);
                this.compileMatrix = oldMatrix;
            }
            this.parentColour = oldParent;
        }
    }

    compileModel(model: Model): CompiledModel {
        this.compiledLines = 0;
        this.compiledTriangles = 0;
        this.compileColours = [];
        this.compileVertices = [];

        this.compileMatrix = m4.identity();
        this.compileSubModelLines(model);

        const triangleOffset = this.compileVertices.length;
        this.compileMatrix = m4.identity();
        this.compileSubModelTriangles(model);

        this.compileMatrix = m4.identity();
        this.compileSubModelQuads(model);

        const compiledModel = {
            vertices: new Float32Array(this.compileVertices),
            colours: new Float32Array(this.compileColours),
            lineOffset: 0,
            lines: this.compiledLines,
            triangleOffset: triangleOffset / 4,
            triangles: this.compiledTriangles
        };
        this.compileMatrix = m4.identity();
        this.compileColours = [];
        this.compileVertices = [];
        return compiledModel;
    }

    drawCompiled(model: CompiledModel) {
        if (!this.vertexBuffer) {
            return;
        }
        if (!this.colourBuffer) {
            return;
        }
        if (model.lines + model.triangles == 0) {
            return;
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, model.vertices, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.vertexAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, model.colours, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.colourAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.LINES, model.lineOffset, model.lines * 2);
        this.gl.drawArrays(this.gl.TRIANGLES, model.triangleOffset, model.triangles * 3);
    }

    setupPipeline() {
        this.resizeCanvasToDisplaySize();
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        const aspect = this.canvas.width / this.canvas.height;
        this.setPerspective(45.0, aspect, 0.1, 1000.0);
        const vertexShaderSource = vertex_shader;
        const fragmentShaderSource = fragment_shader;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (vertexShader && fragmentShader) {
            this.pipeline = this.createProgram(vertexShader, fragmentShader);
            if (this.pipeline) {
                this.gl.useProgram(this.pipeline);
                this.colourAttribute = this.gl.getAttribLocation(this.pipeline, 'a_colour');
                this.vertexAttribute = this.gl.getAttribLocation(this.pipeline, 'a_vertex');
                this.modelMatrixUniform = this.gl.getUniformLocation(this.pipeline, 'model_matrix');
                this.projectionMatrixUniform = this.gl.getUniformLocation(
                    this.pipeline,
                    'projection_matrix'
                );
                if (this.modelMatrixUniform) {
                    this.gl.uniformMatrix4fv(this.modelMatrixUniform, false, this.modelMatrix);
                }
                if (this.projectionMatrixUniform) {
                    this.gl.uniformMatrix4fv(
                        this.projectionMatrixUniform,
                        false,
                        this.projectionMatrix
                    );
                }
                if (this.vertexAttribute >= 0) {
                    this.gl.enableVertexAttribArray(this.vertexAttribute);
                }
                if (this.colourAttribute >= 0) {
                    this.gl.enableVertexAttribArray(this.colourAttribute);
                }
            }
        }
        this.vertexBuffer = this.gl.createBuffer();
        this.colourBuffer = this.gl.createBuffer();
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);
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

    resizeCanvasToDisplaySize() {
        // Lookup the size the browser is displaying the canvas in CSS pixels.
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        // Check if the canvas is not the same size.
        const needResize =
            this.canvas.width !== displayWidth || this.canvas.height !== displayHeight;

        if (needResize) {
            // Make the canvas the same size
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
        }

        return needResize;
    }
}
