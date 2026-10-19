import { Check } from "lucide-react";

const STEPS = ["Account", "Verify", "Business", "Preferences"];

/** The design's 4-dot progress bar, shared by sign-up (1–2) and onboarding (3–4). */
export function StepBar({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <ol
      aria-label={`Step ${step} of ${STEPS.length}: ${STEPS[step - 1]}`}
      style={{ display: "flex", alignItems: "center", gap: 8, listStyle: "none", margin: "0 0 24px", padding: 0 }}
    >
      {STEPS.map((name, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <li key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              title={name}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--ll-font-body)",
                fontSize: 11,
                fontWeight: 700,
                border: `1.5px solid ${n <= step ? "var(--ll-accent)" : "var(--ll-auth-line)"}`,
                background: current ? "var(--ll-accent)" : done ? "var(--ll-auth-ghost)" : "transparent",
                color: current ? "var(--ll-accent-ink)" : done ? "var(--ll-accent)" : "var(--ll-auth-muted)",
              }}
            >
              {done ? <Check style={{ width: 12, height: 12 }} strokeWidth={3} /> : n}
            </span>
            {n < STEPS.length && (
              <span
                style={{
                  width: 18,
                  height: 1.5,
                  borderRadius: 1,
                  background: done ? "var(--ll-accent)" : "var(--ll-auth-line)",
                }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
