"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { KeyRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const inputClass =
  "w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

const labelClass =
  "block text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1";

/**
 * Lets any user set or change their password.
 *
 * Accounts created via Google have `passwordEnabled === false`. Clerk lets
 * them set one with `updatePassword({ newPassword })` — no current password
 * needed. Once a password exists, Clerk requires `currentPassword` to change it.
 */
export function PasswordCard() {
  const { user, isLoaded } = useUser();
  const hasPassword = user?.passwordEnabled ?? false;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSuccess(null);

    if (newPassword !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSaving(true);
    try {
      await user.updatePassword({
        newPassword,
        ...(hasPassword ? { currentPassword } : {}),
        signOutOfOtherSessions: true,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      // `user.passwordEnabled` flips to true after this, so decide the message now
      setSuccess(hasPassword ? "Password updated!" : "Password set!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0].longMessage ?? err.errors[0].message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="bg-card border-border text-card-foreground shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary" />
          {hasPassword ? "Change Password" : "Set a Password"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {hasPassword
            ? "Update the password you use to sign in with your email."
            : "You signed up with Google. Add a password so you can also sign in with your email address."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoaded ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
            {hasPassword && (
              <div>
                <label className={labelClass}>Current Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="text-[11px] font-bold px-4 py-2 rounded-lg bg-primary text-[#04201d] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Saving…" : hasPassword ? "Update password" : "Set password"}
              </button>
              {success && (
                <span className="text-[11px] font-semibold text-primary">{success}</span>
              )}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
