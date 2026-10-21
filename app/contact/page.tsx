import type { Metadata } from "next";
import { BackToMap } from "@/components/back-to-map";
import { ContactForm } from "@/components/contact-form";
import { profile } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Contact | Divyam Sharma",
  description: "Hiring, a project, or a call: messages from this page go straight to Divyam's inbox.",
};

const textLink = "font-display text-base font-semibold text-cream underline decoration-carrot decoration-[3px] underline-offset-[5px] transition hover:text-sunshine";
const email = profile.links.email.replace("mailto:", "");

export default function ContactPage() {
  return (
    <main className="min-h-dvh bg-night text-cream">
      <div className="mx-auto w-full max-w-[1040px] px-4 pb-24 pt-8 sm:px-6 sm:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-terminal text-[13px] text-cream-muted">
            <b className="font-medium text-kiwi">~/divyam/contact</b>&nbsp;&nbsp;straight to my inbox
          </p>
          <BackToMap className="rounded-xl border-2 border-cream/30 px-4 py-2 font-display text-[15px] font-semibold transition hover:border-cream">
            ← Back to the map
          </BackToMap>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <section>
            <h1 className="font-display text-[40px] font-bold uppercase leading-[0.95] sm:text-[52px]">Let&apos;s talk!</h1>
            <p className="mt-5 max-w-[440px] font-display text-[18px] font-medium leading-[1.5]">
              Hiring, a project, or a question about something on the map. Messages from this page come straight to my inbox, and you can
              book a call in your own timezone.
            </p>
            <dl className="mt-8 grid grid-cols-[88px_1fr] gap-x-3 gap-y-3 border-t border-cream/12 pt-6 font-display text-[16px]">
              <dt className="pt-1 font-terminal text-[12px] text-kiwi">email</dt>
              <dd><a href={profile.links.email} className={textLink}>{email}</a></dd>
              <dt className="pt-1 font-terminal text-[12px] text-kiwi">elsewhere</dt>
              <dd className="flex flex-wrap gap-x-5 gap-y-2">
                <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className={textLink}>LinkedIn ↗</a>
                <a href={profile.links.github} target="_blank" rel="noreferrer" className={textLink}>GitHub ↗</a>
                <a href={profile.links.resume} target="_blank" rel="noreferrer" className={textLink}>Resume ↗</a>
              </dd>
              <dt className="pt-1 font-terminal text-[12px] text-kiwi">time zone</dt>
              <dd className="text-cream-muted">India, IST (UTC+5:30)</dd>
            </dl>
          </section>

          <ContactForm />
        </div>
      </div>
    </main>
  );
}
