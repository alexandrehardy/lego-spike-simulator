export const vertex_shader_2d = `
      // an attribute will receive data from a buffer
      attribute vec4 a_position;
     
      // all shaders have a main function
      void main() {
     
        // gl_Position is a special variable a vertex shader
        // is responsible for setting
        gl_Position = a_position;
      }
      `;

export const fragment_shader_2d = `
     
      // fragment shaders don't have a default precision so we need
      // to pick one. mediump is a good default
      precision mediump float;
     
      void main() {
        // gl_FragColor is a special variable a fragment shader
        // is responsible for setting
        gl_FragColor = vec4(1, 0, 0.5, 1); // return reddish-purple
      }
`;
