"use client";
<<<<<<< HEAD
import React from "react";
import { CreditCard, Shield } from "lucide-react";

export default function AccountPage() {
  return (
    <div className="p-8 pb-32 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-8">Account & Settings</h1>

      {/* Subscription Card */}
      <div className="bg-gradient-to-br from-surface to-surface/50 border border-gray-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Active Plan
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Pro Business</h2>
            <p className="text-gray-400 mb-6">
              Next billing date: February 14, 2026
            </p>

            <div className="flex space-x-4">
              <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Manage Subscription
              </button>
              <button className="text-gray-400 hover:text-white px-4 py-2 transition-colors">
                View Invoices
              </button>
            </div>
          </div>

          <div className="text-right">
            <p className="text-3xl font-bold text-white">
              $49<span className="text-lg text-gray-500 font-normal">/mo</span>
            </p>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary" />
            Business Profile
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                Business Name
              </label>
              <input
                type="text"
                value="The Grand Lobby"
                disabled
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 mt-1 text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="text"
                value="manager@grandlobby.com"
                disabled
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 mt-1 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-primary" />
            Payment Method
          </h3>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center text-xs font-bold text-gray-400">
              VISA
            </div>
            <div>
              <p className="text-white font-medium">•••• •••• •••• 4242</p>
              <p className="text-xs text-gray-500">Expires 12/28</p>
            </div>
          </div>
          <button className="text-primary text-sm hover:underline">
            Update Payment Method
          </button>
        </div>
      </div>
    </div>
=======

import React from "react";
import { CreditCard, Shield } from "lucide-react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountPage() {
  return (
    <PageWrapper
      title="Account & Settings"
      description="Manage your business profile and subscription."
    >
      <div className="max-w-4xl space-y-8">
        {/* Subscription Card */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-8 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Active Plan
                </span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Pro Business
              </h2>
              <p className="text-muted-foreground mb-6">
                Next billing date: February 14, 2026
              </p>

              <div className="flex space-x-4">
                <Button variant="default" className="font-medium">
                  Manage Subscription
                </Button>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  View Invoices
                </Button>
              </div>
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">
                $49
                <span className="text-lg text-muted-foreground font-normal">
                  /mo
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Business Name
                </label>
                <div className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2 mt-1 text-muted-foreground cursor-not-allowed">
                  The Grand Lobby
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Email Address
                </label>
                <div className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2 mt-1 text-muted-foreground cursor-not-allowed">
                  manager@grandlobby.com
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="w-5 h-5 mr-2 text-primary" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">
                  VISA
                </div>
                <div>
                  <p className="text-foreground font-medium">
                    •••• •••• •••• 4242
                  </p>
                  <p className="text-xs text-muted-foreground">Expires 12/28</p>
                </div>
              </div>
              <Button variant="link" className="text-primary p-0 h-auto">
                Update Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
>>>>>>> feature/ui-ux
  );
}
