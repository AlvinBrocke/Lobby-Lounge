"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { BRAND_COLORS, MAX_LOGO_BYTES, type BrandColor } from "@convex/lib/brand";
import { Modal, primaryButton, secondaryButton } from "@/components/playlists/Modal";
import { VenueAvatar } from "@/components/layout/VenueAvatar";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

const fieldLabel = "block text-[9px] font-bold uppercase tracking-[0.08em] text-faint mb-1.5";
const fieldBox =
  "w-full rounded-[7px] border border-primary/20 bg-background px-2.5 py-2 text-xs touch:text-base text-foreground outline-none focus:border-primary transition-colors";

type Profile = Doc<"userProfiles"> & { logoUrl: string | null };

/** "Brand your company profile": logo, company name, location and accent colour. */
export function BrandModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const generateUploadUrl = useMutation(api.userProfiles.generateLogoUploadUrl);
  const saveBrand = useMutation(api.userProfiles.saveBrand);
  const fileInput = useRef<HTMLInputElement>(null);

  const [venueName, setVenueName] = useState(profile.venueName ?? "");
  const [country, setCountry] = useState(profile.country ?? "");
  const [region, setRegion] = useState(profile.region ?? "");
  const [color, setColor] = useState<BrandColor>((profile.brandColor as BrandColor) ?? "teal");
  // undefined = keep the current logo, null = remove it, File = replace it.
  const [logo, setLogo] = useState<File | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A local preview of a picked file; the blob URL is released when it changes.
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!logo) return setFileUrl(null);
    const url = URL.createObjectURL(logo);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logo]);
  const preview = logo ? fileUrl : logo === null ? null : profile.logoUrl;

  function pickFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_LOGO_BYTES) {
      setError("Choose an image smaller than 2 MB.");
      return;
    }
    setError(null);
    setLogo(file);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      let logoId: Id<"_storage"> | null | undefined = logo === null ? null : undefined;
      if (logo) {
        const res = await fetch(await generateUploadUrl(), {
          method: "POST",
          headers: { "Content-Type": logo.type },
          body: logo,
        });
        if (!res.ok) throw new Error("upload failed");
        logoId = (await res.json()).storageId;
      }
      await saveBrand({ venueName, country: country || undefined, region, brandColor: color, logo: logoId });
      onClose();
    } catch (e) {
      setError(e instanceof ConvexError ? String(e.data) : "Couldn't save your brand. Please try again.");
      setSaving(false);
    }
  }

  return (
    <Modal title="Brand your company profile" onClose={onClose} className="max-w-md">
      <div className="space-y-4">
        <div className="flex items-center gap-3.5 rounded-xl border border-foreground/5 bg-secondary p-3.5">
          <VenueAvatar
            name={venueName || "Your venue"}
            logoUrl={preview}
            className="w-12 h-12 rounded-full text-sm shrink-0"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary/20 transition-colors"
            >
              {preview ? "Change logo" : "Upload avatar or logo"}
            </button>
            {preview && (
              <button
                type="button"
                onClick={() => setLogo(null)}
                className="px-3 py-1.5 rounded-lg text-muted-foreground text-[11px] font-semibold hover:text-foreground transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
        </div>

        <div>
          <label htmlFor="brand-name" className={fieldLabel}>
            Company name
          </label>
          <input id="brand-name" value={venueName} onChange={(e) => setVenueName(e.target.value)} maxLength={80} className={fieldBox} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="brand-country" className={fieldLabel}>
              Country
            </label>
            <select id="brand-country" value={country} onChange={(e) => setCountry(e.target.value)} className={fieldBox}>
              <option value="">—</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="brand-region" className={fieldLabel}>
              City / state
            </label>
            <input id="brand-region" value={region} onChange={(e) => setRegion(e.target.value)} className={fieldBox} />
          </div>
        </div>

        <fieldset>
          <legend className={fieldLabel}>Brand accent</legend>
          <div className="flex gap-2.5">
            {(Object.keys(BRAND_COLORS) as BrandColor[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setColor(key)}
                aria-label={key}
                aria-pressed={color === key}
                className={cn(
                  "w-7 h-7 touch:w-10 touch:h-10 rounded-full transition-shadow",
                  color === key && "ring-2 ring-offset-2 ring-offset-card ring-white",
                )}
                style={{ background: `hsl(${BRAND_COLORS[key]})` }}
              />
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
          <button type="button" onClick={save} disabled={saving || !venueName.trim()} className={primaryButton}>
            {saving ? "Saving…" : "Save company"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
