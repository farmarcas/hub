import { describe, expect, it } from "vitest";
import { focusAngles, globeInset, panelWidth, project, rotate } from "./projection";
import { normalize, type Vec3 } from "./vector";

const view = { width: 800, height: 600, zoom: 1 };

describe("project", () => {
  it("põe o centro do globo no meio da tela", () => {
    expect(project([0, 0, 0], view)).toEqual({ x: 400, y: 308, z: 0, k: 1 });
  });

  it("aumenta o que está na frente e diminui o que está atrás", () => {
    expect(project([0, 0, 1], view).k).toBeGreaterThan(1);
    expect(project([0, 0, -1], view).k).toBeLessThan(1);
  });

  it("centraliza na área visível quando o painel cobre a direita", () => {
    expect(project([0, 0, 0], { ...view, insetRight: 300 }).x).toBe(250);
  });
});

describe("globeInset", () => {
  it("desvia do painel só quando sobra espaço para o globo", () => {
    expect(globeInset(1216, true)).toBe(380);
    expect(globeInset(1216, false)).toBe(0);
    // Celular (375 − 64 de menu): o painel cobre o globo por cima.
    expect(globeInset(311, true)).toBe(0);
  });
});

describe("panelWidth", () => {
  it("segue o clamp(300px, 32%, 380px) do painel", () => {
    expect(panelWidth(600)).toBe(300);
    expect(panelWidth(1000)).toBe(320);
    expect(panelWidth(1600)).toBe(380);
  });
});

describe("focusAngles", () => {
  it("traz qualquer direção para a frente do globo", () => {
    const direction = normalize([0.6, 0.3, -0.7]);
    const { yaw, pitch } = focusAngles(direction, 0);
    const [x, y, z] = rotate(direction as Vec3, yaw, pitch);

    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(0);
    expect(z).toBeCloseTo(1);
  });

  it("gira pelo caminho mais curto a partir do ângulo atual", () => {
    const { yaw } = focusAngles([0, 0, 1], 6);

    expect(Math.abs(yaw - 6)).toBeLessThanOrEqual(Math.PI);
  });
});
