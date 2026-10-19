import { Resend } from "resend";
import { CALL_MINUTES, TOPICS, type Topic } from "@/data/contact";

export const runtime = "nodejs";

// Messages from the contact page land in Divyam's inbox. A reply goes straight to the sender, and a call request
// arrives with its proposed time in the sender's timezone and in IST, plus a calendar invite to add it in one click.

type ContactPayload = {
  topic?: string;
  name?: string;
  email?: string;
  company?: string;
  message?: string;
  /** Book a call: the proposed start as an ISO timestamp, its length in minutes, and the sender's timezone. */
  startsAt?: string;
  minutes?: number;
  timeZone?: string;
  phone?: string;
  /** Spam checks: a field people never see, and when the form was opened (ms since epoch). */
  website?: string;
  openedAt?: number;
};

const recipientEmail = process.env.CONTACT_TO_EMAIL ?? "sharmadivyam86@gmail.com";
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Portfolio Contact <onboarding@resend.dev>";
const HOME_ZONE = "Asia/Kolkata";

const clean = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ");

function zoneOrUtc(zone: string) {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: zone });
    return zone;
  } catch {
    return "UTC";
  }
}

const when = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }).format(date);

// iCalendar text: escape the special characters, and use UTC times.
const icsText = (value: string) => value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const icsTime = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function invite(start: Date, minutes: number, name: string, email: string, message: string) {
  const end = new Date(start.getTime() + minutes * 60_000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Divyam Sharma//Portfolio//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${start.getTime()}-${Math.random().toString(36).slice(2)}@divyam-portfolio`,
    `DTSTAMP:${icsTime(new Date())}`,
    `DTSTART:${icsTime(start)}`,
    `DTEND:${icsTime(end)}`,
    `SUMMARY:${icsText(`Call with ${name}`)}`,
    `DESCRIPTION:${icsText(`${name} <${email}>\n\n${message}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: "Email isn't set up on this server yet. Please write to me directly." }, { status: 500 });
  }

  let payload: ContactPayload;
  try {
    payload = (await req.json()) as ContactPayload;
  } catch {
    return Response.json({ error: "Invalid request. Please try again." }, { status: 400 });
  }

  // Bots fill the hidden field or submit instantly; pretend it worked so they don't retry.
  const opened = typeof payload.openedAt === "number" ? payload.openedAt : 0;
  if (clean(payload.website, 200) || Date.now() - opened < 2500) return Response.json({ success: true });

  const topic: Topic = TOPICS.find((t) => t === payload.topic) ?? "Something else";
  const name = oneLine(clean(payload.name, 120));
  const email = oneLine(clean(payload.email, 200));
  const company = oneLine(clean(payload.company, 160));
  const phone = oneLine(clean(payload.phone, 40));
  const message = clean(payload.message, 5000);

  if (!name || !email || !message) {
    return Response.json({ error: "Please add your name, email and a message." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  let start: Date | null = null, minutes = 30, zone = HOME_ZONE;
  if (topic === "Book a call") {
    start = new Date(clean(payload.startsAt, 40));
    minutes = CALL_MINUTES.find((m) => m === Number(payload.minutes)) ?? 30;
    zone = zoneOrUtc(clean(payload.timeZone, 64) || "UTC");
    const ahead = start.getTime() - Date.now();
    if (Number.isNaN(ahead) || ahead < 0 || ahead > 365 * 24 * 3600 * 1000) {
      return Response.json({ error: "Please pick a time for the call that's in the future." }, { status: 400 });
    }
  }

  const details = [`Topic: ${topic}`, `Name: ${name}`, `Email: ${email}`];
  if (company) details.push(`Company: ${company}`);
  if (phone) details.push(`Phone: ${phone}`);
  if (start) details.push("", `Proposed call: ${minutes} min`, `  Their time (${zone}): ${when(start, zone)}`, `  Your time (IST): ${when(start, HOME_ZONE)}`);
  const lines = [...details, "", "Message:", message, "", "Reply to this email to answer them directly."];

  const subject = start
    ? `Call request from ${name}: ${when(start, HOME_ZONE)} IST`
    : `${topic} from ${name}${company ? ` (${company})` : ""}`;

  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: fromEmail,
    to: recipientEmail,
    replyTo: email,
    subject: oneLine(subject),
    text: lines.join("\n"),
    attachments: start ? [{ filename: "call.ics", content: Buffer.from(invite(start, minutes, name, email, message)), contentType: "text/calendar" }] : undefined,
  });

  if (error) {
    return Response.json({ error: "The message couldn't be sent. Please try again, or email me directly." }, { status: 502 });
  }
  return Response.json({ success: true });
}
