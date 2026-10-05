import React from "react";
import { CalendarSync, CreditCard, CircleCheck, Coffee } from "lucide-react";

const items = [
  { label: "Curated weekly", icon: CalendarSync },
  { label: "No credit card to start", icon: CreditCard },
  { label: "Cancel anytime", icon: CircleCheck },
  { label: "Built for hospitality", icon: Coffee },
];

export const TrustSection = () => (
  <div className="border-y border-ll-line bg-ll-paper-2 py-6">
    <div className="ll-container flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
      <span className="text-sm text-ll-text-2">Made for hospitality</span>
      <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
        {items.map(({ label, icon: Icon }) => (
          <li key={label} className="flex items-center gap-2 text-[15px] font-medium text-ll-text">
            <Icon className="h-4 w-4 text-ll-teal-ink" strokeWidth={1.75} aria-hidden />
            {label}
          </li>
        ))}
      </ul>
    </div>
  </div>
);
