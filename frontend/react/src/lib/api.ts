import { readViewerId } from "./viewerStorage";

const VIEWER_HEADER = "x-hub-user";
const NETWORK_ERROR = "Não foi possível falar com o servidor. Confira se o ambiente está no ar.";

type ErrorBody = { error?: { code?: string; message?: string; details?: unknown[] } };

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown[];

  constructor(status: number, code: string, message: string, details: unknown[] = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const viewerId = readViewerId();
  if (viewerId) headers[VIEWER_HEADER] = viewerId;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", NETWORK_ERROR);
  }

  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const { error } = payload as ErrorBody;
    throw new ApiError(
      response.status,
      error?.code ?? "UNKNOWN_ERROR",
      error?.message ?? "Algo deu errado. Tente de novo.",
      error?.details ?? [],
    );
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body ?? {}),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  delete: (path: string) => request<void>("DELETE", path),
};

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Algo deu errado. Tente de novo.";
}
