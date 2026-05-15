import Link from "next/link";

export function CTASection() {
  return (
    <section className="mx-auto w-full max-w-[1160px] px-4 py-16 sm:px-6 sm:py-20">
      <div className="relative overflow-hidden rounded-[24px] border border-[#E8DDD7] bg-[#EDE6DD] px-8 py-12 shadow-[0_28px_70px_rgba(36,39,44,0.06)] transition-colors duration-200 sm:px-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#B85A2E]">
          let’s connect
        </p>
        <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-[#292B30] sm:text-5xl">
          Let’s build something exceptional.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[#5F5A56] sm:text-lg">
          I’m always open to new opportunities, collaborations, or ideas.
        </p>

        <Link
          href="mailto:hello@divyamsharma.com"
          className="mt-10 inline-flex items-center justify-center rounded-[12px] bg-[#B85A2E] px-6 py-3 text-sm font-semibold text-[#FFF9F6] shadow-[0_16px_24px_rgba(184,90,46,0.18)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#9c4729]"
        >
          Get in touch →
        </Link>
      </div>
    </section>
  );
}
