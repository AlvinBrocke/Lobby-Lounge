"use client";

import { useState } from "react";
import { Modal, secondaryButton } from "./Modal";

interface ConfirmDialogProps {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/** In-app replacement for `window.confirm`, used for destructive actions. */
export function ConfirmDialog({ title, message, confirmLabel, onClose, onConfirm }: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-muted-foreground mb-5">{message}</p>
      {error && <p className="text-xs text-destructive mb-3">{error}</p>}
      <div className="flex gap-3">
        <button onClick={onClose} className={secondaryButton}>
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={busy}
          className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {busy ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
