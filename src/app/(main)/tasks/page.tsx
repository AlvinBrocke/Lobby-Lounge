"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { useSetupTasks } from "@/hooks/useSetupTasks";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const { tasks, remaining, loading } = useSetupTasks();
  const done = tasks.length - remaining;

  return (
    <PageWrapper
      title="Tasks"
      description="Complete these steps to get the most out of Lobby & Lounge."
      action={
        <div className="min-w-[180px]">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
            <span>Setup progress</span>
            <span className={cn("font-bold", remaining === 0 ? "text-primary" : "text-foreground")}>
              {loading ? "…" : `${done} of ${tasks.length}`}
            </span>
          </div>
          <div className="h-1.5 rounded bg-card overflow-hidden">
            <div
              className="h-full bg-primary transition-[width] duration-200"
              style={{ width: loading ? 0 : `${(done / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      }
    >
      {!loading && remaining === 0 && (
        <div className="flex items-center gap-2.5 px-4 py-3 mb-3 rounded-[10px] bg-primary/10 border border-primary/25">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          </span>
          <div>
            <div className="text-[13px] font-bold text-primary">Setup complete</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Your venue is ready to go.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {tasks.map((task) => (
          <div
            key={task.key}
            className={cn(
              "flex flex-col min-h-[156px] p-[17px] rounded-xl border shadow-[0_5px_20px_rgba(0,0,0,0.22)]",
              task.done ? "bg-primary/10 border-primary/25" : "bg-secondary border-white/[0.06]",
            )}
          >
            <div className="flex justify-between items-start gap-3">
              <div>
                <div
                  className={cn(
                    "text-[10px] font-extrabold uppercase tracking-[0.12em]",
                    task.done ? "text-primary" : "text-faint",
                  )}
                >
                  {task.eyebrow}
                </div>
                <div className="text-sm font-extrabold text-foreground mt-1">{task.title}</div>
              </div>
              <span
                aria-label={task.done ? "Done" : "Not done yet"}
                className={cn(
                  "w-[22px] h-[22px] shrink-0 rounded-md border flex items-center justify-center",
                  task.done ? "bg-primary border-primary text-primary-foreground" : "border-faint",
                )}
              >
                {task.done && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
              </span>
            </div>
            <p className="flex-1 text-xs text-muted-foreground leading-relaxed mt-2.5 mb-4">{task.description}</p>
            <Link
              href={task.href}
              className={cn(
                "self-start px-3 py-2 rounded-lg border border-primary/25 text-[11px] font-extrabold transition-opacity hover:opacity-90",
                task.done ? "text-primary" : "bg-primary text-primary-foreground",
              )}
            >
              {task.button}
            </Link>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
