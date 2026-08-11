import { Effect } from 'postprocessing';
import { Uniform } from 'three';

// Grade duotone simple : mélange le rendu vers (luminance × teinte).
// Ce n'est pas une vraie LUT ciné, mais ça suffit pour juger si la
// direction colorimétrique se rapproche du grade orange du poster
// Match Day ou du grade rouge de la carte Light Study #02.
const fragmentShader = /* glsl */ `
  uniform vec3 tint;
  uniform float strength;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float lum = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
    vec3 graded = lum * tint;
    vec3 result = mix(inputColor.rgb, graded, strength);
    outputColor = vec4(result, inputColor.a);
  }
`;

export class ColorGradeEffect extends Effect {
  constructor({ tint, strength = 0.35 } = {}) {
    super('ColorGradeEffect', fragmentShader, {
      uniforms: new Map([
        ['tint', new Uniform(tint)],
        ['strength', new Uniform(strength)],
      ]),
    });
  }
}
