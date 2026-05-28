"use client";

import React from "react";
import { Plus, ChevronLeft, ChevronRight, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageWrapper } from "@/components/layout/page-wrapper";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

const dummyEvents = [
  {
    day: "Mon",
    start: 8,
    duration: 4,
    title: "Breakfast Chill",
    color: "bg-blue-500/10 text-blue-500 border-blue-200 dark:border-blue-900",
  },
  {
    day: "Mon",
    start: 12,
    duration: 5,
    title: "Lunch Energy",
    color:
      "bg-amber-500/10 text-amber-500 border-amber-200 dark:border-amber-900",
  },
  {
    day: "Wed",
    start: 17,
    duration: 4,
    title: "After Work Mix",
    color:
      "bg-purple-500/10 text-purple-500 border-purple-200 dark:border-purple-900",
  },
  {
    day: "Fri",
    start: 18,
    duration: 5,
    title: "Weekend Launch",
    color: "bg-rose-500/10 text-rose-500 border-rose-200 dark:border-rose-900",
  },
];

export default function SchedulePage() {
  return (
    <PageWrapper
      title="Schedule"
      description="Automate your venue's atmosphere."
      action={
        <div className="flex items-center space-x-3">
          <div className="flex bg-muted/50 rounded-md p-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-background"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-background"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            New Block
          </Button>
        </div>
      }
    >
      <Card className="bg-card border-border shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-[80px_1fr] border-b border-border sticky top-0 bg-card z-10">
            <div className="p-4 border-r border-border flex items-center justify-center">
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => (
                <div
                  key={day}
                  className="p-4 text-center font-bold border-r border-border last:border-r-0 text-xs tracking-widest uppercase text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Time Rows */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[80px_1fr] border-b border-border h-20 group"
              >
                <div className="p-2 text-[11px] text-muted-foreground text-right pr-4 font-mono font-bold flex items-center justify-end uppercase tracking-tighter">
                  {hour % 12 === 0 ? 12 : hour % 12} {hour >= 12 ? "pm" : "am"}
                </div>
                <div className="grid grid-cols-7">
                  {days.map((day) => (
                    <div
                      key={`${day}-${hour}`}
                      className="border-r border-border last:border-r-0 hover:bg-muted/30 transition-colors cursor-pointer group/cell relative"
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4 text-muted-foreground/50" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Absolute Events */}
            <div className="absolute top-0 left-[80px] right-0 bottom-0 pointer-events-none">
              <div className="grid grid-cols-7 h-full">
                {days.map((day) => (
                  // The borders here are visual guides, actual borders are on the grid cells
                  <div
                    key={`events-${day}`}
                    className="relative h-full border-r border-transparent last:border-r-0"
                  >
                    {dummyEvents
                      .filter((e) => e.day === day)
                      .map((event) => (
                        <div
                          key={`${day}-${event.start}`}
                          className={`absolute left-1.5 right-1.5 rounded-xl border-l-4 p-3 text-xs font-bold ${event.color} bg-card pointer-events-auto cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 z-20 group/event border-y border-r`}
                          style={{
                            top: `${(event.start - 8) * 80 + 4}px`,
                            height: `${event.duration * 80 - 8}px`,
                          }}
                        >
                          <div className="space-y-1">
                            <div className="truncate text-sm tracking-tight font-bold">
                              {event.title}
                            </div>
                            <div className="flex items-center opacity-70 font-medium">
                              <Clock className="w-3 h-3 mr-1" />
                              {event.start}:00 - {event.start + event.duration}
                              :00
                            </div>
                          </div>
                          <button className="opacity-0 group-hover/event:opacity-100 transition-opacity self-end bg-background/50 hover:bg-background p-1 rounded-md">
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
