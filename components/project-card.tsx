import Image from "next/image";
import Link from "next/link";
import { CalendarDays, User2 } from "lucide-react";

type ProjectCardProps = {
  slug: string;
  title: string;
  description: string;
  image: string;
  author: string;
  date: string;
};

export function ProjectCard({
  slug,
  title,
  description,
  image,
  author,
  date,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${slug}`} className="block">
      <article className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/8 bg-zinc-900/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-zinc-700">
        <div className="absolute inset-x-10 top-8 -z-10 h-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),rgba(255,255,255,0))] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

        <div className="flex flex-col gap-5 p-3 sm:p-4 lg:flex-row lg:items-stretch">
          <div className="relative min-h-[260px] overflow-hidden rounded-xl lg:min-h-[320px] lg:w-[55%]">
            <div className="absolute inset-0 z-10 bg-gradient-to-tr from-black/25 via-transparent to-white/10" />
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1023px) 100vw, 55vw"
            />
          </div>

          <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 lg:p-6 xl:p-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                {description}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <User2 className="h-4 w-4" />
                <span>{author}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{date}</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
