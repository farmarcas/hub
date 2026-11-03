import { Search } from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import type { Graph } from "@/types/api";
import { searchGraph } from "../lib/search";

type GlobeSearchProps = { graph: Graph; onSelect: (id: string) => void };

// Combobox acessível: setas escolhem, Enter abre, Esc limpa.
export function GlobeSearch({ graph, onSelect }: GlobeSearchProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const results = useMemo(() => searchGraph(graph, query), [graph, query]);
  const isOpen = query.trim().length > 0;

  const choose = (id: string) => {
    onSelect(id);
    setQuery("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      const result = results[activeIndex];
      if (result) choose(result.id);
    } else if (event.key === "Escape") {
      setQuery("");
    }
  };

  return (
    <div className="relative w-[260px] max-w-full">
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle-foreground"
      />
      <input
        type="search"
        role="combobox"
        aria-label="Buscar temas, diretorias e soluções"
        aria-expanded={isOpen}
        aria-controls="globe-search-results"
        aria-activedescendant={
          isOpen && results[activeIndex] ? `globe-result-${activeIndex}` : undefined
        }
        placeholder="Buscar no globo"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={handleKeyDown}
        className="h-9 w-full rounded-md border border-border-strong bg-surface pr-3 pl-9 text-sm text-foreground backdrop-blur-md placeholder:text-subtle-foreground focus-visible:border-primary-border focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
      />
      {isOpen && (
        <ul
          id="globe-search-results"
          role="listbox"
          className="absolute top-11 right-0 left-0 z-30 overflow-hidden rounded-md border border-border-strong bg-surface py-1 backdrop-blur-xl"
        >
          {results.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">Nada encontrado.</li>
          )}
          {results.map((result, index) => (
            <li
              key={result.id}
              id={`globe-result-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(result.id)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm",
                index === activeIndex && "bg-primary-tint",
              )}
            >
              <span className="truncate">{result.name}</span>
              <span className="text-[10px] font-semibold tracking-[0.14em] text-subtle-foreground">
                {result.kind}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
