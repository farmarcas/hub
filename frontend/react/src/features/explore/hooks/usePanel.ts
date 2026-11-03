import { useCallback, useEffect, useRef, useState } from "react";

const CLOSE_DELAY_MS = 250;

// Painel de detalhes: abre ao passar o mouse no ícone e fecha pouco depois que ele sai.
// Clicar no ícone (ou numa solução) fixa; o X fecha.
export function usePanel() {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  const cancelClose = () => window.clearTimeout(closeTimer.current);

  const enter = useCallback(() => {
    cancelClose();
    setIsHovering(true);
  }, []);

  const leave = useCallback(() => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setIsHovering(false), CLOSE_DELAY_MS);
  }, []);

  const close = useCallback(() => {
    cancelClose();
    setIsPinned(false);
    setIsHovering(false);
  }, []);

  useEffect(() => cancelClose, []);

  return {
    isOpen: isPinned || isHovering,
    isPinned,
    pin: useCallback(() => setIsPinned(true), []),
    togglePin: useCallback(() => setIsPinned((value) => !value), []),
    enter,
    leave,
    close,
  };
}
