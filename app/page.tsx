"use client";

import {
  ArrowRight,
  BrainCircuit,
  Code2,
  Database,
  ServerCog,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LayoutGrid } from "@/components/ui/layout-grid";
import { SiteHeader } from "@/components/site-header";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { projects } from "@/data/projects";

const featuredProjectSlugs = [
  "llm-distillation-model-behavior-analysis",
  "smart-price-prediction",
  "real-time-waste-classification-edge-ml",
];

const featuredProjects = featuredProjectSlugs
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project) => project !== undefined);

const resumeUrl =
  "https://drive.google.com/file/d/1E0QOTR2uLefoy9IRS6BD_riyYTdBYibd/view?usp=sharing";

export default function Home() {
  const [showSubheading, setShowSubheading] = useState(false);
  const [showMobileSubheading, setShowMobileSubheading] = useState(false);
  const skillGroups = [
    {
      title: "AI / ML",
      icon: BrainCircuit,
      skills: [
        "Machine Learning",
        "Deep Learning",
        "NLP",
        "Transformers",
        "PyTorch",
        "LoRA / PEFT",
        "LangChain",
        "Knowledge Distillation",
        "CNNs",
        "Embeddings",
        "TFLite / Edge ML",
      ],
    },
    {
      title: "Backend",
      icon: ServerCog,
      skills: [
        "Django",
        "REST APIs",
        "Django REST Framework",
        "JWT / SimpleJWT",
        "Custom Middleware",
      ],
    },
    {
      title: "Databases",
      icon: Database,
      skills: ["PostgreSQL", "Supabase", "SQLite", "MySQL"],
    },
    {
      title: "Tools",
      icon: Wrench,
      skills: [
        "TensorFlow",
        "Scikit-learn",
        "Pandas",
        "Git",
        "GitHub",
        "NumPy",
        "Gemini API",
      ],
    },
    {
      title: "Languages",
      icon: Code2,
      skills: ["Python", "C++", "SQL", "C"],
    },
    {
      title: "Frontend",
      icon: Code2,
      skills: ["React", "HTML", "CSS", "JavaScript"],
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
      href: "https://drive.google.com/file/d/1E0QOTR2uLefoy9IRS6BD_riyYTdBYibd/view?usp=sharing",
      external: true,
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
      href: "https://github.com/sharmadivyam",
      external: true,
    },
    {
      id: 6,
      content: "LinkedIn",
      className: "md:col-span-1",
      thumbnail: "/grid/linkedin.svg",
      href: "https://www.linkedin.com/in/divyam-sharma-4a8a562b0/",
      external: true,
    },
  ];
  const headingWords = [
    { text: "Hi," },
    { text: "I'm" },
    {
      text: "Divyam",
    },
  ];
  const subheadingWords = [
    { text: "Building" },
    { text: "AI" },
    { text: "systems." },
    { text: "From" },
    { text: "idea" },
    { text: "to" },
    { text: "production.", className: "text-[#B85A2E]" },
  ];
  const primaryButtonClassName =
    "inline-flex min-h-12 items-center justify-center rounded-md border border-[#24272C] bg-[#24272C] px-6 py-3 text-sm font-semibold text-[#FFF9F6] shadow-[0_10px_30px_rgba(36,39,44,0.12)] transition duration-200 ease-out hover:border-[#B85A2E] hover:bg-[#B85A2E] active:-translate-y-0.5 active:border-[#B85A2E] active:bg-[#B85A2E]";
  const secondaryButtonClassName =
    "inline-flex min-h-12 items-center justify-center rounded-md border border-[#D7C9C1] bg-transparent px-6 py-3 text-sm font-medium text-[#292B30] transition duration-200 ease-out hover:border-[#B85A2E] hover:text-[#B85A2E] active:-translate-y-0.5 active:border-[#B85A2E] active:text-[#B85A2E]";

  return (
    <main className="min-h-screen bg-[#F5F1EC] px-4 pt-24 text-[#292B30] sm:px-6 sm:pt-28 max-md:px-2 max-md:pt-16">
      <SiteHeader activePage="home" />

      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <section className="flex items-start border-b border-[#E8DDD7] py-12 sm:py-14 lg:py-16 max-md:-mx-2 max-md:w-[calc(100%+1rem)] max-md:border-b-0 max-md:py-0">
          <div className="flex w-full flex-col justify-between gap-12 lg:flex-row lg:items-center lg:gap-[60px] max-md:p-0">
            <div className="w-full lg:max-w-none lg:flex-[0_1_60%] max-md:hidden">
              <div className="flex max-w-[520px] flex-col items-center text-center lg:items-start lg:text-left max-md:max-w-none max-md:items-start max-md:text-left">
                <TypewriterEffect
                  words={headingWords}
                  className="max-w-[12ch] text-5xl font-bold leading-[1.1] tracking-normal text-[#292B30] sm:max-w-none sm:text-[3.5rem] lg:text-[4rem] max-md:hidden"
                  cursorClassName="bg-[#292B30]"
                  typingSpeed={65}
                  hideCursorOnComplete
                  onComplete={() => {
                    window.setTimeout(() => {
                      setShowSubheading(true);
                    }, 500);
                  }}
                />

                <h1 className="hidden text-[2rem] font-bold leading-tight tracking-normal text-[#292B30] max-md:block">
                  Hi, I&apos;m Divyam
                </h1>

                <div className="mt-4 min-h-[2rem] w-full max-w-[520px] sm:min-h-[2.5rem] max-md:hidden">
                  {showSubheading ? (
                    <TypewriterEffect
                      words={subheadingWords}
                      className="text-lg leading-[1.45] font-normal text-[#292B30] sm:text-[1.25rem]"
                      cursorClassName="bg-[#B85A2E]"
                      typingSpeed={50}
                    />
                  ) : null}
                </div>

                <p className="hidden text-sm leading-[1.5] text-[#292B30] max-md:mt-1.5 max-md:block">
                  Building AI systems. From idea to{" "}
                  <span className="text-[#B85A2E]">production.</span>
                </p>

                <p className="mt-5 max-w-[520px] text-base leading-[1.6] text-[#5F5A56] max-md:mt-3 max-md:text-sm max-md:leading-[1.55]">
                  I work across machine learning and backend systems to build AI
                  products that are reliable, scalable, and designed for real-world
                  use.
                </p>

                <div className="mt-5 flex w-full flex-col gap-4 sm:flex-row sm:items-center max-md:mt-5 max-md:gap-3">
                  <a
                    href="#work"
                    className={`${primaryButtonClassName} w-full sm:w-auto max-md:min-h-11 max-md:rounded-xl max-md:border-[#B85A2E] max-md:bg-[#B85A2E] max-md:px-4 max-md:py-3 max-md:text-xs max-md:shadow-[0_10px_24px_rgba(184,90,46,0.22)]`}
                  >
                    <span className="max-md:flex max-md:w-full max-md:items-center max-md:justify-center max-md:gap-12">
                      Explore Projects
                      <ArrowRight className="hidden h-3.5 w-3.5 max-md:block" />
                    </span>
                  </a>
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`${secondaryButtonClassName} w-full sm:w-auto max-md:min-h-11 max-md:rounded-xl max-md:px-4 max-md:py-3 max-md:text-xs`}
                  >
                    My Resume
                  </a>
                </div>

                <a
                  href="/contact"
                  className="mt-5 inline-flex text-sm text-[#5F5A56] underline-offset-4 transition duration-200 ease-out hover:text-[#B85A2E] hover:underline max-md:hidden"
                >
                  Want to build something cool &rarr;
                </a>
              </div>
            </div>

            <div className="flex w-full justify-center lg:flex-[0_1_40%] lg:justify-end max-md:order-1">
              <div className="w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] max-md:max-w-none max-md:overflow-hidden max-md:rounded-b-2xl">
                <div className="max-md:relative">
                  <Image
                    src="/divyam.png"
                    alt="Divyam Sharma"
                    width={420}
                    height={420}
                    preload
                    className="h-auto w-full object-contain max-md:h-[340px] max-md:bg-[#FFF9F6] max-md:object-contain max-md:object-bottom"
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) min(80vw, 380px), 420px"
                  />
                  <div className="absolute inset-x-0 bottom-0 hidden h-24 bg-gradient-to-b from-transparent via-black/35 to-black max-md:block" />
                </div>

                <div className="relative hidden -mt-px bg-[linear-gradient(to_bottom,#000_0%,rgba(0,0,0,0.96)_28%,#000_100%)] p-5 text-white max-md:block">
                  <TypewriterEffect
                    words={headingWords}
                    className="text-[2rem] font-bold leading-tight tracking-normal text-white"
                    cursorClassName="bg-white"
                    typingSpeed={65}
                    hideCursorOnComplete
                    onComplete={() => {
                      window.setTimeout(() => {
                        setShowMobileSubheading(true);
                      }, 350);
                    }}
                  />

                  <div className="mt-1.5 min-h-[1.35rem]">
                    {showMobileSubheading ? (
                      <TypewriterEffect
                        words={subheadingWords}
                        className="text-sm leading-[1.5] text-white"
                        cursorClassName="bg-[#B85A2E]"
                        typingSpeed={50}
                      />
                    ) : null}
                  </div>

                  <p className="mt-3 text-sm leading-[1.55] text-white/75">
                    I work across machine learning and backend systems to build AI
                    products that are reliable, scalable, and designed for
                    real-world use.
                  </p>

                  <div className="mt-5 flex w-full flex-col gap-3">
                    <a
                      href="#work"
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-white bg-white px-6 py-3 text-sm font-semibold text-[#292B30] shadow-[0_10px_24px_rgba(255,255,255,0.12)] transition duration-200 ease-out hover:border-[#B85A2E] hover:bg-[#B85A2E] hover:text-[#FFF9F6] active:-translate-y-0.5 active:border-[#B85A2E] active:bg-[#B85A2E] active:text-[#FFF9F6]"
                    >
                      Explore Projects
                    </a>
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-white/35 bg-transparent px-6 py-3 text-sm font-medium text-white transition duration-200 ease-out hover:border-[#B85A2E] hover:bg-[#B85A2E] hover:text-white active:-translate-y-0.5 active:border-[#B85A2E] active:bg-[#B85A2E] active:text-white"
                    >
                      My Resume
                    </a>
                  </div>

                  <a
                    href="/contact"
                    className="mt-5 inline-flex text-sm text-white/75 underline-offset-4 transition duration-200 ease-out hover:text-[#B85A2E] hover:underline active:text-[#B85A2E] active:underline"
                  >
                    Want to build something cool &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="w-full border-b border-[#E8DDD7] py-24">
          <div className="flex flex-col items-center justify-between gap-12 text-center lg:flex-row lg:items-center lg:text-left">
            <div className="w-full max-w-xl">
              <h2 className="mb-4 text-base font-semibold tracking-[0.24em] text-[#B85A2E] uppercase md:mb-6 md:text-lg">
                Myself
              </h2>

              <div className="max-w-3xl space-y-6 text-left text-sm leading-[1.55] text-[#5F5A56] antialiased md:space-y-8 md:text-xl lg:text-2xl">
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
              <div className="overflow-hidden rounded-2xl border border-[#E8DDD7] bg-[#FFF9F6]">
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

        <section id="work" className="w-full border-b border-[#E8DDD7] py-24">
          <div className="w-full">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-4xl font-bold leading-[0.95] tracking-tight text-[#292B30] sm:text-5xl">
                Projects
              </h2>
              <Link
                href="/work"
                className="inline-flex items-center gap-2 text-base font-semibold text-[#292B30] underline-offset-4 transition duration-200 ease-out hover:text-[#B85A2E] hover:underline active:text-[#B85A2E] active:underline sm:text-lg"
              >
                View all
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredProjects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="group relative h-96 overflow-hidden rounded-2xl border border-[#E8DDD7] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#B85A2E] active:-translate-y-0.5 active:border-[#B85A2E]"
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                  />

                  <div className="absolute inset-0 bg-[#24272C] opacity-20 transition duration-200 ease-out group-hover:opacity-65 group-active:opacity-65" />

                  <div className="absolute right-0 bottom-0 left-0 p-6">
                    <p className="text-xl font-semibold text-[#FFF9F6]">
                      {project.title}
                    </p>
                    <p className="mt-2 line-clamp-4 max-w-[28ch] text-sm leading-6 text-[#FFF9F6]">
                      {project.description}
                    </p>
                    <p className="mt-4 text-sm text-[#FFF9F6] opacity-0 transition duration-200 ease-out group-hover:opacity-100 group-active:opacity-100">
                      View Project &rarr;
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full border-b border-[#E8DDD7] py-24">
          <div className="w-full text-left">
            <h2 className="text-4xl font-bold leading-[0.95] tracking-tight text-[#292B30] sm:text-5xl">
              Skills
            </h2>

            <div className="mt-8">
              {skillGroups.map((group, index) => (
                <div
                  key={group.title}
                  className={index === 0 ? "" : "mt-8"}
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-[#B85A2E]">
                    {group.title}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 sm:gap-4">
                    {group.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 rounded-full border border-[#E8DDD7] bg-transparent px-4 py-2 text-xs font-medium text-[#5F5A56] transition duration-200 ease-out hover:border-[#B85A2E] hover:text-[#B85A2E] active:-translate-y-0.5 active:border-[#B85A2E] active:text-[#B85A2E]"
                      >
                        <group.icon className="h-4 w-4" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
