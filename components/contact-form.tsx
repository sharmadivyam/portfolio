"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { CALL_MINUTES, TOPICS, type Topic } from "@/data/contact";

const field = "mt-2 w-full rounded-xl border-2 border-cream/25 bg-night-card px-4 py-3 font-display text-[16px] text-cream outline-none transition [color-scheme:dark] placeholder:text-cream-faint focus:border-cream";
const label = "font-terminal text-[12px] text-cream-muted";

// The visitor's timezone in words ("India Standard Time"), rather than an IANA id like "Asia/Calcutta".
const zoneName = () =>
  new Intl.DateTimeFormat(undefined, { timeZoneName: "long" }).formatToParts(new Date()).find((part) => part.type === "timeZoneName")?.value
  ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

export function ContactForm() {
  const [topic, setTopic] = useState<Topic>("Hiring or an opportunity");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const openedAt = useRef(0);
  const call = topic === "Book a call";

  // When the form was opened: the server drops anything submitted faster than a person could type.
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget, data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    let startsAt: string | undefined;
    if (call) {
      const start = new Date(`${value("date")}T${value("time")}`);
      if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()) {
        setStatus("error");
        setError("Please pick a date and time for the call that's in the future.");
        return;
      }
      startsAt = start.toISOString();
    }
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic, name: value("name"), email: value("email"), company: value("company"), message: value("message"),
          phone: call ? value("phone") : "", startsAt, minutes: call ? Number(value("minutes")) : undefined,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          website: value("website"), openedAt: openedAt.current,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Something went wrong. Please try again.");
      setSentTo(value("email"));
      setStatus("sent");
      form.reset();
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-[18px] border-2 border-cream/30 bg-night-card p-6 shadow-[4px_4px_0_#050b1c]">
        <p className="font-terminal text-[12.5px] text-kiwi">message sent</p>
        <h2 className="mt-2 font-display text-[28px] font-bold leading-tight text-cream">Thanks, it&apos;s in my inbox.</h2>
        <p className="mt-2 font-display text-[16.5px] leading-[1.55] text-cream-muted">
          {call ? "I'll confirm the call, or suggest another time, " : "I'll reply "}from my own email{sentTo ? <> to <b className="font-semibold text-cream">{sentTo}</b></> : null}.
        </p>
        <button type="button" onClick={() => { setStatus("idle"); setTopic("Hiring or an opportunity"); }}
          className="mt-5 font-display text-base font-semibold text-cream underline decoration-carrot decoration-[3px] underline-offset-[5px] transition hover:text-sunshine">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="relative rounded-[18px] border-2 border-cream/30 bg-night-card/60 p-5 shadow-[4px_4px_0_#050b1c] sm:p-7">
      <fieldset>
        <legend className={label}>what&apos;s this about?</legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {TOPICS.map((t) => (
            <label key={t} className="cursor-pointer">
              <input type="radio" name="topic" value={t} checked={topic === t} onChange={() => setTopic(t)} className="peer sr-only" />
              <span className="inline-flex rounded-full border-2 border-cream/30 px-3.5 py-2 font-display text-[15px] font-semibold text-cream transition hover:border-cream peer-checked:border-cream peer-checked:bg-cream peer-checked:text-night peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sunshine">
                {t}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block"><span className={label}>name</span><input name="name" required autoComplete="name" placeholder="Your name" className={field} /></label>
        <label className="block"><span className={label}>email</span><input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={field} /></label>
      </div>
      <label className="mt-4 block">
        <span className={label}>company or organisation <span className="text-cream-faint">(optional)</span></span>
        <input name="company" autoComplete="organization" placeholder="Where you're writing from" className={field} />
      </label>

      {call ? (
        <div className="mt-6 rounded-2xl border-2 border-cream/15 p-4">
          <p className={label}>when suits you? <span className="text-cream-faint">in your time, {zoneName()}</span></p>
          <div className="mt-1 grid gap-4 sm:grid-cols-[1fr_1fr_0.8fr]">
            <label className="block"><span className="sr-only">Date</span><input name="date" type="date" required className={field} /></label>
            <label className="block"><span className="sr-only">Time</span><input name="time" type="time" required step={900} className={field} /></label>
            <label className="block">
              <span className="sr-only">Length</span>
              <select name="minutes" defaultValue="30" className={field}>
                {CALL_MINUTES.map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className={label}>phone or whatsapp <span className="text-cream-faint">(optional)</span></span>
            <input name="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" className={field} />
          </label>
          <p className="mt-3 font-display text-[14px] leading-[1.5] text-cream-muted">I&apos;m in India (IST, UTC+5:30). I&apos;ll confirm by email with a meeting link, or suggest another time.</p>
        </div>
      ) : null}

      <label className="mt-6 block">
        <span className={label}>message</span>
        <textarea name="message" required rows={5} placeholder={call ? "What would you like to talk about?" : "The role, the project, or the question. A few lines is plenty."} className={`${field} resize-y`} />
      </label>

      {/* People never see this field; bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div aria-live="polite">
        {status === "error" ? <p role="alert" className="mt-5 rounded-xl border-2 border-tomato/60 bg-tomato/10 px-4 py-3 font-display text-[15px] text-cream">{error}</p> : null}
      </div>

      <button type="submit" disabled={status === "sending"}
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl border-2 border-cream bg-cream px-5 pb-[13px] pt-[14px] font-display text-[16px] font-bold uppercase tracking-[0.06em] text-night shadow-[3px_3px_0_#050b1c] transition hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_#050b1c] disabled:cursor-wait disabled:opacity-70 sm:w-auto">
        {status === "sending" ? "Sending…" : call ? "Request the call →" : "Send message →"}
      </button>
    </form>
  );
}
