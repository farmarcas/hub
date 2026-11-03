import { Fragment } from "react";
import { cn } from "@/lib/cn";

type BreadcrumbProps = {
  items: { id: string; name: string }[];
  onSelect: (id: string) => void;
};

export function Breadcrumb({ items, onSelect }: BreadcrumbProps) {
  return (
    <nav aria-label="Caminho no globo">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <Fragment key={item.id}>
              {index > 0 && (
                <li aria-hidden="true" className="text-separator">
                  /
                </li>
              )}
              <li>
                <button
                  type="button"
                  aria-current={isCurrent ? "location" : undefined}
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "rounded-sm px-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    isCurrent
                      ? "text-primary-hover"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.name}
                </button>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
