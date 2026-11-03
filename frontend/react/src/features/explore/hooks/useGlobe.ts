import { useEffect, useRef, useState } from "react";
import {
  createParticles,
  drawGlobe,
  drawParticles,
  pickNode,
  type Hit,
  type Impulse,
  type Particle,
} from "../lib/drawGlobe";
import type { GlobeLayout } from "../lib/layout";
import { highlightSet } from "../lib/preview";
import { focusAngles, globeInset } from "../lib/projection";
import { useMediaQuery } from "./useMediaQuery";

const EASE = 0.07;
const ZOOM_EASE = 0.08;
const INERTIA = 0.94;
const AUTO_ROTATE_SPEED = 0.0018;
const DRAG_SENSITIVITY = 0.006;
const CLICK_TOLERANCE_PX = 4;
const MIN_ZOOM = 0.7;
const MAX_ZOOM = 1.8;
const WHEEL_SENSITIVITY = 0.0012;
const MAX_PITCH = 1.2;
const FOCUS_ZOOM = { group: 1.08, solution: 1.18 } as const;
const FOCUS_REPEAT_SECONDS = 3.4;
const SPONTANEOUS_SECONDS = 0.45;
// Na prévia o grupo para um pouco à esquerda e acima do centro, sem cobrir o rótulo "NÚCLEO".
const PREVIEW_YAW_OFFSET = -0.35;
const PREVIEW_PITCH_OFFSET = -0.15;
const INSET_EASE = 0.12;

type Engine = {
  yaw: number;
  pitch: number;
  yawVelocity: number;
  pitchVelocity: number;
  zoom: number;
  targetZoom: number;
  insetRight: number;
  target: { yaw: number; pitch: number } | null;
  hoverId: string | null;
  activation: Record<string, number>;
  impulses: Impulse[];
  particles: Particle[];
  hits: Hit[];
  lastSpontaneous: number;
  lastFire: number;
  focusStart: number;
  now: number;
  drag: { x: number; y: number; dx: number; dy: number; hasMoved: boolean } | null;
};

const createEngine = (): Engine => ({
  yaw: 0.4,
  pitch: -0.25,
  yawVelocity: 0,
  pitchVelocity: 0,
  zoom: 1,
  targetZoom: 1,
  insetRight: 0,
  target: null,
  hoverId: null,
  activation: {},
  impulses: [],
  particles: [],
  hits: [],
  lastSpontaneous: 0,
  lastFire: 0,
  focusStart: 0,
  now: 0,
  drag: null,
});

// Cascata de pulsos: do nó em foco para os vizinhos e dos vizinhos para os vizinhos deles.
function fire(engine: Engine, layout: GlobeLayout, focusId: string) {
  const start = engine.now;
  engine.focusStart = start;
  engine.lastFire = start;
  for (const neighbor of layout.neighbors[focusId] ?? []) {
    engine.impulses.push({ a: focusId, b: neighbor, start, duration: 0.6, isStrong: true });
    for (const next of layout.neighbors[neighbor] ?? []) {
      if (next === focusId) continue;
      engine.impulses.push({
        a: neighbor,
        b: next,
        start: start + 0.6,
        duration: 0.7,
        isStrong: false,
      });
    }
  }
}

type UseGlobeOptions = {
  layout: GlobeLayout;
  focusId: string;
  // Grupo em prévia (mouse/foco num cartão do painel): gira e acende sem mudar o caminho.
  previewId: string | null;
  // Painel de detalhes aberto: o globo centraliza na área visível à esquerda dele.
  isPanelOpen: boolean;
  onPick: (id: string) => void;
};

// Com "reduzir movimento", vai direto ao ângulo em vez de girar aos poucos.
function aimAt(engine: Engine, target: Engine["target"], motion: number) {
  engine.target = target;
  if (target && motion === 0) {
    engine.yaw = target.yaw;
    engine.pitch = target.pitch;
  }
}

export function useGlobe({ layout, focusId, previewId, isPanelOpen, onPick }: UseGlobeOptions) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine>(createEngine());
  const [cursor, setCursor] = useState<"grab" | "grabbing" | "pointer">("grab");
  const motion = useMediaQuery("(prefers-reduced-motion: reduce)") ? 0 : 1;

  // As callbacks mudam a cada render; o laço de animação lê sempre a mais recente.
  const latest = useRef({ layout, focusId, previewId, isPanelOpen, onPick, motion });
  useEffect(() => {
    latest.current = { layout, focusId, previewId, isPanelOpen, onPick, motion };
  });

  // Mudou o foco: gira até o nó ficar de frente, aproxima e dispara os pulsos.
  useEffect(() => {
    const engine = engineRef.current;
    if (focusId === "core") {
      engine.target = null;
      engine.targetZoom = 1;
      return;
    }
    const direction = layout.directions[focusId];
    if (!direction) return;
    aimAt(engine, focusAngles(direction, engine.yaw), latest.current.motion);
    engine.targetZoom =
      layout.nodes[focusId]?.kind === "sol" ? FOCUS_ZOOM.solution : FOCUS_ZOOM.group;
    fire(engine, layout, focusId);
  }, [focusId, layout]);

  // Prévia do painel: gira até o grupo; ao sair, volta ao alvo do foco atual (Núcleo = giro livre).
  useEffect(() => {
    const engine = engineRef.current;
    const { focusId: currentFocus, motion: currentMotion } = latest.current;
    const targetId = previewId ?? (currentFocus === "core" ? null : currentFocus);
    const direction = targetId ? layout.directions[targetId] : undefined;
    if (!direction) {
      aimAt(engine, null, currentMotion);
      return;
    }
    const angles = focusAngles(direction, engine.yaw);
    aimAt(
      engine,
      previewId
        ? { yaw: angles.yaw + PREVIEW_YAW_OFFSET, pitch: angles.pitch + PREVIEW_PITCH_OFFSET }
        : angles,
      currentMotion,
    );
  }, [previewId, layout]);

  // Laço de animação (requestAnimationFrame) com limpeza ao sair da tela.
  useEffect(() => {
    let frameId = 0;
    const engine = engineRef.current;

    const frame = (timestamp: number) => {
      frameId = requestAnimationFrame(frame);
      const stage = stageRef.current;
      const canvas = canvasRef.current;
      const background = backgroundRef.current;
      if (!stage || !canvas || !background) return;

      const {
        layout: currentLayout,
        focusId: currentFocus,
        previewId: currentPreview,
        isPanelOpen: currentPanelOpen,
        motion: currentMotion,
      } = latest.current;
      const time = timestamp / 1000;
      engine.now = time;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;
      const ratio = window.devicePixelRatio || 1;
      for (const element of [canvas, background]) {
        if (
          element.width !== Math.round(width * ratio) ||
          element.height !== Math.round(height * ratio)
        ) {
          element.width = Math.round(width * ratio);
          element.height = Math.round(height * ratio);
          if (element === background) engine.particles = createParticles(width, height);
        }
      }

      // Desliza o centro do globo junto com o painel (sem animação com "reduzir movimento").
      const targetInset = globeInset(width, currentPanelOpen);
      engine.insetRight =
        currentMotion > 0
          ? engine.insetRight + (targetInset - engine.insetRight) * INSET_EASE
          : targetInset;

      const isFocused = currentFocus !== "core";
      if (engine.target && !engine.drag) {
        engine.yaw += (engine.target.yaw - engine.yaw) * EASE;
        engine.pitch += (engine.target.pitch - engine.pitch) * EASE;
      } else if (!engine.drag) {
        const isHighlighting = Boolean(engine.hoverId ?? currentPreview);
        const autoRotate = !isFocused && !isHighlighting ? AUTO_ROTATE_SPEED * currentMotion : 0;
        engine.yaw += engine.yawVelocity + autoRotate;
        engine.pitch = Math.max(
          -MAX_PITCH,
          Math.min(MAX_PITCH, engine.pitch + engine.pitchVelocity),
        );
        engine.yawVelocity *= INERTIA;
        engine.pitchVelocity *= INERTIA;
      }
      engine.zoom += (engine.targetZoom - engine.zoom) * ZOOM_EASE;

      if (
        isFocused &&
        currentMotion > 0 &&
        time - engine.lastFire > FOCUS_REPEAT_SECONDS / currentMotion
      ) {
        fire(engine, currentLayout, currentFocus);
      }
      if (
        !isFocused &&
        currentMotion > 0 &&
        time - engine.lastSpontaneous > SPONTANEOUS_SECONDS / currentMotion
      ) {
        engine.lastSpontaneous = time;
        const edge = currentLayout.edges[Math.floor(Math.random() * currentLayout.edges.length)];
        if (edge) {
          const isReversed = Math.random() < 0.5;
          engine.impulses.push({
            a: isReversed ? edge.b : edge.a,
            b: isReversed ? edge.a : edge.b,
            start: time,
            duration: 1.1,
            isStrong: false,
          });
        }
      }

      const hoverSet = highlightSet(currentLayout, engine.hoverId, currentPreview);
      const focusSet = new Set(
        isFocused ? [currentFocus, ...(currentLayout.neighbors[currentFocus] ?? [])] : [],
      );
      for (const id of currentLayout.ids) {
        let targetActivation = isFocused ? (focusSet.has(id) ? 1 : 0.18) : 0.75;
        if (hoverSet.size > 0)
          targetActivation = hoverSet.has(id) ? 1 : Math.min(targetActivation, 0.25);
        const current = engine.activation[id] ?? 0;
        engine.activation[id] = current + (targetActivation - current) * 0.1;
      }

      const backgroundContext = background.getContext("2d");
      const context = canvas.getContext("2d");
      if (!backgroundContext || !context) return;
      backgroundContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      drawParticles(backgroundContext, engine.particles, { width, height }, time, currentMotion);

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const result = drawGlobe({
        ctx: context,
        layout: currentLayout,
        view: { width, height, zoom: engine.zoom, insetRight: engine.insetRight },
        yaw: engine.yaw,
        pitch: engine.pitch,
        time,
        motion: currentMotion,
        focusId: currentFocus,
        focusStart: engine.focusStart,
        hoverSet,
        focusSet,
        activation: engine.activation,
        impulses: currentMotion > 0 ? engine.impulses : [],
        showSolutionLabels: true,
      });
      engine.hits = result.hits;
      engine.impulses = currentMotion > 0 ? result.impulses : [];
    };

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Arrastar gira (com inércia), roda aproxima, clique foca, passar o mouse destaca vizinhos.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const engine = engineRef.current;
    const localPoint = (event: PointerEvent | WheelEvent) => {
      const rect = stage.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      engine.drag = { x: event.clientX, y: event.clientY, dx: 0, dy: 0, hasMoved: false };
      engine.target = null;
      stage.setPointerCapture(event.pointerId);
    };
    const handlePointerMove = (event: PointerEvent) => {
      const { drag } = engine;
      if (drag) {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > CLICK_TOLERANCE_PX) drag.hasMoved = true;
        if (!drag.hasMoved) return;
        engine.yaw += dx * DRAG_SENSITIVITY;
        engine.pitch = Math.max(
          -MAX_PITCH,
          Math.min(MAX_PITCH, engine.pitch + dy * DRAG_SENSITIVITY),
        );
        engine.drag = { ...drag, x: event.clientX, y: event.clientY, dx, dy };
        setCursor("grabbing");
        return;
      }
      const { x, y } = localPoint(event);
      const hovered = pickNode(engine.hits, x, y);
      engine.hoverId = hovered;
      setCursor(hovered ? "pointer" : "grab");
    };
    const handlePointerUp = (event: PointerEvent) => {
      const { drag } = engine;
      engine.drag = null;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      if (!drag) return;
      if (drag.hasMoved) {
        engine.yawVelocity = drag.dx * DRAG_SENSITIVITY * 0.5;
        engine.pitchVelocity = drag.dy * DRAG_SENSITIVITY * 0.5;
        setCursor("grab");
        return;
      }
      const { x, y } = localPoint(event);
      const picked = pickNode(engine.hits, x, y);
      if (picked) latest.current.onPick(picked);
      else if (latest.current.focusId !== "core") {
        // Clique no vazio devolve o giro livre sem perder o caminho.
        engine.target = null;
      }
    };
    const handlePointerLeave = () => {
      if (!engine.drag) engine.hoverId = null;
    };
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      engine.targetZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, engine.targetZoom - event.deltaY * WHEEL_SENSITIVITY),
      );
    };

    stage.addEventListener("pointerdown", handlePointerDown);
    stage.addEventListener("pointermove", handlePointerMove);
    stage.addEventListener("pointerup", handlePointerUp);
    stage.addEventListener("pointerleave", handlePointerLeave);
    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      stage.removeEventListener("pointerdown", handlePointerDown);
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerup", handlePointerUp);
      stage.removeEventListener("pointerleave", handlePointerLeave);
      stage.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return { stageRef, canvasRef, backgroundRef, cursor };
}
