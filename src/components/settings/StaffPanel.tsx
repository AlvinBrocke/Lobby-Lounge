"use client";

import { useState } from "react";
import { useAuth, useOrganization, useOrganizationList } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { MapPin, UserPlus, X } from "lucide-react";
import { createVenueTeam, inviteStaff } from "@/app/(main)/settings/actions";
import { VenueAvatar } from "@/components/layout/VenueAvatar";
import { Modal, primaryButton, secondaryButton } from "@/components/playlists/Modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { describeClerkError } from "@/lib/clerkErrors";
import { STAFF_ROLES, roleLabel, type StaffRole } from "@/lib/staff";
import { cn } from "@/lib/utils";

const fieldLabel = "block text-[9px] font-bold uppercase tracking-[0.08em] text-faint mb-1.5";
const fieldBox =
  "w-full rounded-[7px] border border-primary/20 bg-card px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary transition-colors";
const smallButton =
  "shrink-0 flex items-center gap-1.5 px-3 py-2 touch:py-3 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-50";

/** The "Zone & staff" settings tab: the venue's one zone and its team (a Clerk organization). */
export function StaffPanel() {
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.userProfiles.get, isAuthenticated ? {} : "skip");
  const { isLoaded, organization } = useOrganization();
  const venueName = profile?.venueName || organization?.name || "Your venue";

  return (
    <div className="max-w-[820px] space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>Zones</CardTitle>
          <CardDescription>Each zone plays its own music. Your plan includes one.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-secondary p-3.5">
            <VenueAvatar name={venueName} logoUrl={profile?.logoUrl} className="w-10 h-10 rounded-lg text-xs shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-foreground truncate">{venueName}</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> Main zone
              </div>
            </div>
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-extrabold shrink-0">1 of 1 zones</span>
          </div>
        </CardContent>
      </Card>

      {!isLoaded ? (
        <div className="h-40 rounded-xl bg-muted animate-pulse" />
      ) : organization ? (
        <Team />
      ) : (
        <SetUpTeam />
      )}
    </div>
  );
}

function SetUpTeam() {
  const { setActive } = useOrganizationList();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setUp() {
    setBusy(true);
    setError(null);
    const res = await createVenueTeam();
    if (res.ok) await setActive?.({ organization: res.orgId });
    else setError(res.error);
    setBusy(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <CardDescription>
          Invite your managers and staff so they can run the music with their own login. They see the same
          playlists, schedule and announcements as you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <button onClick={setUp} disabled={busy} className={cn(smallButton, "bg-primary text-primary-foreground hover:opacity-90")}>
          <UserPlus className="w-3.5 h-3.5" />
          {busy ? "Setting up…" : "Set up your team"}
        </button>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Team() {
  const { userId, orgRole } = useAuth();
  const { organization, memberships, invitations } = useOrganization({
    memberships: { pageSize: 50 },
    invitations: { pageSize: 50, status: ["pending"] },
  });
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = orgRole === "org:admin";
  const ownerId = organization?.publicMetadata.venueOwnerId;

  // Clerk checks permissions on these calls too; hiding the buttons is only UX.
  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      await Promise.all([memberships?.revalidate?.(), invitations?.revalidate?.()]);
    } catch (e) {
      setError(describeClerkError(e));
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Team</CardTitle>
          <CardDescription>Everyone here signs in with their own email and runs the same venue.</CardDescription>
        </div>
        {isAdmin && (
          <button onClick={() => setInviting(true)} className={cn(smallButton, "bg-primary text-primary-foreground hover:opacity-90")}>
            <UserPlus className="w-3.5 h-3.5" />
            Invite
          </button>
        )}
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-white/5">
          {memberships?.data?.map((m) => {
            const memberId = m.publicUserData?.userId;
            const name = [m.publicUserData?.firstName, m.publicUserData?.lastName].filter(Boolean).join(" ");
            const email = m.publicUserData?.identifier ?? "";
            const isOwner = memberId === ownerId;
            return (
              <li key={m.id} className="flex items-center gap-3 py-2.5">
                <VenueAvatar name={name || email} className="w-8 h-8 rounded-full text-[10px] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">
                    {name || email}
                    {memberId === userId && <span className="text-muted-foreground font-medium"> (you)</span>}
                  </div>
                  {name && <div className="text-[11px] text-muted-foreground truncate">{email}</div>}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground shrink-0">{isOwner ? "Owner" : roleLabel(m.role)}</span>
                {isAdmin && !isOwner && memberId !== userId && (
                  <button
                    onClick={() => run(() => m.destroy())}
                    aria-label={`Remove ${name || email}`}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-white/5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </li>
            );
          })}
          {invitations?.data?.map((inv) => (
            <li key={inv.id} className="flex items-center gap-3 py-2.5">
              <span className="w-8 h-8 rounded-full border border-dashed border-white/20 shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-foreground truncate">{inv.emailAddress}</div>
                <div className="text-[11px] text-muted-foreground">Invitation sent</div>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground shrink-0">{roleLabel(inv.role)}</span>
              {isAdmin && (
                <button
                  onClick={() => run(() => inv.revoke())}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
        {error && (
          <p role="alert" className="text-xs text-destructive mt-2">
            {error}
          </p>
        )}
      </CardContent>

      {inviting && <InviteModal onClose={() => setInviting(false)} onSent={() => invitations?.revalidate?.()} />}
    </Card>
  );
}

function InviteModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("org:member");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const res = await inviteStaff(email, role);
    setSending(false);
    if (!res.ok) return setError(res.error);
    onSent();
    onClose();
  }

  return (
    <Modal title="Invite a team member" onClose={onClose} className="max-w-md">
      <form onSubmit={send} className="space-y-4">
        <div>
          <label htmlFor="invite-email" className={fieldLabel}>
            Email
          </label>
          <input
            id="invite-email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className={fieldBox}
          />
        </div>
        <fieldset>
          <legend className={fieldLabel}>Role</legend>
          <div className="space-y-2">
            {STAFF_ROLES.map((r) => (
              <label
                key={r.key}
                className={cn(
                  "flex items-start gap-2.5 rounded-lg border p-3 cursor-pointer transition-colors",
                  role === r.key ? "border-primary bg-primary/5" : "border-white/10 hover:bg-white/5",
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.key}
                  checked={role === r.key}
                  onChange={() => setRole(r.key)}
                  className="mt-0.5 accent-[hsl(var(--primary))]"
                />
                <span>
                  <span className="block text-xs font-bold text-foreground">{r.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{r.blurb}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
        <div className="flex gap-2.5 pt-1">
          <button type="button" onClick={onClose} className={secondaryButton}>
            Cancel
          </button>
          <button type="submit" disabled={sending} className={primaryButton}>
            {sending ? "Sending…" : "Send invite"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
