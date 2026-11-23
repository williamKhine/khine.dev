"use client";

import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { reservationValidationError, resumePortfolioUrl } from "@/lib/resume-codes";

type Reservation = Doc<"resumeVersions">;

const inputClass = "w-full rounded-md border border-border bg-background px-3 py-2";

export function Reservations() {
  const reservations = useQuery(api.resumeReservations.list);
  const [editing, setEditing] = useState<Reservation | null>(null);

  if (!reservations) return <p role="status">Loading reservations…</p>;

  return (
    <section className="space-y-6" aria-labelledby="resume-versions">
      <h2 id="resume-versions" className="font-display text-3xl">Résumé Versions</h2>
      <ReservationForm key={editing?._id ?? "new"} reservation={editing} onClose={() => setEditing(null)} />
      <ul className="divide-y divide-border border-t border-border">
        {reservations.map((reservation) => (
          <ReservationRow key={`${reservation._id}:${reservation.code}`} reservation={reservation} onEdit={() => setEditing(reservation)} />
        ))}
      </ul>
    </section>
  );
}

function ReservationForm({ reservation, onClose }: { reservation: Reservation | null; onClose: () => void }) {
  const save = useMutation(api.resumeReservations.save);
  const [label, setLabel] = useState(reservation?.label ?? "");
  const [code, setCode] = useState(reservation?.code ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function generateCode() {
    const bytes = crypto.getRandomValues(new Uint8Array(3));
    setCode(Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(""));
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = reservationValidationError(label, code);
    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);
    setError("");
    try {
      await save({ id: reservation?._id, label, code });
      setLabel("");
      setCode("");
      onClose();
    } catch (error) {
      setError(error instanceof ConvexError && typeof error.data === "string" ? error.data : "Could not save the reservation.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-border p-5" aria-label={reservation ? "Edit reservation" : "Reserve a Résumé Code"}>
      <h3 className="text-lg font-medium">{reservation ? "Edit reservation" : "Reserve a Résumé Code"}</h3>
      <fieldset disabled={pending} className="min-w-0 space-y-4">
        <div>
          <label htmlFor="application-label" className="mb-1 block text-sm font-medium">Application label</label>
          <input id="application-label" value={label} onChange={(event) => { setLabel(event.target.value); setError(""); }} className={inputClass} />
        </div>
        <div>
          <label htmlFor="resume-code" className="mb-1 block text-sm font-medium">Résumé Code</label>
          <div className="flex flex-wrap items-center gap-2">
            <input id="resume-code" value={code} onChange={(event) => { setCode(event.target.value); setError(""); }} className={`${inputClass} max-w-40 font-mono`} autoCapitalize="off" autoComplete="off" spellCheck={false} aria-describedby="code-hint" />
            <Button type="button" variant="outline" onClick={generateCode}>Generate code</Button>
          </div>
          <p id="code-hint" className="mt-1 text-sm text-secondary-foreground">Six hexadecimal characters. Case matters.</p>
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit">{reservation ? "Save changes" : "Reserve code"}</Button>
          {reservation && <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>}
        </div>
      </fieldset>
    </form>
  );
}

function ReservationRow({ reservation, onEdit }: { reservation: Reservation; onEdit: () => void }) {
  const [copyStatus, setCopyStatus] = useState("");
  const url = resumePortfolioUrl(reservation.code);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus("Link copied.");
    } catch {
      setCopyStatus("Could not copy the link. Select the URL to copy it manually.");
    }
  }

  return (
    <li className="space-y-2 py-4">
      <h3 className="font-medium">{reservation.label}</h3>
      <label className="block text-sm">
        Portfolio URL
        <input aria-label={`Portfolio URL for ${reservation.label}`} className={`${inputClass} mt-1 font-mono`} readOnly value={url} onFocus={(event) => event.currentTarget.select()} />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={copyLink}>Copy link</Button>
        <Button type="button" variant="ghost" onClick={onEdit}>Edit</Button>
        {copyStatus && <span role="status" className="text-sm">{copyStatus}</span>}
      </div>
    </li>
  );
}
