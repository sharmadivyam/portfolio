import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const runtime = "nodejs";

type ContactPayload = {
  name?: string;
  email?: string;
  countryCode?: string;
  phone?: string;
  service?: string;
  idea?: string;
};

const recipientEmail = process.env.CONTACT_TO_EMAIL ?? "sharmadivyam86@gmail.com";
const fromEmail =
  process.env.RESEND_FROM_EMAIL ?? "Portfolio Contact <onboarding@resend.dev>";

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json(
      { error: "Missing RESEND_API_KEY environment variable." },
      { status: 500 },
    );
  }

  try {
    const payload = (await req.json()) as ContactPayload;
    const {
      name = "",
      email = "",
      countryCode = "",
      phone = "",
      service = "",
      idea = "",
    } = payload;

    if (!name.trim() || !email.trim() || !idea.trim()) {
      return Response.json(
        { error: "Name, email, and idea are required." },
        { status: 400 },
      );
    }

    const phoneNumber = [countryCode, phone].filter(Boolean).join(" ");
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: `New contact from ${name}${service ? ` - ${service}` : ""}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phoneNumber || "Not provided"}`,
        `Service: ${service || "Not selected"}`,
        "",
        "Idea:",
        idea,
      ].join("\n"),
    });

    if (error) {
      return Response.json(
        { error: "Email could not be sent. Please try again." },
        { status: 502 },
      );
    }

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Invalid request. Please try again." },
      { status: 400 },
    );
  }
}
