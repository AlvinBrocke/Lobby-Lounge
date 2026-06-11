"use client";

import React from "react";
import { User, Sun, Moon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <PageWrapper
      title="Settings"
      description="Manage your venue and account preferences."
    >
      <div className="max-w-4xl space-y-6 pb-12">
        {/* Theme Section */}
        <Card className="bg-card border-border text-card-foreground rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "light" ? (
                <Sun className="w-5 h-5 text-primary" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
              Appearance
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose between light and dark mode for the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <button
              onClick={() => theme !== "light" && toggleTheme()}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                theme === "light"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <Sun className="w-8 h-8 mb-2" />
              <span className="text-sm font-semibold">Light</span>
            </button>
            <button
              onClick={() => theme !== "dark" && toggleTheme()}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                theme === "dark"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <Moon className="w-8 h-8 mb-2" />
              <span className="text-sm font-semibold">Dark</span>
            </button>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card className="bg-card border-border text-card-foreground shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Venue Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <span className="text-muted-foreground">Business Name</span>
              <span className="font-semibold text-foreground">My Venue</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <span className="text-muted-foreground">Email</span>
              <span className="font-semibold text-foreground">
                venue@lobbylounge.com
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Subscription Plan</span>
              <span className="text-primary font-bold">Premium Business</span>
            </div>
          </CardContent>
        </Card>

        {/* Plan Section */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 border-none text-primary-foreground shadow-lg">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-bold">Lobby Lounge Premium</h3>
              <p className="opacity-90 max-w-md">
                Full B2B licensing, offline mode, and unlimited zones.
              </p>
            </div>
            <Button
              variant="secondary"
              className="font-bold hover:scale-105 transition-transform rounded-full px-8 shadow-sm"
            >
              Manage Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
