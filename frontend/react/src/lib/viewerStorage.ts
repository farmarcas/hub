// Pessoa escolhida no "Entrar como" (identificação simulada até a integração com o Radar).
const STORAGE_KEY = "hub.viewerId";

export function readViewerId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeViewerId(id: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Sem armazenamento (janela privada): a escolha vale só até recarregar.
  }
}
