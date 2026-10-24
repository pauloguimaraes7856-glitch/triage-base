"use client";

import { useState, type FormEvent } from "react";

type TriageResponse = {
  version: string;
  triage: {
    category: string;
    priority: string;
    summary: string;
    suggestedAction: string;
  };
  usage: { input: number; output: number; total: number };
};

export default function TriagePage() {
  const [ticket, setTicket] = useState("");
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function classify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending || !ticket.trim()) return;

    setIsSending(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to classify this ticket.");
      }
      setResult(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to classify this ticket.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="chat">
      <h1>Ticket triage</h1>
      <p>Paste a support ticket and get its category and priority.</p>
      <form onSubmit={classify} aria-busy={isSending}>
        <label htmlFor="ticket">Support ticket</label>
        <textarea
          id="ticket"
          value={ticket}
          onChange={(event) => setTicket(event.target.value)}
          placeholder="Paste the ticket here..."
          rows={8}
          required
          disabled={isSending}
        />
        <button type="submit" disabled={isSending || !ticket.trim()}>
          {isSending ? "Classifying..." : "Classify"}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>

      {result && (
        <section className="messages" aria-live="polite" style={{ marginTop: 20 }}>
          <div className="message">
            <strong>Category</strong>
            <p>{result.triage.category}</p>
          </div>
          <div className="message">
            <strong>Priority</strong>
            <p>{result.triage.priority}</p>
          </div>
          <div className="message">
            <strong>Summary</strong>
            <p>{result.triage.summary}</p>
          </div>
          <div className="message">
            <strong>Suggested action</strong>
            <p>{result.triage.suggestedAction}</p>
          </div>
          <p>
            Tokens: input {result.usage.input} / output {result.usage.output} / total{" "}
            {result.usage.total}
          </p>
          <p>Prompt version: {result.version}</p>
        </section>
      )}
    </main>
  );
}
