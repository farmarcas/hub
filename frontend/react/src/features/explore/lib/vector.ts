export type Vec3 = [number, number, number];

// Hash determinístico em [0, 1): a mesma solução cai sempre no mesmo lugar do globo.
export function hash(text: string): number {
  let value = 7;
  for (let index = 0; index < text.length; index++) {
    value = (value * 31 + text.charCodeAt(index)) % 99991;
  }
  return value / 99991;
}

export function normalize([x, y, z]: Vec3): Vec3 {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

export function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function scale([x, y, z]: Vec3, factor: number): Vec3 {
  return [x * factor, y * factor, z * factor];
}
