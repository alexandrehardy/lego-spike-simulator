export const vertex_shader = `
      // an attribute will receive data from a buffer
      attribute vec4 a_vertex;
      attribute vec4 a_color;
      uniform mat4 model_matrix;
      uniform mat4 projection_matrix;
      varying vec4 v_color;
     
      // all shaders have a main function
      void main() {
     
        // gl_Position is a special variable a vertex shader
        // is responsible for setting
        v_color = a_color;
        gl_Position = projection_matrix * model_matrix * a_vertex;
      }
      `;

export const fragment_shader = `
      // fragment shaders don't have a default precision so we need
      // to pick one. mediump is a good default
      precision mediump float;
      varying vec4 v_color;
     
      void main() {
        // gl_FragColor is a special variable a fragment shader
        // is responsible for setting
        gl_FragColor = v_color;
        // gl_FragDepth is used to specify the depth value
        // it is taken from gl_FragCoord.z by default
      }
`;
