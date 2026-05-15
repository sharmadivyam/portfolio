"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const serviceOptions = ["Web Dev", "AI", "UI/UX"] as const;
const countryCodes = ["+91", "+1", "+44", "+61", "+49", "+33", "+81", "+86"] as const;

type ServiceOption = (typeof serviceOptions)[number];

export default function ContactPage() {
  const [selectedService, setSelectedService] = useState<ServiceOption>("Web Dev");

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F2EF] text-[#292B30]">
      <SiteHeader activePage="contact" />

      <section className="relative isolate w-full px-4 pb-16 pt-28 sm:px-6 sm:pb-20">
        <div className="mx-auto grid w-full max-w-7xl overflow-hidden rounded-[2rem] border border-[#E8DDD7] bg-[#FFF9F6] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative flex min-h-[360px] flex-col justify-between overflow-hidden border-b border-[#E8DDD7] p-8 sm:p-10 lg:min-h-[720px] lg:border-r lg:border-b-0">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E8DDD7] bg-transparent px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[#B85A2E]">
                <Sparkles className="h-3.5 w-3.5" />
                Contact
              </div>

              <h1 className="mt-6 max-w-lg text-5xl font-bold leading-[0.95] tracking-tight text-[#292B30] sm:text-6xl lg:text-7xl">
                Tell me what you&apos;re building next.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-[#5F5A56] sm:text-lg">
                Product ideas, AI experiments, polished interfaces, or fast MVPs.
                I help turn rough concepts into thoughtful digital experiences.
              </p>
            </div>

            <div className="relative z-10 mt-10 grid gap-4 sm:grid-cols-2">
              {[
                "Fast response for serious ideas",
                "Clear scope, timeline, and next steps",
                "Portfolio sites, AI tools, and launch-ready MVPs",
                "Built with product thinking and engineering depth",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#E8DDD7] bg-transparent p-4 text-sm leading-6 text-[#5F5A56]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative p-7 sm:p-9 lg:p-12">
            <motion.form
              className="relative z-10 rounded-[1.75rem] border border-[#E8DDD7] bg-[#F7F2EF] p-7 sm:p-9 lg:p-10"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div>
                <h2 className="text-4xl font-semibold leading-[0.98] tracking-tight text-[#292B30] sm:text-5xl">
                  Let&apos;s build something impactful.
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#5F5A56] sm:text-base">
                  First step to bring your idea to life.
                </p>
              </div>

              <div className="mt-8">
                <p className="text-xs font-medium tracking-[0.28em] text-[#B85A2E] uppercase">
                  About You
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    required
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block">
                    <span className="text-sm font-medium text-[#5F5A56]">
                      Phone
                    </span>
                    <div className="mt-2 grid grid-cols-[5.5rem_1fr] overflow-hidden rounded-xl border border-[#E8DDD7] transition duration-200 ease-out focus-within:border-[#B85A2E]">
                      <select
                        name="countryCode"
                        defaultValue="+91"
                        aria-label="Country code"
                        className="border-r border-[#E8DDD7] bg-transparent px-3 py-3 text-sm text-[#292B30] outline-none"
                      >
                        {countryCodes.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="98765 43210"
                        className="w-full bg-transparent px-4 py-3 text-sm text-[#292B30] outline-none placeholder:text-[#5F5A56]"
                      />
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-xs font-medium tracking-[0.28em] text-[#B85A2E] uppercase">
                  What do you need?
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  {serviceOptions.map((option) => {
                    const isSelected = selectedService === option;

                    return (
                      <motion.button
                        key={option}
                        type="button"
                        onClick={() => setSelectedService(option)}
                        className={`relative overflow-hidden rounded-xl border bg-transparent p-4 text-left transition duration-200 ease-out ${
                          isSelected
                            ? "border-[#B85A2E]"
                            : "border-[#E8DDD7] hover:border-[#B85A2E]"
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-0 bg-[#FFF9F6]"
                          animate={{ opacity: isSelected ? 1 : 0 }}
                          transition={{ duration: 0.25 }}
                        />
                        <span className="relative flex items-start justify-between gap-3">
                          <span>
                            <span className="block text-base font-semibold text-[#292B30]">
                              {option}
                            </span>
                            <span className="mt-1 block text-sm leading-5 text-[#5F5A56]">
                              {serviceCopy[option]}
                            </span>
                          </span>
                          <span
                            className={`mt-0.5 h-3 w-3 rounded-full border ${
                              isSelected
                                ? "border-[#B85A2E] bg-[#B85A2E]"
                                : "border-[#E8DDD7] bg-transparent"
                            }`}
                          />
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <label className="block">
                  <span className="text-xs font-medium tracking-[0.28em] text-[#B85A2E] uppercase">
                    Your Idea
                  </span>
                  <textarea
                    name="idea"
                    rows={6}
                    required
                    placeholder="Tell me what you're building, timeline, and goals..."
                    className="mt-4 w-full resize-none rounded-2xl border border-[#E8DDD7] bg-transparent px-4 py-3.5 text-sm text-[#292B30] outline-none transition duration-200 ease-out placeholder:text-[#5F5A56] focus:border-[#B85A2E]"
                  />
                </label>
              </div>

              <motion.button
                type="submit"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#24272C] bg-[#24272C] px-5 py-4 text-base font-semibold text-[#FFF9F6] transition duration-200 ease-out hover:border-[#B85A2E] hover:bg-transparent hover:text-[#B85A2E]"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                Submit
                <ArrowUpRight className="h-4 w-4" />
              </motion.button>
            </motion.form>
          </div>
        </div>
      </section>
    </main>
  );
}

const serviceCopy: Record<ServiceOption, string> = {
  "Web Dev": "Websites and platforms",
  AI: "AI-driven product features",
  "UI/UX": "Flows, interfaces, systems",
};

type InputFieldProps = {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
};

function InputField({ label, name, type, placeholder, required = false }: InputFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#5F5A56]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-[#E8DDD7] bg-transparent px-4 py-3 text-sm text-[#292B30] outline-none transition duration-200 ease-out placeholder:text-[#5F5A56] focus:border-[#B85A2E]"
      />
    </label>
  );
}
