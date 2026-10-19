import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, projects } from "@/data/projects";
import { items, skimGroups, worlds } from "@/data/portfolio";

type Props = { params: Promise<{ slug: string }> };

const textLink = "font-display text-base font-semibold text-cream underline decoration-carrot decoration-[3px] underline-offset-[5px] transition hover:text-sunshine";
const barLink = "rounded-xl border-2 border-cream/30 px-4 py-2 font-display text-[15px] font-semibold transition hover:border-cream";

// Stories read in the same order as the projects on /skim.
const order = (skimGroups.find((g) => g.title === "projects")?.ids ?? [])
  .map((id) => items.find((item) => item.id === id)?.story)
  .filter((slug): slug is string => Boolean(slug && getProjectBySlug(slug)));

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProjectBySlug((await params).slug);
  return project ? { title: `${project.title} | Divyam Sharma`, description: project.description } : { title: "Story not found" };
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  // The map card this story belongs to: the way back, its world, and its links.
  const item = items.find((i) => i.story === slug);
  const world = item ? worlds.find((w) => w.key === item.world) : undefined;
  const back = item ? `/#item=${item.id}` : "/";
  const next = order.length ? getProjectBySlug(order[(order.indexOf(slug) + 1) % order.length]) : undefined;

  return (
    <main className="min-h-dvh bg-night text-cream">
      <div className="mx-auto w-full max-w-[880px] px-4 pb-24 pt-8 sm:px-6 sm:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 truncate font-terminal text-[13px] text-cream-muted">
            <b className="font-medium text-kiwi">~/divyam/stories</b>&nbsp;&nbsp;{slug}
          </p>
          <div className="flex gap-2.5">
            <Link href="/skim" className={barLink}>Skim</Link>
            <Link href={back} className={barLink}>← Back to the map</Link>
          </div>
        </div>

        <header className="mt-12">
          {world ? (
            <p className="flex items-center gap-2 font-terminal text-[12.5px] text-cream-muted">
              <span aria-hidden className="size-[9px] rounded-full border-[1.5px] border-night" style={{ background: world.color }} />
              {world.name.toLowerCase()}&nbsp;&nbsp;·&nbsp;&nbsp;{world.label}
            </p>
          ) : null}
          <h1 className="mt-3 font-display text-[38px] font-bold leading-[1.02] sm:text-[52px]">{project.title}</h1>
          <p className="mt-5 max-w-[700px] font-display text-[19px] font-medium leading-[1.5] text-cream-muted">{project.description}</p>

          <dl className="mt-7 grid grid-cols-[72px_1fr] gap-x-3 gap-y-2.5 border-t border-cream/12 pt-5 font-display text-[16px]">
            <dt className="pt-0.5 font-terminal text-[12px] text-kiwi">when</dt>
            <dd>{project.date}</dd>
            <dt className="pt-0.5 font-terminal text-[12px] text-kiwi">role</dt>
            <dd>{project.role}</dd>
            <dt className="pt-1.5 font-terminal text-[12px] text-kiwi">stack</dt>
            <dd className="flex flex-wrap gap-2">
              {project.techStack.map((s) => (
                <span key={s} className="rounded-full border-[1.5px] border-cream/30 px-2.5 py-[5px] font-terminal text-xs lowercase text-cream">{s}</span>
              ))}
            </dd>
          </dl>
          {item?.links?.length ? (
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {item.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={textLink}>{l.label}</a>)}
            </div>
          ) : null}
        </header>

        {project.image ? (
          <div className="mt-10 overflow-hidden rounded-[18px] border-2 border-cream/20 shadow-[4px_4px_0_#050b1c]">
            <Image src={project.image} alt="" width={1600} height={900} priority className="h-auto max-h-[480px] w-full object-cover" />
          </div>
        ) : null}

        <div className="mt-12">
          {project.sections.map((section) => (
            <section key={section.title} className="grid gap-3 border-t border-cream/12 py-8 md:grid-cols-[150px_1fr] md:gap-8">
              <h2 className="font-terminal text-[13px] font-medium lowercase text-kiwi md:pt-1">{section.title}</h2>
              <div className="min-w-0">
                <div className="space-y-4 font-display text-[17.5px] leading-[1.65] text-cream">
                  {section.paragraphs.map((p) => <p key={p}>{p}</p>)}
                </div>
                {section.list ? (
                  <ul className={`list-disc space-y-2 pl-[18px] font-display text-[17px] leading-[1.55] text-cream marker:text-cream-faint ${section.paragraphs.length ? "mt-4" : ""}`}>
                    {section.list.map((li) => <li key={li}>{li}</li>)}
                  </ul>
                ) : null}
                {section.links ? (
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {section.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={textLink}>{l.label} ↗</a>)}
                  </div>
                ) : null}
                {section.code ? (
                  <pre className="mt-5 overflow-x-auto rounded-xl border-2 border-cream/15 bg-night-card p-4 font-terminal text-[12.5px] leading-[1.7] text-cream-muted">
                    <code>{section.code.snippet}</code>
                  </pre>
                ) : null}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-cream/12 pt-8">
          <Link href={back} className={textLink}>← Back to the map</Link>
          {next && next.slug !== slug ? (
            <Link href={`/projects/${next.slug}`} className="text-right">
              <span className="block font-terminal text-[12px] text-cream-muted">next story</span>
              <span className="font-display text-[18px] font-semibold text-cream underline decoration-carrot decoration-[3px] underline-offset-[5px] transition hover:text-sunshine">{next.title} →</span>
            </Link>
          ) : null}
        </footer>
      </div>
    </main>
  );
}
