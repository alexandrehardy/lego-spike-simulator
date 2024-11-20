import { vertex_shader_2d, fragment_shader_2d } from '$lib/ldraw/shaders';

export class WebGL {
    gl: WebGLRenderingContext | null;
    pipeline: WebGLProgram | undefined;
    enabled: boolean;
    canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl');
        if (!this.gl) {
            console.log('No WebGL available');
            this.enabled = false;
        } else {
            this.enabled = true;
            this.setupPipeline();
        }
    }

    setupPipeline() {
        if (!this.gl) {
            return;
        }
        this.resizeCanvasToDisplaySize();
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        const vertexShaderSource = vertex_shader_2d;
        const fragmentShaderSource = fragment_shader_2d;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (vertexShader && fragmentShader) {
            this.pipeline = this.createProgram(vertexShader, fragmentShader);
        }
    }

    createShader(type: GLenum, source: string): WebGLShader | undefined {
        if (!this.gl) {
            return undefined;
        }
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
        if (!this.gl) {
            return;
        }
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
        if (!this.gl) {
            return;
        }
        // Lookup the size the browser is displaying the canvas in CSS pixels.
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        // Check if the canvas is not the same size.
        const needResize = this.canvas.width !== displayWidth || this.canvas.height !== displayHeight;

        if (needResize) {
            // Make the canvas the same size
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
        }

        return needResize;
    }
}
