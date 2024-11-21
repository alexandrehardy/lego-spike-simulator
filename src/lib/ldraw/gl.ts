import { vertex_shader_2d, fragment_shader_2d } from '$lib/ldraw/shaders';
import * as m4 from '$lib/ldraw/m4';

export class WebGL {
    gl: WebGLRenderingContext;
    pipeline: WebGLProgram | undefined;
    canvas: HTMLCanvasElement;
    projectionMatrix: m4.Matrix4;
    modelMatrix: m4.Matrix4;
    modelInverseMatrix: m4.Matrix4;
    matrixStack: m4.Matrix4[];

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
        this.modelInverseMatrix = m4.identity();
        this.projectionMatrix = m4.identity();
        this.setupPipeline();
    }

    setPerspective(fieldOfViewDegrees: number, aspect: number, near: number, far: number) {
        this.projectionMatrix = m4.perspective(
            (fieldOfViewDegrees * Math.PI) / 180.0,
            aspect,
            near,
            far
        );
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
    }

    setOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        this.projectionMatrix = m4.orthographic(left, right, bottom, top, near, far);
    }

    setProjectionIdentity() {
        this.projectionMatrix = m4.identity();
    }

    setModelIdentity() {
        this.modelMatrix = m4.identity();
        this.modelInverseMatrix = m4.identity();
    }

    pushMatrix() {
        this.matrixStack.push(copy(this.modelMatrix));
        this.matrixStack.push(copy(this.modelInverseMatrix));
    }

    popMatrix() {
        this.modelInverseMatrix = this.matrixStack.pop();
        this.modelMatrix = this.matrixStack.pop();
    }

    translate(x: number, y: number, z: number) {
        this.modelMatrix = m4.translate(this.modelMatrix, x, y, z);
        this.modelInverseMatrix = m4.multiply(m4.translation(-x, -y, -z), this.modelInverseMatrix);
    }

    rotate(angle: number, x: number, y: number, z: number) {
        const radians = (angle * Math.PI) / 180.0;
        this.modelMatrix = m4.axisRotate(this.modelMatrix, [x, y, z], radians);
        this.modelInverseMatrix = m4.multiply(
            m4.axisRotation([x, y, z], -radians),
            this.modelInverseMatrix
        );
    }

    scale(s: number) {
        // The inverse is incorrect for non-unifor scaling
        this.modelMatrix = m4.scale(this.modelMatrix, s, s, s);
        this.modelInverseMatrix = m4.multiply(
            m4.scaling(1.0 / s, 1.0 / s, 1.0 / s),
            this.modelInverseMatrix
        );
    }

    setupPipeline() {
        this.resizeCanvasToDisplaySize();
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        const aspect = this.canvas.width / this.canvas.height;
        this.setPerspective(45.0, aspect, -0.1, -1000.0);
        const vertexShaderSource = vertex_shader_2d;
        const fragmentShaderSource = fragment_shader_2d;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (vertexShader && fragmentShader) {
            this.pipeline = this.createProgram(vertexShader, fragmentShader);
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
