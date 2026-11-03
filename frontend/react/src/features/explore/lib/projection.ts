import { normalize, type Vec3 } from "./vector";

const PERSPECTIVE = 3.2;
const GLOBE_SCALE = 0.4;
const VERTICAL_OFFSET = 8;
const MAX_FOCUS_PITCH = 1.1;

// insetRight: largura coberta à direita (painel aberto). O globo centraliza no que sobra visível.
export type View = { width: number; height: number; zoom: number; insetRight?: number };
export type Projected = { x: number; y: number; z: number; k: number };

const PANEL_MIN_WIDTH = 300;
const PANEL_MAX_WIDTH = 380;
const PANEL_WIDTH_RATIO = 0.32;

// Mesma conta do CSS do painel: clamp(300px, 32%, 380px).
export function panelWidth(stageWidth: number): number {
  return Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, stageWidth * PANEL_WIDTH_RATIO));
}

const MIN_VISIBLE_GLOBE_WIDTH = 420;

// Quanto o globo desvia do painel aberto. Em tela estreita (celular) o painel cobre o globo
// por cima, sem espremê-lo no pedaço que sobra.
export function globeInset(stageWidth: number, isPanelOpen: boolean): number {
  if (!isPanelOpen) return 0;
  const panel = panelWidth(stageWidth);
  return stageWidth - panel >= MIN_VISIBLE_GLOBE_WIDTH ? panel : 0;
}

const visibleWidth = ({ width, insetRight = 0 }: View) => Math.max(0, width - insetRight);

export function rotate([x, y, z]: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
}

export function globeRadius(view: View): number {
  return Math.min(visibleWidth(view) * 0.75, view.height) * GLOBE_SCALE * view.zoom;
}

export function globeCenter(view: View) {
  return { x: visibleWidth(view) / 2, y: view.height / 2 + VERTICAL_OFFSET };
}

// Perspectiva: o que está na frente (z > 0) fica maior (k > 1); o que está atrás, menor.
export function project(v: Vec3, view: View): Projected {
  const radius = globeRadius(view);
  const center = globeCenter(view);
  const k = PERSPECTIVE / (PERSPECTIVE - v[2]);
  return { x: center.x + v[0] * radius * k, y: center.y - v[1] * radius * k, z: v[2], k };
}

// Ângulos que trazem a direção para a frente, pelo caminho mais curto a partir do yaw atual.
export function focusAngles(direction: Vec3, currentYaw: number) {
  let yaw = Math.atan2(-direction[0], direction[2]);
  while (yaw - currentYaw > Math.PI) yaw -= Math.PI * 2;
  while (yaw - currentYaw < -Math.PI) yaw += Math.PI * 2;
  const z1 = -direction[0] * Math.sin(yaw) + direction[2] * Math.cos(yaw);
  const pitch = Math.max(-MAX_FOCUS_PITCH, Math.min(MAX_FOCUS_PITCH, Math.atan2(direction[1], z1)));
  return { yaw, pitch };
}

// Ponto do arco entre a e b, levantado acima da superfície no meio do caminho.
export function arcPoint(
  a: { direction: Vec3; radius: number },
  b: { direction: Vec3; radius: number },
  progress: number,
  lift: number,
): Vec3 {
  const direction = normalize([
    a.direction[0] * (1 - progress) + b.direction[0] * progress,
    a.direction[1] * (1 - progress) + b.direction[1] * progress,
    a.direction[2] * (1 - progress) + b.direction[2] * progress,
  ]);
  const radius =
    a.radius * (1 - progress) + b.radius * progress + Math.sin(progress * Math.PI) * lift;
  return [direction[0] * radius, direction[1] * radius, direction[2] * radius];
}
