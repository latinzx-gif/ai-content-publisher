"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import liff from "@line/liff";

/**
 * LIFF Ticket Status page.
 *
 * On mount:
 *   1. Initialise LIFF and retrieve the LINE user ID.
 *   2. Show a form to enter a ticket code (AAS-XXXXXX).
 *   3. On submit, fetch ticket status from the API.
 */

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; lineUserId: string }
  | { status: "fetching"; lineUserId: string; ticketCode: string }
  | { status: "found"; lineUserId: string; ticket: TicketData }
  | { status: "not_found"; lineUserId: string };

interface TicketData {
  ticket_code: string;
  client_name: string;
  type: string;
  severity: string;
  subject: string;
  body: string | null;
  status: string;
  created_at: string;
  resolution_summary: string | null;
}

/** Status display configuration. */
const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  open: {
    label: "Open",
    color: "#EF4444",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
  },
  in_progress: {
    label: "In Progress",
    color: "#EAB308",
    bg: "bg-yellow-50 border-yellow-200",
    dot: "bg-yellow-500",
  },
  waiting_client: {
    label: "Waiting Client",
    color: "#F97316",
    bg: "bg-orange-50 border-orange-200",
    dot: "bg-orange-500",
  },
  resolved: {
    label: "Resolved",
    color: "#22C55E",
    bg: "bg-green-50 border-green-200",
    dot: "bg-green-500",
  },
  closed: {
    label: "Closed",
    color: "#6B7280",
    bg: "bg-gray-50 border-gray-200",
    dot: "bg-gray-500",
  },
};

function getStatusConfig(status: string) {
  return (
    statusConfig[status] ?? {
      label: status,
      color: "#6B7280",
      bg: "bg-gray-50 border-gray-200",
      dot: "bg-gray-500",
    }
  );
}

/** Format an ISO timestamp to a readable Thai locale date string. */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Map severity to a display color. */
function severityColor(severity: string): string {
  switch (severity) {
    case "P0":
      return "text-red-600 bg-red-50 border-red-200";
    case "P1":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "P2":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "P3":
      return "text-gray-600 bg-gray-50 border-gray-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export default function LiffTicketStatusPage() {
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [ticketCode, setTicketCode] = useState("");

  const initLiff = useCallback(async () => {
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

      setState({ status: "ready", lineUserId });
    } catch (err) {
      console.error("LIFF init error:", err);
      setState({
        status: "error",
        message: "Failed to initialise. Please try again.",
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      await initLiff();
    })();
  }, [initLiff]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();

    const code = ticketCode.trim().toUpperCase();
    if (!code) return;

    if (state.status !== "ready") return;

    setState({ status: "fetching", lineUserId: state.lineUserId, ticketCode: code });

    try {
      const res = await fetch(
        `/api/liff/tickets/${encodeURIComponent(code)}?lineUserId=${encodeURIComponent(state.lineUserId)}`,
      );

      if (res.status === 404) {
        setState({ status: "not_found", lineUserId: state.lineUserId });
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setState({
          status: "error",
          message: data.error ?? "Failed to fetch ticket status.",
        });
        return;
      }

      const data = await res.json();
      setState({
        status: "found",
        lineUserId: state.lineUserId,
        ticket: data.ticket,
      });
    } catch (err) {
      console.error("Ticket search error:", err);
      setState({
        status: "error",
        message: "Network error. Please check your connection and try again.",
      });
    }
  };

  const handleReset = () => {
    if (state.status === "ready" || state.status === "found" || state.status === "not_found") {
      setTicketCode("");
      setState({ status: "ready", lineUserId: state.lineUserId });
    }
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (state.status === "loading") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-500 text-sm">Loading…</p>
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

  // ── Ready / Found / Not Found — show the search form ─────────────
  return (
    <main className="flex min-h-dvh flex-col items-center p-6">
      <div className="w-full max-w-lg">
        <h1 className="mb-1 text-2xl font-bold">Ticket Status</h1>
        <p className="mb-6 text-sm text-gray-500">
          Enter your ticket code to check its status.
        </p>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            id="ticket-code"
            type="text"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value)}
            placeholder="AAS-XXXXXX"
            maxLength={11}
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={state.status === "fetching"}
          />
          <button
            type="submit"
            disabled={
              state.status === "fetching" || ticketCode.trim().length === 0
            }
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state.status === "fetching" ? "Searching…" : "Search"}
          </button>
        </form>

        {/* Not found */}
        {state.status === "not_found" && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center">
            <p className="text-sm font-medium text-red-700">
              ไม่พบคำร้องนี้
            </p>
            <p className="mt-1 text-xs text-red-500">
              No ticket found with that code. Please check and try again.
            </p>
          </div>
        )}

        {/* Ticket found — details */}
        {state.status === "found" && (
          <div className="space-y-4">
            {/* Status badge + ticket code */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold tracking-wider text-gray-900">
                {state.ticket.ticket_code}
              </span>
              {(() => {
                const cfg = getStatusConfig(state.ticket.status);
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.bg}`}
                    style={{ color: cfg.color }}
                  >
                    <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                );
              })()}
            </div>

            {/* Detail cards */}
            <div className="rounded-lg border border-gray-200 bg-white">
              {/* Client */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="text-sm text-gray-500">Organisation</span>
                <span className="text-sm font-medium text-gray-900">
                  {state.ticket.client_name}
                </span>
              </div>

              {/* Type */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="text-sm text-gray-500">Type</span>
                <span className="text-sm font-medium capitalize text-gray-900">
                  {state.ticket.type}
                </span>
              </div>

              {/* Severity */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="text-sm text-gray-500">Severity</span>
                <span
                  className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${severityColor(state.ticket.severity)}`}
                >
                  {state.ticket.severity}
                </span>
              </div>

              {/* Subject */}
              <div className="border-b border-gray-100 px-4 py-3">
                <span className="text-sm text-gray-500">Subject</span>
                <p className="mt-0.5 text-sm font-medium text-gray-900">
                  {state.ticket.subject}
                </p>
              </div>

              {/* Body */}
              {state.ticket.body && (
                <div className="border-b border-gray-100 px-4 py-3">
                  <span className="text-sm text-gray-500">Description</span>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-700">
                    {state.ticket.body}
                  </p>
                </div>
              )}

              {/* Created date */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm text-gray-700">
                  {formatDate(state.ticket.created_at)}
                </span>
              </div>

              {/* Resolution summary (if resolved/closed) */}
              {state.ticket.resolution_summary && (
                <div className="px-4 py-3">
                  <span className="text-sm text-gray-500">
                    Resolution
                  </span>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-700">
                    {state.ticket.resolution_summary}
                  </p>
                </div>
              )}
            </div>

            {/* Back button */}
            <button
              onClick={handleReset}
              className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Search Another Ticket
            </button>
          </div>
        )}
      </div>
    </main>
  );
}