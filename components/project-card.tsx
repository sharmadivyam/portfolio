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
      <article className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E8DDD7] bg-[#FFF9F6] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#B85A2E] active:-translate-y-0.5 active:border-[#B85A2E]">
        <div className="flex flex-col gap-5 p-3 sm:p-4 lg:flex-row lg:items-stretch">
          <div className="relative min-h-[260px] overflow-hidden rounded-xl lg:min-h-[320px] lg:w-[55%]">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition duration-200 ease-out"
              sizes="(max-width: 1023px) 100vw, 55vw"
            />
          </div>

          <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 lg:p-6 xl:p-8">
            <div>
              <h2 className="text-3xl font-bold leading-[0.95] tracking-tight text-[#292B30] sm:text-4xl">
                {title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5F5A56] sm:text-base">
                {description}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#5F5A56]">
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
