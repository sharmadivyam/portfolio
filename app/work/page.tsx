import { SiteHeader } from "@/components/site-header";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/data/projects";

export default function WorkPage() {
  return (
    <main className="min-h-screen bg-[#F7F2EF] text-[#292B30]">
      <SiteHeader activePage="work" />

      <section className="w-full border-b border-[#E8DDD7] py-24 pt-28 sm:pt-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <h1 className="mb-4 font-serif text-6xl font-normal italic leading-[0.9] tracking-normal text-[#292B30] sm:text-7xl md:text-8xl">
            Work
          </h1>

          <p className="max-w-2xl text-base leading-7 text-[#5F5A56]">
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

    </main>
  );
}
