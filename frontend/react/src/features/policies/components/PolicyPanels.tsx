import { Check } from "lucide-react";
import { Eyebrow } from "@/components/ui/Card";
import {
  ARCHIVING_RULE,
  CREATE_STEPS,
  LIFECYCLE,
  PUBLISH_CHECKLIST,
  PUBLISH_FLOW,
  ROLES,
} from "../content";

export function CreatePanel() {
  return (
    <ol className="grid gap-4 md:grid-cols-2">
      {CREATE_STEPS.map((step, index) => (
        <li key={step.title} className="flex gap-4 rounded-lg border border-border-subtle p-4">
          <span className="text-2xl font-light text-primary">{index + 1}</span>
          <div>
            <h3 className="font-medium">{step.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function PublishPanel() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section>
        <Eyebrow>Checklist de publicação</Eyebrow>
        <ul className="mt-3 flex flex-col gap-2">
          {PUBLISH_CHECKLIST.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-soft-foreground">
              <Check size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <Eyebrow>Fluxo no Hub</Eyebrow>
        <ol className="mt-3 flex flex-col gap-3">
          {PUBLISH_FLOW.map((step, index) => (
            <li key={step.title} className="flex gap-3 text-sm">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary-border text-xs text-primary-hover">
                {index + 1}
              </span>
              <p className="text-soft-foreground">
                <strong className="font-medium text-foreground">{step.title}</strong> {step.text}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export function GovernancePanel() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <Eyebrow>Ciclo de vida</Eyebrow>
        <ol className="mt-3 grid gap-2 sm:grid-cols-5">
          {LIFECYCLE.map((item) => (
            <li key={item.stage} className="rounded-lg border border-border-subtle p-3">
              <p className="text-sm font-medium text-primary-hover">{item.stage}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.who}</p>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <Eyebrow>Papéis</Eyebrow>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {ROLES.map((item) => (
            <div key={item.role} className="rounded-lg border border-border-subtle p-3">
              <dt className="text-sm font-medium">{item.role}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{item.text}</dd>
            </div>
          ))}
        </dl>
      </section>
      <p className="rounded-lg border border-primary-border bg-primary-wash p-3 text-sm text-soft-foreground">
        {ARCHIVING_RULE}
      </p>
    </div>
  );
}
