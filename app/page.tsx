"use client";

import {
  BrainCircuit,
  Code2,
  Database,
  ServerCog,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { LayoutGrid } from "@/components/ui/layout-grid";
import { SiteHeader } from "@/components/site-header";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

export default function Home() {
  const [showSubheading, setShowSubheading] = useState(false);
  const projects = [
    {
      title: "Project 1",
      description: "LLM workflow for prompt evaluation, distillation, and retrieval.",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Project 2",
      description: "Recommendation system tuned for personalization and ranking quality.",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Project 3",
      description: "Production ML model with data pipelines, monitoring, and APIs.",
      image:
        "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=1200&q=80",
    },
  ];
  const skillGroups = [
    {
      title: "AI / ML",
      icon: BrainCircuit,
      skills: ["Machine Learning", "Deep Learning", "NLP", "Transformers"],
    },
    {
      title: "Backend",
      icon: ServerCog,
      skills: ["Django", "REST APIs"],
    },
    {
      title: "Databases",
      icon: Database,
      skills: ["PostgreSQL", "Supabase", "SQLite"],
    },
    {
      title: "Tools",
      icon: Wrench,
      skills: ["PyTorch", "TensorFlow", "Scikit-learn", "Pandas"],
    },
    {
      title: "Languages",
      icon: Code2,
      skills: ["Python", "C++", "SQL"],
    },
  ];
  const cards = [
    {
      id: 1,
      content: "Work",
      className: "md:col-span-2",
      thumbnail: "/grid/work.svg",
      href: "#work",
    },
    {
      id: 2,
      content: "About",
      className: "md:col-span-1",
      thumbnail: "/grid/about.svg",
      href: "#about",
    },
    {
      id: 3,
      content: "Resume",
      className: "md:col-span-1",
      thumbnail: "/grid/blog.svg",
    },
    {
      id: 4,
      content: "Contact",
      className: "md:col-span-1",
      thumbnail: "/grid/contact.svg",
      href: "#contact",
    },
    {
      id: 5,
      content: "GitHub",
      className: "md:col-span-2",
      thumbnail: "/grid/github.svg",
      href: "https://github.com/",
      external: true,
    },
    {
      id: 6,
      content: "LinkedIn",
      className: "md:col-span-1",
      thumbnail: "/grid/linkedin.svg",
      href: "https://www.linkedin.com/",
      external: true,
    },
  ];
  const headingWords = [{ text: "Hi," }, { text: "I’m" }, { text: "Divyam" }];
  const subheadingWords = [
    { text: "I" },
    { text: "build" },
    { text: "and" },
    { text: "experiment" },
    { text: "with" },
    { text: "AI" },
    { text: "systems" },
  ];

  return (
    <main className="min-h-screen bg-black px-4 pt-16 text-white sm:px-6 sm:pt-20">
      <SiteHeader activePage="home" />

      <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-5xl flex-col">
        <section className="flex min-h-screen items-center py-16 sm:py-24">
          <div className="flex w-full flex-col items-center justify-between gap-12 text-center lg:flex-row lg:items-center lg:gap-16 lg:text-left">
            <div className="flex w-full justify-center lg:-ml-8 lg:w-auto lg:flex-none lg:justify-start">
              <div className="relative h-[350px] w-[350px] sm:h-[420px] sm:w-[420px] lg:w-[450px]">
                <Image
                  src="/divyam.png"
                  alt="Divyam Sharma"
                  fill
                  className="object-cover"
                  sizes="(max-width: 639px) 350px, (max-width: 1023px) 420px, 450px"
                  priority
                />
              </div>
            </div>

            <div className="w-full max-w-xl">
              <TypewriterEffect
                words={headingWords}
                className="mt-4 max-w-[12ch] text-[2.7rem] font-bold leading-[0.92] tracking-[-0.055em] sm:mt-8 sm:max-w-none sm:text-7xl lg:mt-0 lg:text-[6.4rem]"
                cursorClassName="bg-white/75"
                typingSpeed={85}
                hideCursorOnComplete
                onComplete={() => {
                  window.setTimeout(() => {
                    setShowSubheading(true);
                  }, 500);
                }}
              />

              <div className="mt-6 min-h-[2.5rem] max-w-2xl sm:mt-8 sm:min-h-[4rem] sm:max-w-3xl">
                {showSubheading ? (
                  <TypewriterEffect
                    words={subheadingWords}
                    className="text-base leading-[1.5] font-normal text-zinc-300 sm:text-2xl"
                    cursorClassName="bg-white/45"
                    typingSpeed={65}
                  />
                ) : null}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center">
                <a
                  href="#work"
                  className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-85 sm:w-auto"
                >
                  Explore Projects
                </a>
                <a
                  href="#contact"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-70 sm:w-auto"
                >
                  Contact
                </a>
              </div>

              <a
                href="#contact"
                className="mt-8 inline-flex text-sm text-white/55 transition hover:opacity-80 hover:underline"
              >
                Want to build something cool &rarr;
              </a>
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-20">
          <div className="flex flex-col items-center justify-between gap-12 text-center lg:flex-row lg:items-center lg:text-left">
            <div className="w-full max-w-xl">
              <h2 className="mb-4 text-sm font-medium tracking-[0.28em] text-neutral-500 uppercase md:mb-6">
                Myself
              </h2>

              <div className="max-w-3xl space-y-6 text-left text-sm font-small leading-[1.5] tracking-tight text-neutral-300 antialiased md:space-y-8 md:text-xl lg:text-2xl">
                <p>
                  I am a Computer Science undergraduate at Shiv Nadar
                  University, focused on building functional AI systems and
                  machine learning applications.
                </p>
                <p>
                  I&apos;m also interested in analyzing data to uncover insights
                  and support decision-making. Alongside my technical work, I am
                  pursuing a minor in Economics, exploring the intersection of
                  technology and financial systems.
                </p>
              </div>
            </div>

            <div className="w-full max-w-xl">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <video
                  src="/about-video.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="work" className="w-full py-20">
          <div className="w-full">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Projects
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <a
                  key={project.title}
                  href="#"
                  className="group relative h-96 overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                  />

                  <div className="absolute inset-0 bg-black/10 transition-all duration-300 group-hover:bg-black/60" />

                  <div className="absolute right-0 bottom-0 left-0 p-6">
                    <p className="text-xl font-semibold text-white">
                      {project.title}
                    </p>
                    <p className="mt-2 max-w-[28ch] text-sm leading-6 text-zinc-300">
                      {project.description}
                    </p>
                    <p className="mt-4 text-sm text-white/0 transition-all duration-300 group-hover:text-white/80">
                      View Project &rarr;
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-20">
          <div className="w-full text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Skills
            </h2>

            <div className="mt-8">
              {skillGroups.map((group, index) => (
                <div
                  key={group.title}
                  className={index === 0 ? "" : "mt-8"}
                >
                  <p className="text-sm text-zinc-400">{group.title}</p>
                  <div className="mt-4 flex flex-wrap gap-3 sm:gap-4">
                    {group.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 hover:bg-neutral-700"
                      >
                        <group.icon className="h-4 w-4 opacity-80" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="w-full py-20">
          <LayoutGrid cards={cards} />
        </section>
      </div>
    </main>
  );
}
