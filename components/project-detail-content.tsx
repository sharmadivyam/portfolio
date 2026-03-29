"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, BriefcaseBusiness, Layers3 } from "lucide-react";
import { motion } from "framer-motion";
import type { Project } from "@/data/projects";

type ProjectDetailContentProps = {
  project: Project;
};

export function ProjectDetailContent({
  project,
}: ProjectDetailContentProps) {
  return (
    <motion.main
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="w-full px-4 pb-24 pt-22 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors duration-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>

          <div className="mt-8">
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {project.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400 sm:text-lg">
              {project.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-4 py-2">
                <CalendarDays className="h-4 w-4 text-zinc-500" />
                <span>{project.date}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-4 py-2">
                <BriefcaseBusiness className="h-4 w-4 text-zinc-500" />
                <span>{project.role}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-4 py-2">
                <Layers3 className="h-4 w-4 text-zinc-500" />
                <span>{project.techStack.join(" · ")}</span>
              </div>
            </div>
          </div>

          <div className="relative mt-12 overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
            <Image
              src={project.image}
              alt={project.title}
              width={1600}
              height={900}
              className="h-auto max-h-[560px] w-full object-cover"
              priority
            />
          </div>

          <article className="mx-auto mt-16 max-w-3xl">
            <div className="prose prose-invert prose-zinc max-w-none prose-headings:mt-10 prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-zinc-200 prose-a:underline-offset-4 hover:prose-a:text-white prose-strong:text-white prose-li:text-zinc-300 prose-pre:rounded-2xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-zinc-950">
              {project.sections.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.list ? (
                    <ul>
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {section.code ? (
                    <pre>
                      <code className={`language-${section.code.language}`}>
                        {section.code.snippet}
                      </code>
                    </pre>
                  ) : null}
                </section>
              ))}
            </div>
          </article>

          <div className="mx-auto mt-16 max-w-3xl border-t border-white/10 pt-8">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors duration-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
