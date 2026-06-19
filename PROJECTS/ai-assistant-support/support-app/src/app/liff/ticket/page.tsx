"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import liff from "@line/liff";

/**
 * LIFF Ticket Intake page.
 *
 * On mount:
 *   1. Initialise LIFF and retrieve the LINE user ID.
 *   2. Check whether the user has bound to a client (GET /api/liff/me).
 *   3. If not bound → redirect to /liff/bind.
 *   4. If bound → show the ticket intake form.
 */

type TicketState =
  | { status: "loading" }
  | { status: "unbound" }
  | {
      status: "ready";
      clientId: string;
      clientSlug: string;
      clientName: string;
      lineUserId: string;
    }
  | {
      status: "submitting";
      clientId: string;
      clientSlug: string;
      clientName: string;
      lineUserId: string;
    }
  | { status: "success"; ticketCode: string }
  | { status: "error"; message: string };

const TICKET_TYPES = [
  { value: "bug", label: "Bug" },
  { value: "error", label: "Error" },
  { value: "complaint", label: "Complaint" },
  { value: "question", label: "Question" },
  { value: "feature", label: "Feature Request" },
] as const;

const TICKET_SEVERITIES = [
  { value: "P0", label: "P0 — Critical", description: "System down / data loss" },
  { value: "P1", label: "P1 — High", description: "Major feature broken, no workaround" },
  { value: "P2", label: "P2 — Medium", description: "Minor issue, has workaround" },
  { value: "P3", label: "P3 — Low", description: "Cosmetic / nice-to-have" },
] as const;

export default function LiffTicketPage() {
  const [state, setState] = useState<TicketState>({ status: "loading" });

  // Form fields
  const [type, setType] = useState<string>("bug");
  const [severity, setSeverity] = useState<string>("P2");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const checkBinding = useCallback(async () => {
    try {
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID ?? "" });

      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const idToken = liff.getDecodedIDToken();
      const lineUserId = idToken?.sub;

      if (!lineUserId) {
        setState({
          status: "error",
          message: "Unable to retrieve LINE user ID.",
        });
        return;
      }

      // Check binding status
      const res = await fetch(
        `/api/liff/me?lineUserId=${encodeURIComponent(lineUserId)}`,
      );
      const data = await res.json();

      if (!data.contact) {
        setState({ status: "unbound" });
        // Redirect to bind page after a brief moment
        setTimeout(() => {
          window.location.href = "/liff/bind";
        }, 500);
        return;
      }

      setState({
        status: "ready",
        clientId: data.contact.client_id,
        clientSlug: data.contact.slug,
        clientName: data.contact.client_name,
        lineUserId,
      });
    } catch (err) {
      console.error("LIFF init / binding check error:", err);
      setState({
        status: "error",
        message: "Failed to initialise. Please try again.",
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      await checkBinding();
    })();
  }, [checkBinding]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!subject.trim()) {
      setFormError("Subject is required.");
      return;
    }

    if (state.status !== "ready") return;

    setState({
      status: "submitting",
      clientId: state.clientId,
      clientSlug: state.clientSlug,
      clientName: state.clientName,
      lineUserId: state.lineUserId,
    });

    try {
      const res = await fetch("/api/liff/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: state.clientId,
          clientSlug: state.clientSlug,
          lineUserId: state.lineUserId,
          type,
          severity,
          subject: subject.trim(),
          body: body.trim() || null,
          pageUrl: pageUrl.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({
          status: "error",
          message: data.error ?? "Failed to create ticket.",
        });
        return;
      }

      setState({
        status: "success",
        ticketCode: data.ticket.ticket_code,
      });
    } catch (err) {
      console.error("Ticket submit error:", err);
      setState({
        status: "error",
        message: "Network error. Please check your connection and try again.",
      });
    }
  };

  const handleReset = () => {
    setType("bug");
    setSeverity("P2");
    setSubject("");
    setBody("");
    setPageUrl("");
    setFormError(null);
    if (state.status === "success" || state.status === "error") {
      // Re-set to ready with the stored data
      setState((prev) =>
        prev.status === "submitting" ? prev : { ...prev, status: "ready" } as TicketState,
      );
    }
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (state.status === "loading") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </main>
    );
  }

  // ── Unbound — redirecting ────────────────────────────────────────
  if (state.status === "unbound") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground text-sm">
          You need to select an organisation first. Redirecting…
        </p>
      </main>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (state.status === "error") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center">
          <h1 className="mb-2 text-lg font-semibold text-red-800">
            Something went wrong
          </h1>
          <p className="text-sm text-red-600">{state.message}</p>
          <button
            onClick={handleReset}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // ── Success — confirmation ───────────────────────────────────────
  if (state.status === "success") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
        <div className="max-w-md rounded-lg border border-green-200 bg-green-50 px-6 py-8 text-center">
          <div className="mb-4 text-4xl">✅</div>
          <h1 className="mb-2 text-xl font-bold text-green-800">
            Ticket Created
          </h1>
          <p className="mb-2 text-sm text-green-700">
            Your ticket has been submitted successfully.
          </p>
          <p className="text-2xl font-bold tracking-wider text-green-900">
            {state.ticketCode}
          </p>
          <p className="mt-2 text-xs text-green-600">
            Please save this code for future reference.
          </p>
          <button
            onClick={handleReset}
            className="mt-6 rounded bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            Create Another Ticket
          </button>
        </div>
      </main>
    );
  }

  // ── Ready — show ticket form ─────────────────────────────────────
  return (
    <main className="flex min-h-dvh flex-col items-center p-6">
      <div className="w-full max-w-lg">
        <h1 className="mb-1 text-2xl font-bold">Submit a Ticket</h1>
        <p className="mb-6 text-sm text-gray-500">
          Bound to <strong>{state.clientName}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client (read-only) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Organisation
            </label>
            <input
              type="text"
              value={state.clientName}
              disabled
              className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500"
            />
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="ticket-type"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="ticket-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {TICKET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label
              htmlFor="ticket-severity"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Severity <span className="text-red-500">*</span>
            </label>
            <select
              id="ticket-severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {TICKET_SEVERITIES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              {
                TICKET_SEVERITIES.find((s) => s.value === severity)
                  ?.description
              }
            </p>
          </div>

          {/* Subject */}
          <div>
            <label
              htmlFor="ticket-subject"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="ticket-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
              required
              maxLength={200}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Body */}
          <div>
            <label
              htmlFor="ticket-body"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="ticket-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Detailed description of the issue (optional)"
              rows={4}
              maxLength={5000}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Page URL */}
          <div>
            <label
              htmlFor="ticket-url"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Page URL
            </label>
            <input
              id="ticket-url"
              type="url"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              placeholder="https://example.com/page (optional)"
              maxLength={1000}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Form error */}
          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={state.status === "submitting"}
            className="w-full rounded bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state.status === "submitting" ? "Submitting…" : "Submit Ticket"}
          </button>
        </form>
      </div>
    </main>
  );
}