"use client";
import React from "react";
import { Plus } from "lucide-react";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const timeSlots = ["08:00 AM", "12:00 PM", "04:00 PM", "08:00 PM"];

export default function SchedulePage() {
  return (
    <div className="p-8 pb-32">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Music Schedule</h1>
          <p className="text-gray-400">
            Automate your lobby atmosphere for the week.
          </p>
        </div>
        <button className="bg-primary hover:bg-secondary text-black px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add Schedule
        </button>
      </div>

      <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-800 bg-gray-900/50">
          <div className="p-4 text-gray-400 font-medium text-sm">Time</div>
          {days.map((day) => (
            <div
              key={day}
              className="p-4 text-gray-400 font-medium text-sm border-l border-gray-800 text-center"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="divide-y divide-gray-800">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="grid grid-cols-8 hover:bg-white/5 transition-colors group"
            >
              <div className="p-4 text-gray-500 text-sm font-medium">
                {time}
              </div>
              {days.map((day, index) => (
                <div
                  key={day}
                  className="border-l border-gray-800 p-2 relative h-24"
                >
                  {/* Mock Scheduled Item */}
                  {index % 2 === 0 && index !== 6 && (
                    <div className="bg-primary/20 border border-primary/30 rounded p-2 h-full text-xs flex flex-col justify-between cursor-pointer hover:bg-primary/30 transition-colors">
                      <span className="font-semibold text-primary truncate">
                        Morning Boost
                      </span>
                      <span className="text-primary/70">
                        {time} - {parseInt(time) + 4}:00
                      </span>
                    </div>
                  )}

                  {/* Empty State Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                    <Plus className="text-gray-600 w-6 h-6" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
