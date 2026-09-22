"use client";

import { useState } from "react";
import { Modal, primaryButton, secondaryButton } from "./Modal";

// Mirrors the server-side limits in convex/playlists.ts.
const MAX_NAME = 80;
const MAX_DESCRIPTION = 300;

export interface PlaylistFormValues {
  name: string;
  description: string;
}

interface PlaylistFormModalProps {
  mode: "create" | "edit";
  initial?: PlaylistFormValues;
  onClose: () => void;
  onSubmit: (values: PlaylistFormValues) => Promise<void>;
}

const fieldClass =
  "w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition";

const labelClass =
  "text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2";

export function PlaylistFormModal({ mode, initial, onClose, onSubmit }: PlaylistFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
    } catch {
      setError("Couldn't save the playlist. Please try again.");
      setSaving(false);
    }
  }

  return (
    <Modal title={mode === "create" ? "New Playlist" : "Edit Playlist"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="playlist-name" className={labelClass}>
            Playlist Name
          </label>
          <input
            id="playlist-name"
            autoFocus
            type="text"
            maxLength={MAX_NAME}
            placeholder="e.g. Friday Evening Vibes"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="playlist-description" className={labelClass}>
            Description <span className="normal-case tracking-normal font-normal">(optional)</span>
          </label>
          <textarea
            id="playlist-description"
            rows={3}
            maxLength={MAX_DESCRIPTION}
            placeholder="What's this playlist for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${fieldClass} resize-none`}
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={secondaryButton}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit} className={primaryButton}>
            {saving ? "Saving…" : mode === "create" ? "Create" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
