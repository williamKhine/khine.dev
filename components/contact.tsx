"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const copyMessages = {
  idle: "",
  success: "Email copied.",
  failure: "Copy unavailable. You can select the email address to copy it.",
};

export function Contact({ email }: { email: string }) {
  const [status, setStatus] = useState<keyof typeof copyMessages>("idle");

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setStatus("success");
    } catch {
      setStatus("failure");
    }
  }

  return (
    <div>
      <div className="email-actions">
        <a href={`mailto:${email}`} className="email-link"><Mail aria-hidden="true" />{email}</a>
        <Button type="button" variant="outline" size="icon-lg" aria-label="Copy email address" onClick={copyEmail}>
          {status === "success" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </Button>
      </div>
      <p className="copy-status" role="status">{copyMessages[status]}</p>
    </div>
  );
}
