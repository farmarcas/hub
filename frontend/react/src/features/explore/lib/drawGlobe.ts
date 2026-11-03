import { labelPriority, placeLabels } from "./labels";
import { GROUP_RADIUS, positionOf, type GlobeLayout } from "./layout";
import {
  arcPoint,
  globeCenter,
  globeRadius,
  project,
  rotate,
  type Projected,
  type View,
} from "./projection";
import type { Vec3 } from "./vector";

// Paleta do protótipo v5. O canvas não lê classes Tailwind, então as cores ficam aqui.
const ORANGE = "255,85,16";
const ORANGE_HOVER = "255,115,52";
const ORANGE_SOFT = "255,190,159";
const ORANGE_PALE = "255,223,209";
const WHITE = "250,249,248";
const TEXT_SOFT = "229,226,222";
const BACKGROUND = "#050505";

const GRID_STEP_DEG = 30;
const GRID_SEGMENTS = 72;
const ARC_SEGMENTS = 16;
const ORBIT_SEGMENTS = 120;
const GROUP_LIFT = 0.08;
const RELATED_LIFT = 0.18;

export type Impulse = { a: string; b: string; start: number; duration: number; isStrong: boolean };
export type Hit = { id: string; x: number; y: number; radius: number; z: number };

export type FrameInput = {
  ctx: CanvasRenderingContext2D;
  layout: GlobeLayout;
  view: View;
  yaw: number;
  pitch: number;
  time: number;
  motion: number;
  focusId: string;
  focusStart: number;
  hoverSet: Set<string>;
  focusSet: Set<string>;
  activation: Record<string, number>;
  impulses: Impulse[];
  showSolutionLabels: boolean;
};

const rgba = (rgb: string, alpha: number) => `rgba(${rgb},${alpha.toFixed(3)})`;

function strokePath(ctx: CanvasRenderingContext2D, points: Projected[]) {
  ctx.beginPath();
  points.forEach((point, index) =>
    index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y),
  );
  ctx.stroke();
}

// Malha de latitude/longitude: frente mais forte, verso quase apagado.
function drawShell(input: FrameInput, radius: number, frontAlpha: number, backAlpha: number) {
  const { ctx, view, yaw, pitch } = input;
  const toScreen = (v: Vec3) => project(rotate(v, yaw, pitch), view);
  const drawSegments = (points: Projected[]) => {
    for (let index = 1; index < points.length; index++) {
      const previous = points[index - 1] as Projected;
      const current = points[index] as Projected;
      const z = (previous.z + current.z) / 2;
      ctx.strokeStyle = rgba("255,255,255", z > 0 ? frontAlpha : backAlpha);
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
    }
  };

  for (let lat = -60; lat <= 60; lat += GRID_STEP_DEG) {
    const la = (lat * Math.PI) / 180;
    const points: Projected[] = [];
    for (let index = 0; index <= GRID_SEGMENTS; index++) {
      const lo = (index / GRID_SEGMENTS) * Math.PI * 2;
      points.push(
        toScreen([
          Math.cos(la) * Math.cos(lo) * radius,
          Math.sin(la) * radius,
          Math.cos(la) * Math.sin(lo) * radius,
        ]),
      );
    }
    drawSegments(points);
  }
  for (let lon = 0; lon < 180; lon += GRID_STEP_DEG) {
    const lo = (lon * Math.PI) / 180;
    const points: Projected[] = [];
    for (let index = 0; index <= GRID_SEGMENTS; index++) {
      const angle = (index / GRID_SEGMENTS) * Math.PI * 2;
      points.push(
        toScreen([
          Math.cos(angle) * Math.cos(lo) * radius,
          Math.sin(angle) * radius,
          Math.cos(angle) * Math.sin(lo) * radius,
        ]),
      );
    }
    drawSegments(points);
  }
}

function drawSphere(input: FrameInput) {
  const { ctx, view } = input;
  const center = globeCenter(view);
  const radius = globeRadius(view);

  const halo = ctx.createRadialGradient(
    center.x,
    center.y,
    radius * 0.1,
    center.x,
    center.y,
    radius * 1.25,
  );
  halo.addColorStop(0, rgba(ORANGE, 0.16));
  halo.addColorStop(0.6, rgba(ORANGE, 0.05));
  halo.addColorStop(1, rgba(ORANGE, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius * 1.25, 0, Math.PI * 2);
  ctx.fill();

  const body = ctx.createRadialGradient(
    center.x - radius * 0.35,
    center.y - radius * 0.4,
    radius * 0.05,
    center.x,
    center.y,
    radius * 1.02,
  );
  body.addColorStop(0, rgba(ORANGE_HOVER, 0.16));
  body.addColorStop(0.55, "rgba(40,18,8,0.55)");
  body.addColorStop(1, "rgba(10,6,4,0.75)");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = rgba(ORANGE_HOVER, 0.55);
  ctx.lineWidth = 1.4;
  ctx.shadowColor = rgba(ORANGE, 0.8);
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  drawShell(input, 1, 0.2, 0.06);
  drawShell(input, GROUP_RADIUS, 0.1, 0.03);
}

// Duas órbitas pontilhadas inclinadas, cada uma com um satélite.
function drawOrbits(input: FrameInput) {
  const { ctx, view, yaw, pitch, time, motion } = input;
  const orbits: [radius: number, tilt: number, speed: number][] = [
    [1.32, 0.35, 1],
    [1.45, -0.6, -0.7],
  ];
  orbits.forEach(([radius, tilt, speed], index) => {
    const points: Projected[] = [];
    for (let step = 0; step <= ORBIT_SEGMENTS; step++) {
      const angle = (step / ORBIT_SEGMENTS) * Math.PI * 2 + time * 0.15 * speed * motion;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      points.push(project(rotate([x, -z * Math.sin(tilt), z * Math.cos(tilt)], yaw, pitch), view));
    }
    ctx.setLineDash(index ? [2, 9] : [1, 6]);
    ctx.strokeStyle = rgba(ORANGE, index ? 0.18 : 0.26);
    ctx.lineWidth = 1;
    strokePath(ctx, points);
    ctx.setLineDash([]);

    const satellite =
      points[Math.floor(((time * 0.08 * (index + 1) * motion) % 1) * ORBIT_SEGMENTS)];
    if (!satellite) return;
    ctx.fillStyle = rgba(ORANGE_SOFT, 0.9);
    ctx.beginPath();
    ctx.arc(satellite.x, satellite.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCore(input: FrameInput, points: Record<string, Projected>) {
  const { ctx, view, yaw, pitch, time, motion, layout, activation } = input;
  const core = project(rotate([0, 0, 0], yaw, pitch), view);
  const pulse = 0.5 + 0.5 * Math.sin(time * 2 * Math.max(motion, 0.0001));

  ctx.fillStyle = rgba(ORANGE, 0.55 + pulse * 0.2);
  ctx.shadowColor = rgba(ORANGE, 0.9);
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(core.x, core.y, 9 + pulse * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = rgba(ORANGE, 0.3 + pulse * 0.3);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(core.x, core.y, 20 + pulse * 8, 0, Math.PI * 2);
  ctx.stroke();

  for (const groupId of layout.groupIds) {
    const point = points[groupId];
    if (!point) continue;
    const alpha = (0.08 + (activation[groupId] ?? 0) * 0.18) * (point.z > 0 ? 1 : 0.5);
    ctx.strokeStyle = rgba(ORANGE, alpha);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(core.x, core.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }
  return core;
}

function arcBetween(input: FrameInput, a: string, b: string, progress: number): Projected {
  const { layout, view, yaw, pitch } = input;
  const nodeA = layout.nodes[a];
  const nodeB = layout.nodes[b];
  const lift = nodeA?.kind === "sol" && nodeB?.kind === "sol" ? RELATED_LIFT : GROUP_LIFT;
  const point = arcPoint(
    { direction: layout.directions[a] ?? [0, 0, 1], radius: nodeA?.radius ?? 1 },
    { direction: layout.directions[b] ?? [0, 0, 1], radius: nodeB?.radius ?? 1 },
    progress,
    lift,
  );
  return project(rotate(point, yaw, pitch), view);
}

function drawEdges(input: FrameInput) {
  const { ctx, layout, activation, hoverSet, focusId } = input;
  const hoverId = hoverSet.size > 0 ? [...hoverSet][0] : null;
  const isFocused = focusId !== "core";

  for (const edge of layout.edges) {
    const isHot =
      (hoverId !== null && (edge.a === hoverId || edge.b === hoverId)) ||
      (isFocused && (edge.a === focusId || edge.b === focusId));
    const points: Projected[] = [];
    for (let step = 0; step <= ARC_SEGMENTS; step++) {
      points.push(arcBetween(input, edge.a, edge.b, step / ARC_SEGMENTS));
    }
    const first = points[0] as Projected;
    const middle = points[ARC_SEGMENTS / 2] as Projected;
    const last = points[ARC_SEGMENTS] as Projected;
    const meanZ = (first.z + middle.z + last.z) / 3;
    let alpha =
      Math.min(activation[edge.a] ?? 0, activation[edge.b] ?? 0) *
      (edge.type === "related" ? 0.35 : 0.42) *
      (meanZ > 0 ? 1 : 0.35);
    if (isHot) alpha = 0.95;
    if (alpha < 0.02) continue;

    ctx.setLineDash(edge.type === "related" ? [3, 5] : []);
    ctx.shadowColor = rgba(ORANGE, 0.8);
    ctx.shadowBlur = isHot ? 10 : 0;
    ctx.strokeStyle = rgba(ORANGE, alpha);
    ctx.lineWidth = isHot ? 1.6 : 0.9;
    strokePath(ctx, points);
    ctx.shadowBlur = 0;
  }
  ctx.setLineDash([]);
}

// Pulsos de luz que percorrem as arestas. Devolve só os que ainda não terminaram.
function drawImpulses(input: FrameInput): Impulse[] {
  const { ctx, impulses, time } = input;
  const alive: Impulse[] = [];
  for (const impulse of impulses) {
    const progress = (time - impulse.start) / impulse.duration;
    if (progress >= 1) continue;
    alive.push(impulse);
    if (progress < 0) continue;
    const point = arcBetween(input, impulse.a, impulse.b, progress);
    if (point.z < -0.6) continue;
    ctx.fillStyle = impulse.isStrong ? rgba(ORANGE_PALE, 1) : rgba(ORANGE_SOFT, 0.75);
    ctx.shadowColor = rgba(ORANGE, 1);
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(point.x, point.y, (impulse.isStrong ? 2.6 : 1.8) * point.k, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  return alive;
}

type LabelItem = { id: string; point: Projected; scale: number; alpha: number; isHot: boolean };

function drawNodesAndLabels(input: FrameInput, points: Record<string, Projected>): Hit[] {
  const { ctx, layout, activation, focusId, focusStart, time, hoverSet, focusSet } = input;
  const isFocused = focusId !== "core";
  const hits: Hit[] = [];
  const labels: {
    item: LabelItem;
    box: { x0: number; x1: number; y0: number; y1: number };
    priority: number;
  }[] = [];
  const order = [...layout.ids].sort((a, b) => (points[a]?.z ?? 0) - (points[b]?.z ?? 0));

  for (const id of order) {
    const point = points[id];
    const node = layout.nodes[id];
    if (!point || !node) continue;
    const active = activation[id] ?? 0;
    const depth = 0.35 + (0.65 * (point.z + 1)) / 2;
    const alpha = Math.max(0.12, active) * depth;
    const scale = point.k * (id === focusId ? 1.4 : 1);

    if (node.kind === "theme") {
      ctx.fillStyle = BACKGROUND;
      ctx.strokeStyle = rgba(ORANGE, alpha);
      ctx.lineWidth = 2;
      ctx.shadowColor = rgba(ORANGE, 0.8);
      ctx.shadowBlur = 12 * active;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (node.kind === "dir") {
      const size = 7 * scale;
      ctx.fillStyle = BACKGROUND;
      ctx.strokeStyle = rgba(ORANGE_SOFT, alpha);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(point.x, point.y - size);
      ctx.lineTo(point.x + size, point.y);
      ctx.lineTo(point.x, point.y + size);
      ctx.lineTo(point.x - size, point.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = rgba(ORANGE_HOVER, alpha);
      ctx.shadowColor = rgba(ORANGE_HOVER, 0.9);
      ctx.shadowBlur = 10 * active * depth;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (id === focusId) {
      const phase = ((((time - focusStart) % 1.6) + 1.6) % 1.6) / 1.6;
      ctx.strokeStyle = rgba(ORANGE, (1 - phase) * 0.8);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 14 + phase * 26, 0, Math.PI * 2);
      ctx.stroke();
    }

    const isHot = hoverSet.has(id) || (isFocused && focusSet.has(id));
    const isGroup = node.kind !== "sol";
    const showLabel = isGroup
      ? point.z > -0.15 || isHot
      : isHot || (input.showSolutionLabels && !isFocused && point.z > 0.35);
    if (showLabel) {
      const text = node.kind === "theme" ? node.name.toUpperCase() : node.name;
      setLabelFont(ctx, node.kind);
      const width = ctx.measureText(text).width;
      const top = point.y + (isGroup ? 16 : 12) * scale;
      labels.push({
        item: { id, point, scale, alpha, isHot },
        box: {
          x0: point.x - width / 2 - 8,
          x1: point.x + width / 2 + 8,
          y0: top - 3,
          y1: top + 19,
        },
        priority: labelPriority({ isFocus: id === focusId, isHot, isGroup, depth: point.z }),
      });
    }
    if (point.z > -0.5 || isHot) {
      hits.push({ id, x: point.x, y: point.y, radius: (isGroup ? 16 : 12) * scale, z: point.z });
    }
  }

  for (const { item } of placeLabels(labels)) drawLabel(input, item);
  return hits;
}

function setLabelFont(ctx: CanvasRenderingContext2D, kind: "theme" | "dir" | "sol") {
  ctx.font =
    kind === "theme" ? "600 11px Rubik" : kind === "dir" ? "500 12px Rubik" : "400 12px Rubik";
  ctx.letterSpacing = kind === "theme" ? "1.5px" : "0px";
}

function drawLabel(input: FrameInput, { id, point, scale, alpha, isHot }: LabelItem) {
  const { ctx, layout, focusId } = input;
  const node = layout.nodes[id];
  if (!node) return;
  const text = node.kind === "theme" ? node.name.toUpperCase() : node.name;
  setLabelFont(ctx, node.kind);
  const width = ctx.measureText(text).width;
  const top = point.y + (node.kind === "sol" ? 12 : 16) * scale;
  const labelAlpha = isHot ? 1 : Math.min(1, alpha * 1.3);

  ctx.fillStyle = `rgba(5,5,5,${(0.72 * labelAlpha).toFixed(3)})`;
  ctx.fillRect(point.x - width / 2 - 6, top - 1, width + 12, 18);
  if (node.kind === "dir") {
    ctx.strokeStyle = rgba(ORANGE_SOFT, 0.3 * labelAlpha);
    ctx.lineWidth = 1;
    ctx.strokeRect(point.x - width / 2 - 6, top - 1, width + 12, 18);
  }
  const color = id === focusId ? ORANGE_HOVER : node.kind === "sol" ? TEXT_SOFT : WHITE;
  ctx.fillStyle = rgba(color, labelAlpha);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(text, point.x, top + 3);
  ctx.letterSpacing = "0px";
}

// Desenha um quadro do globo. Devolve os alvos de clique e os pulsos que continuam vivos.
export function drawGlobe(input: FrameInput): { hits: Hit[]; impulses: Impulse[] } {
  const { ctx, layout, view, yaw, pitch, focusId } = input;
  ctx.clearRect(0, 0, view.width, view.height);

  drawSphere(input);
  drawOrbits(input);

  const points: Record<string, Projected> = {};
  for (const id of layout.ids)
    points[id] = project(rotate(positionOf(layout, id), yaw, pitch), view);

  const core = drawCore(input, points);
  drawEdges(input);
  const impulses = drawImpulses(input);
  const hits = drawNodesAndLabels(input, points);

  if (focusId === "core") {
    ctx.font = "600 11px Rubik";
    ctx.letterSpacing = "2px";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = rgba(WHITE, 0.9);
    ctx.fillText("NÚCLEO", core.x, core.y + 34);
    ctx.letterSpacing = "0px";
  }
  return { hits, impulses };
}

export type Particle = { x: number; y: number; z: number; r: number };

const PARTICLE_COUNT = 160;

export function createParticles(width: number, height: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random(),
    r: 0.4 + Math.random() * 1.2,
  }));
}

// Campo de partículas lento atrás do globo.
export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  view: { width: number; height: number },
  time: number,
  motion: number,
) {
  ctx.clearRect(0, 0, view.width, view.height);
  for (const particle of particles) {
    particle.x -= (0.05 + particle.z * 0.25) * motion;
    if (particle.x < 0) particle.x += view.width;
    const green = 150 + Math.floor(particle.z * 80);
    const alpha = 0.15 + 0.35 * particle.z * (0.6 + 0.4 * Math.sin(time * 1.3 + particle.r * 7));
    ctx.fillStyle = `rgba(255,${green},120,${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Clique/hover: o nó mais próximo dentro do raio, favorecendo o que está na frente.
export function pickNode(hits: Hit[], x: number, y: number): string | null {
  let best: string | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const hit of hits) {
    const gap = Math.hypot(hit.x - x, hit.y - y);
    if (gap >= hit.radius) continue;
    const score = gap - hit.z * 6;
    if (score < bestScore) {
      bestScore = score;
      best = hit.id;
    }
  }
  return best;
}
