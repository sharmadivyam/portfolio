import Link from "next/link";

export function CTASection() {
  return (
    <section className="w-full bg-[#EDE6DD] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#B85A2E]">
          LET&apos;S CONNECT
        </p>
        <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-[#292B30] sm:text-5xl">
          Have something in mind?
          <br />
          Let&apos;s bring it to life!
        </h2>

        <Link
          href="/contact"
          className="mt-10 inline-flex items-center justify-center rounded-[12px] bg-[#B85A2E] px-6 py-3 text-sm font-semibold text-[#FFF9F6] shadow-[0_16px_24px_rgba(184,90,46,0.18)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#9c4729] active:-translate-y-0.5 active:bg-[#9c4729]"
        >
          Get in touch &rarr;
        </Link>
      </div>
    </section>
  );
}
