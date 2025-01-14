export const lego_vertex_shader = `
      // an attribute will receive data from a buffer
      attribute vec4 a_vertex;
      attribute vec4 a_colour;
      uniform mat4 model_matrix;
      uniform mat4 projection_matrix;
      uniform float brightness;
      varying vec4 v_colour;
      varying vec4 v;
     
      // all shaders have a main function
      void main() {
     
        // gl_Position is a special variable a vertex shader
        // is responsible for setting
        v_colour = vec4(a_colour.rgb * brightness, a_colour.a);
        v = projection_matrix * model_matrix * a_vertex;
        gl_Position = v;
      }
      `;

export const lego_fragment_shader = `
      // fragment shaders don't have a default precision so we need
      // to pick one. mediump is a good default
      precision mediump float;
      uniform float near;
      uniform float far;
      varying vec4 v_colour;
      varying vec4 v;
      bool renderDepth;
     
      void main() {
        // gl_FragColor is a special variable a fragment shader
        // is responsible for setting
        if (renderDepth) {
            float depth = (v.z - near) / (far - near);
            gl_FragColor = vec4(depth, depth, depth, 1.0);
        } else {
            gl_FragColor = vec4(v_colour.rgb, 1.0);
        }
        // gl_FragDepth is used to specify the depth value
        // it is taken from gl_FragCoord.z by default
      }
`;

export const map_vertex_shader = `
      // an attribute will receive data from a buffer
      attribute vec4 a_vertex;
      attribute vec2 a_texture;
      uniform mat4 model_matrix;
      uniform mat4 projection_matrix;
      varying highp vec2 v_texture;
     
      // all shaders have a main function
      void main() {
     
        // gl_Position is a special variable a vertex shader
        // is responsible for setting
        v_texture = a_texture;
        gl_Position = projection_matrix * model_matrix * a_vertex;
      }
      `;

export const map_fragment_shader = `
      // fragment shaders don't have a default precision so we need
      // to pick one. mediump is a good default
      precision mediump float;
      varying highp vec2 v_texture;
      uniform sampler2D sampler;
      uniform float brightness;
     
      void main() {
        // gl_FragColor is a special variable a fragment shader
        // is responsible for setting
        vec4 colour = texture2D(sampler, v_texture);
        // store the depth in the alpha channel
        gl_FragColor = vec4(colour.rgb * brightness, gl_FragCoord.z);
      }
`;
