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
      className="min-h-screen bg-[#F7F2EF] text-[#292B30]"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="w-full px-4 pb-24 pt-22 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm text-[#5F5A56] underline-offset-4 transition duration-200 ease-out hover:text-[#B85A2E] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>

          <div className="mt-8">
            <h1 className="max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight text-[#292B30] sm:text-7xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#5F5A56] sm:text-lg">
              {project.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-[#5F5A56]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E8DDD7] bg-transparent px-4 py-2">
                <CalendarDays className="h-4 w-4" />
                <span>{project.date}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E8DDD7] bg-transparent px-4 py-2">
                <BriefcaseBusiness className="h-4 w-4" />
                <span>{project.role}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E8DDD7] bg-transparent px-4 py-2">
                <Layers3 className="h-4 w-4" />
                <span>{project.techStack.join(" · ")}</span>
              </div>
            </div>
          </div>

          <div className="relative mt-12 overflow-hidden rounded-xl border border-[#E8DDD7] bg-[#FFF9F6]">
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
            <div className="prose max-w-none prose-headings:mt-10 prose-headings:font-semibold prose-headings:leading-[0.98] prose-headings:tracking-tight prose-headings:text-[#292B30] prose-p:leading-relaxed prose-p:text-[#5F5A56] prose-a:text-[#B85A2E] prose-a:underline-offset-4 hover:prose-a:text-[#B85A2E] prose-strong:text-[#292B30] prose-li:text-[#5F5A56] prose-pre:rounded-2xl prose-pre:border prose-pre:border-[#E8DDD7] prose-pre:bg-[#FFF9F6]">
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

          <div className="mx-auto mt-16 max-w-3xl border-t border-[#E8DDD7] pt-8">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-sm text-[#5F5A56] underline-offset-4 transition duration-200 ease-out hover:text-[#B85A2E] hover:underline"
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
