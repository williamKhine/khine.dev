"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { isResumeCode, MAX_RESUME_PDF_BYTES, reservationValidationError, resumePortfolioUrl } from "@/lib/resume-codes";

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
  const available = useQuery(api.resumeReservations.availability, isResumeCode(code) ? { code, id: reservation?._id } : "skip");
  const feedback = error || (code && !isResumeCode(code)
    ? "Enter exactly six hexadecimal characters (0–9, A–F or a–f)."
    : available === false ? "This exact Résumé Code is already in use." : "");

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
        {feedback && <p role="alert" className="text-sm text-destructive">{feedback}</p>}
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
  const uploadPdf = useAction(api.resumeReservations.uploadPdf);
  const publish = useMutation(api.resumeReservations.publish);
  const retire = useMutation(api.resumeReservations.retire);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const published = reservation.publishedAt !== undefined;
  const archived = reservation.archivedAt !== undefined;
  const revoked = reservation.revokedAt !== undefined;
  const revision = reservation.codeRevision ?? 0;

  async function run(operation: () => Promise<unknown>) {
    setError("");
    setPending(true);
    try {
      await operation();
    } catch (error) {
      setError(error instanceof ConvexError && typeof error.data === "string" ? error.data : "Could not update the Résumé Version.");
    } finally {
      setPending(false);
    }
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = new FormData(form).get("pdf");
    if (!(file instanceof File) || !file.size || file.size > MAX_RESUME_PDF_BYTES) {
      setError("Choose a PDF no larger than 2 MB.");
      return;
    }
    await run(async () => {
      const bytes = await file.arrayBuffer();
      await uploadPdf({ id: reservation._id, code: reservation.code, revision, bytes });
      form.reset();
    });
  }

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
      <p className="text-sm">{revoked ? "Revoked" : archived ? "Archived · link active" : published ? "Published" : reservation.pdf ? "PDF attached" : "Reserved · upload the PDF"}</p>
      {!archived && !revoked && <label className="block text-sm">
        Portfolio URL
        <input aria-label={`Portfolio URL for ${reservation.label}`} className={`${inputClass} mt-1 font-mono`} readOnly value={url} onFocus={(event) => event.currentTarget.select()} />
      </label>}
      <div className="flex flex-wrap items-center gap-2">
        {!archived && !revoked && <Button type="button" variant="outline" onClick={copyLink}>Copy link</Button>}
        {!published && <Button type="button" variant="ghost" onClick={onEdit}>Edit</Button>}
        {published && !archived && !revoked && <Button variant="outline" disabled={pending} onClick={() => run(() => retire({ id: reservation._id, operation: "archive" }))}>Archive</Button>}
        {published && !revoked && <Button variant="destructive" disabled={pending} onClick={() => {
          if (window.confirm("Revoke this Résumé Code permanently?")) void run(() => retire({ id: reservation._id, operation: "revoke" }));
        }}>Revoke code</Button>}
        {copyStatus && <span role="status" className="text-sm">{copyStatus}</span>}
      </div>
      {!published && (
        <form onSubmit={upload} className="flex flex-wrap items-end gap-2">
          <label className="block min-w-0 text-sm">Résumé PDF
            <input type="file" name="pdf" accept="application/pdf,.pdf" className={`${inputClass} mt-1`} disabled={pending} required />
          </label>
          <Button variant="outline" disabled={pending} type="submit">Upload PDF</Button>
        </form>
      )}
      {!published && reservation.pdf && <Button disabled={pending} onClick={() => {
        const pdf = reservation.pdf;
        if (pdf) void run(() => publish({ id: reservation._id, revision, pdf }));
      }}>Publish résumé</Button>}
      {error && <p role="alert">{error}</p>}
    </li>
  );
}
