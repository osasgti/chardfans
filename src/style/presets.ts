/** Lighting + grade presets as code (CLAUDE.md §4, §18, §36.3). */
export const kelvin = (k: number): string => {
  // Tanner Helland approximation, 1000–40000K → hex
  const t = k / 100; let r: number, g: number, b: number;
  if (t <= 66) { r = 255; g = 99.4708025861 * Math.log(t) - 161.1195681661; }
  else { r = 329.698727446 * Math.pow(t - 60, -0.1332047592); g = 288.1221695283 * Math.pow(t - 60, -0.0755148492); }
  b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
};

export type LightPreset = {key: string; keyI: number; fill: string; fillI: number; rim: string; rimI: number; fog: [number, number]; bg: string; exposure: number};
export const LIGHTS: Record<string, LightPreset> = {
  hallway:   {key: kelvin(3200), keyI: 70, fill: '#7b6cff', fillI: 9,  rim: kelvin(8000), rimI: 55, fog: [6, 18], bg: '#14101f', exposure: 1.05},
  classroom: {key: kelvin(5600), keyI: 55, fill: '#8f7dff', fillI: 12, rim: kelvin(9000), rimI: 40, fog: [8, 22], bg: '#1d1830', exposure: 1.1},
  bedroom:   {key: kelvin(2700), keyI: 60, fill: kelvin(12000), fillI: 10, rim: '#9fc4ff', rimI: 45, fog: [5, 14], bg: '#0f0c1a', exposure: 1.0},
  casino:    {key: kelvin(3000), keyI: 85, fill: '#ff5fc8', fillI: 8,  rim: '#ffd27a', rimI: 50, fog: [6, 16], bg: '#160d14', exposure: 1.05},
  stadium:   {key: kelvin(6500), keyI: 80, fill: '#5a7dff', fillI: 14, rim: '#ffffff', rimI: 60, fog: [10, 40], bg: '#0b1020', exposure: 1.0},
  void:      {key: kelvin(4000), keyI: 90, fill: '#000000', fillI: 0,  rim: '#9fc4ff', rimI: 35, fog: [4, 12], bg: '#0c0a14', exposure: 1.0},
};

export type Grade = {saturation: number; contrast: number; bloom: number; vignette: number; grain: number; ca: number};
export const GRADES: Record<string, Grade> = {
  wonder:      {saturation: -0.10, contrast: 0.08, bloom: 0.8, vignette: 0.75, grain: 0.05, ca: 0.0008},
  fun:         {saturation: -0.05, contrast: 0.06, bloom: 0.6, vignette: 0.6,  grain: 0.04, ca: 0.0006},
  tension:     {saturation: -0.18, contrast: 0.12, bloom: 0.5, vignette: 0.9,  grain: 0.055, ca: 0.0009},
  consequence: {saturation: -0.30, contrast: 0.10, bloom: 0.4, vignette: 0.85, grain: 0.06, ca: 0.0007},
  triumph:     {saturation: 0.0,   contrast: 0.08, bloom: 0.9, vignette: 0.65, grain: 0.045, ca: 0.0008},
};
