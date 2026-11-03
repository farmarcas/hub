export function GlobeLegend() {
  return (
    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
      <p className="flex items-center gap-2">
        <span aria-hidden="true" className="size-3 rounded-full border-2 border-primary" />
        Tema · órbita interna
      </p>
      <p className="flex items-center gap-2">
        <span aria-hidden="true" className="mx-px size-2.5 rotate-45 border-2 border-accent-soft" />
        Diretoria · órbita interna
      </p>
      <p className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="mx-0.5 size-2 rounded-full bg-primary-hover shadow-glow-sm"
        />
        Solução · superfície
      </p>
      <p className="mt-1 text-subtle-foreground">
        Arraste para girar · role para aproximar · Esc volta
      </p>
    </div>
  );
}
