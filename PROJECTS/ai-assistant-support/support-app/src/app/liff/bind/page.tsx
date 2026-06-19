"use client";

import { useEffect, useState, useCallback } from "react";
import liff from "@line/liff";
import { Button } from "@/components/ui/button";

/**
 * LIFF Binding Page
 *
 * Opened when a LINE user first opens the LIFF app without having
 * registered an org code yet. The page checks the user's binding
 * status on mount and either prompts for org code input or redirects
 * to /liff/ticket if already bound.
 */

type BindState =
  | { status: "loading" }
  | { status: "ready"; lineUserId: string; displayName?: string }
  | { status: "bound" }
  | { status: "error"; message: string };

interface ActiveClient {
  id: string;
  name: string;
  slug: string;
}

export default function LiffBindPage() {
  const [state, setState] = useState<BindState>({ status: "loading" });
  const [clients, setClients] = useState<ActiveClient[]>([]);
  const [clientId, setClientId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Initialise LIFF and check binding status ─────────────────────
  const initLiff = useCallback(async () => {
    try {
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID ?? "" });

      if (!liff.isLoggedIn()) {
        liff.login();
        return; // login will re-trigger the page
      }

      const idToken = liff.getDecodedIDToken();
      const lineUserId = idToken?.sub;
      const displayName = idToken?.name;

      if (!lineUserId) {
        setState({
          status: "error",
          message: "Unable to retrieve LINE user ID. Please try again.",
        });
        return;
      }

      // Check if already bound
      const res = await fetch(`/api/liff/me?lineUserId=${encodeURIComponent(lineUserId)}`);
      const data = await res.json();

      if (data.contact) {
        // Already bound → redirect to ticket intake
        setState({ status: "bound" });
        window.location.href = "/liff/ticket";
        return;
      }

      setState({ status: "ready", lineUserId, displayName });
    } catch (err) {
      console.error("LIFF init error:", err);
      setState({
        status: "error",
        message: "Failed to initialise LIFF. Please try again.",
      });
    }
  }, []);

  // ── Fetch active clients for dropdown ────────────────────────────
  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/liff/clients");
      const data = await res.json();
      if (data.clients) {
        setClients(data.clients);
        if (data.clients.length > 0) {
          setClientId(data.clients[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await initLiff();
      await fetchClients();
    })();
  }, [initLiff, fetchClients]);

  // ── Submit binding ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.status !== "ready" || !clientId) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/liff/bind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineUserId: state.lineUserId,
          clientId,
          displayName: state.displayName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to bind");
      }

      // Success → redirect to ticket intake
      window.location.href = "/liff/ticket";
    } catch (err) {
      console.error("Bind error:", err);
      setSubmitError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────
  if (state.status === "loading") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </main>
    );
  }

  // ── Bound / redirecting ──────────────────────────────────────────
  if (state.status === "bound") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground text-sm">Redirecting…</p>
      </main>
    );
  }

  // ── Error state ──────────────────────────────────────────────────
  if (state.status === "error") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center">
          <h1 className="mb-2 text-lg font-semibold text-red-800">
            Something went wrong
          </h1>
          <p className="text-sm text-red-600">{state.message}</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  // ── Ready — show the org code form ───────────────────────────────
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-tight">
            Select Your Organisation
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose your organisation to get started with support tickets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Organisation code input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="org-code"
              className="text-sm font-medium text-foreground"
            >
              Organisation Code
            </label>
            <input
              id="org-code"
              type="text"
              placeholder="e.g. ACME-001"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              // org_code is stored but not used for client selection yet
              // The field exists on the table for future use
              onChange={(e) => {
                const input = e.target;
                input.dataset.orgCode = input.value;
              }}
            />
          </div>

          {/* Client dropdown */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="client"
              className="text-sm font-medium text-foreground"
            >
              Organisation
            </label>
            <select
              id="client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {clients.length === 0 && (
                <option value="">No organisations available</option>
              )}
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <Button type="submit" disabled={submitting || !clientId}>
            {submitting ? "Binding…" : "Continue"}
          </Button>
        </form>
      </div>
    </main>
  );
}