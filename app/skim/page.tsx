import type { Metadata } from "next";
import Link from "next/link";
import { getItem, highlights, profile, skillGroups, skimGroups, type Item } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Skim everything | Divyam Sharma",
  description: profile.pitch,
};

const textLink = "font-display text-base font-semibold text-cream underline decoration-carrot decoration-[3px] underline-offset-[5px] transition hover:text-sunshine";

function Entry({ item }: { item: Item }) {
  const meta = [item.context, item.when, item.status].filter(Boolean);
  return (
    <article className="border-t border-cream/12 py-6">
      <h3 className="font-display text-[21px] font-bold leading-snug text-cream">{item.title ?? item.name}</h3>
      {meta.length ? <p className="mt-1 font-terminal text-[12.5px] leading-[1.7] text-cream-muted">{meta.join("   ")}</p> : null}
      {item.bullets ? (
        <ul className="mt-3 list-disc space-y-1.5 pl-[18px] font-display text-[16.5px] leading-[1.55] text-cream marker:text-cream-faint">
          {item.bullets.map((b) => <li key={b}>{b}</li>)}
        </ul>
      ) : (
        <p className="mt-3 font-display text-[16.5px] leading-[1.55] text-cream">{item.blurb}</p>
      )}
      {item.stack ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.stack.map((s) => (
            <span key={s} className="rounded-full border-[1.5px] border-cream/30 px-2.5 py-[5px] font-terminal text-xs lowercase text-cream">{s}</span>
          ))}
        </div>
      ) : null}
      {item.links || item.story ? (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {item.links?.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={textLink}>{l.label}</a>)}
          {item.story ? <Link href={`/projects/${item.story}`} className={textLink}>Full story →</Link> : null}
        </div>
      ) : null}
    </article>
  );
}

export default function SkimPage() {
  return (
    <main className="min-h-dvh bg-night text-cream">
      <div className="mx-auto w-full max-w-[880px] px-4 pb-24 pt-8 sm:px-6 sm:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-terminal text-[13px] text-cream-muted">
            <b className="font-medium text-kiwi">~/divyam/skim</b>&nbsp;&nbsp;everything on one page
          </p>
          <Link href="/" className="rounded-xl border-2 border-cream/30 px-4 py-2 font-display text-[15px] font-semibold transition hover:border-cream">
            ← Back to the map
          </Link>
        </div>

        <h1 className="mt-10 font-display text-[52px] font-bold uppercase leading-[0.9] sm:text-[72px]">{profile.name}</h1>
        <p className="mt-4 max-w-[640px] font-display text-[18px] font-medium leading-[1.5]">{profile.pitch}</p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
          <a href={profile.links.resume} target="_blank" rel="noreferrer" className={textLink}>Resume ↗</a>
          <a href={profile.links.github} target="_blank" rel="noreferrer" className={textLink}>GitHub ↗</a>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className={textLink}>LinkedIn ↗</a>
          <Link href="/contact" className={textLink}>Contact</Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {highlights.map((h) => (
            <div key={h.value} className="rounded-2xl border-2 border-cream/20 bg-night-card p-4">
              <b className="block font-display text-[26px] font-bold leading-tight">{h.value}</b>
              <span className="mt-1.5 block font-display text-[14px] leading-snug text-cream-muted">{h.label}</span>
            </div>
          ))}
        </div>

        {skimGroups.map((group) => (
          <section key={group.title} className="mt-14">
            <h2 className="font-terminal text-[13px] font-medium text-kiwi">{group.title}</h2>
            <div className="mt-3">
              {group.ids.map((id) => {
                const item = getItem(id);
                return item ? <Entry key={id} item={item} /> : null;
              })}
            </div>
          </section>
        ))}

        <section className="mt-14">
          <h2 className="font-terminal text-[13px] font-medium text-kiwi">skills</h2>
          <div className="mt-3 border-t border-cream/12">
            {skillGroups.map((g) => (
              <div key={g.title} className="flex flex-col gap-2 border-b border-cream/12 py-4 sm:flex-row sm:gap-6">
                <span className="w-48 shrink-0 font-terminal text-[12.5px] text-cream-muted">{g.title}</span>
                <span className="flex flex-wrap gap-2">
                  {g.skills.map((s) => (
                    <span key={s} className="rounded-full border-[1.5px] border-cream/30 px-2.5 py-[5px] font-terminal text-xs text-cream">{s}</span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
