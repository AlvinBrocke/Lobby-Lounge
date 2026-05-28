import { cn } from "@/lib/utils";
import React from "react";

interface PageWrapperProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageWrapper({
  title,
  description,
  children,
  action,
  className,
}: PageWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-8 w-full", className)}>
      {/* Header Section (Only render if title or action exists) */}
      {(title || action) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
