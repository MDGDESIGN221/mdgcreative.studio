// Approximation Kelvin → RGB (algorithme Tanner Helland), valable
// grossièrement entre 1000K et 40000K. Vérifié numériquement :
// 6500K ≈ blanc neutre, <5000K vire chaud (bougie), >7000K vire bleu (ciel).
export function kelvinToRGB(kelvin) {
  const temp = kelvin / 100;
  let r;
  let g;
  let b;

  if (temp <= 66) {
    r = 255;
    g = temp <= 19 ? 0 : 99.4708025861 * Math.log(temp - 10) - 161.1195681661;
  } else {
    r = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
  }

  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
  }

  const clamp01 = (v) => Math.max(0, Math.min(255, v)) / 255;
  return { r: clamp01(r), g: clamp01(g), b: clamp01(b) };
}

export function kelvinToHex(kelvin) {
  const { r, g, b } = kelvinToRGB(kelvin);
  const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
