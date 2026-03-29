import { Playfair_Display } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { ProjectCard } from "@/components/project-card";
import { LayoutGrid } from "@/components/ui/layout-grid";
import { contactCards } from "@/data/contact-cards";
import { projects } from "@/data/projects";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["400"],
  display: "swap",
});

export default function WorkPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteHeader activePage="work" />

      <section className="w-full py-20 pt-22 sm:pt-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <h1
            className={`${playfairDisplay.className} mb-4 text-5xl font-normal italic text-neutral-300 md:text-6xl`}
          >
            Work
          </h1>

          <p className="max-w-2xl text-base leading-7 text-zinc-400">
            Selected projects across AI systems, product experimentation, and
            data-driven engineering.
          </p>

          <div className="mt-10 space-y-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.slug}
                slug={project.slug}
                title={project.title}
                description={project.description}
                image={project.image}
                author={project.author}
                date={project.date}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="w-full py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <LayoutGrid cards={contactCards} />
        </div>
      </section>
    </main>
  );
}
