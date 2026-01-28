"use client";

import React from "react";
import { User, Shield, Bell, Moon, Sun, Monitor } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const { theme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-400">
          Manage your venue and account preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Section */}
        <Card className="bg-card border-border text-card-foreground rounded-2xl overflow-hidden shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Lobby Lounge uses a light theme.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <button
              className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-primary bg-accent/50 text-foreground"
              disabled
            >
              <Sun className="w-8 h-8 mb-2" />
              <span className="text-sm font-semibold">Light</span>
            </button>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card className="bg-card border-border text-card-foreground shadow-xl rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Venue Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Business Name</span>
              <span className="font-semibold">My Venue</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Email</span>
              <span className="font-semibold">venue@lobbylounge.com</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Subscription Plan</span>
              <span className="text-primary font-bold">Premium Business</span>
            </div>
          </CardContent>
        </Card>

        {/* Plan Section */}
        <Card className="bg-gradient-to-r from-indigo-900 to-blue-900 border-none text-white">
          <CardContent className="p-8 flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Lobby Lounge Premium</h3>
              <p className="opacity-80">
                Full B2B licensing, offline mode, and unlimited zones.
              </p>
            </div>
            <Button className="bg-white text-black font-bold hover:scale-105 transition-transform rounded-full px-8">
              Manage Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
