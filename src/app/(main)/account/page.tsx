"use client";

import React from "react";
import { CreditCard, Shield } from "lucide-react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";

export default function AccountPage() {
  const { user } = useUser();

  const businessName = user?.fullName ?? "Your Business";
  const email = user?.primaryEmailAddress?.emailAddress ?? "—";

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
                  {businessName}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Email Address
                </label>
                <div className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2 mt-1 text-muted-foreground cursor-not-allowed">
                  {email}
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
  );
}
