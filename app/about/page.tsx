import { SiteHeader } from "@/components/site-header";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import aboutImage1 from "./1.jpg";
import aboutImage2 from "./2.jpg";
import aboutImage3 from "./3.jpg";
import aboutImage4 from "./4.jpg";
import aboutImage5 from "./5.jpg";
import aboutImage6 from "./6.jpg";
import aboutImage7 from "./7.jpg";
import aboutImage8 from "./8.jpg";
import aboutImage9 from "./9.jpeg";

const galleryImages = [
  { src: aboutImage1.src, alt: "Portrait in warm light" },
  { src: aboutImage2.src, alt: "Candid outdoor moment" },
  { src: aboutImage3.src, alt: "Close-up portrait" },
  { src: aboutImage4.src, alt: "Lifestyle frame" },
  { src: aboutImage5.src, alt: "Studio-inspired portrait" },
  { src: aboutImage6.src, alt: "Natural light portrait" },
  { src: aboutImage7.src, alt: "X" },
  { src: aboutImage8.src, alt: "Y" },
  { src: aboutImage9.src, alt: "Z" },
];

const infoItems = [
  {
    label: "EXPERIENCE",
    value: "1+ years",
  },
  {
    label: "LOCATION",
    value: "Greater Noida",
  },
  {
    label: "FREELANCE",
    value: "Available",
  },
];

const experienceItems = [
  {
    company: "VVDN Technologies",
    date: "July 2025 - August 2025",
    role: "SOFTWARE DEVELOPMENT INTERN",
    bullets: [
      "Built 10+ REST APIs using Django and DRF for a role-based task management system with Admin, Manager, and Employee access tiers",
      "Implemented JWT authentication via SimpleJWT with custom middleware for request validation, logging, and secure endpoint access",
      "Designed normalized database schemas and modular API structure for scalable feature additions without breaking data integrity",
    ],
  },
  {
    company: "Stotio",
    date: "August 2025 - October 2025",
    role: "PRODUCT INTERN",
    bullets: [
      "Analyzed user flows and platform functionality to identify UX bottlenecks",
      "Delivered data-backed product recommendations and structured requirements for feature enhancements",
      "Contributed to multi-channel outreach initiatives to grow brand presence",
    ],
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F7F2EF] text-[#292B30]">
      <SiteHeader activePage="about" />

      <section className="w-full border-b border-[#E8DDD7] py-24 pt-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <h1 className="mb-10 font-serif text-6xl font-normal italic leading-[0.9] tracking-normal text-[#292B30] sm:text-7xl md:text-8xl">
            About
          </h1>

          <InfiniteMovingCards
            images={galleryImages}
            direction="right"
            speed={14}
          />

          <div className="mt-14 w-full">
            <h2 className="max-w-4xl text-4xl font-semibold leading-[0.98] tracking-tight text-[#292B30] sm:text-6xl">
              I&apos;m a developer, ML builder, & AI{" "}
              <span className="text-[#B85A2E]">tinkerer.</span>
            </h2>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {infoItems.map((item) => (
                <div key={item.label} className="w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-xs tracking-[0.32em] text-[#B85A2E]">
                      {item.label}
                    </span>
                    <span className="h-px flex-1 bg-[#E8DDD7]" />
                  </div>

                  <p className="mt-4 text-xl text-[#292B30] sm:text-2xl">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-14 w-full space-y-5 text-base font-medium leading-7 text-[#292B30] sm:text-lg sm:leading-8">
              <p>
                I&apos;m an AI engineer and CS undergrad at Shiv Nadar University,
                specializing in AI/ML with a minor in Economics. I got into this
                space because building intelligent systems genuinely fascinates
                me, the idea that you can teach a machine to reason, predict, and
                adapt never really gets old.
              </p>
              <p>
                Most of my work lives at the intersection of ML and real
                engineering: fine-tuning transformers, building backend systems,
                and figuring out how to make models actually useful outside a
                notebook.
              </p>
              <p>
                Lately I&apos;ve been deep in agentic AI, experimenting with
                LangChain and exploring how autonomous agents can handle real
                workflows beyond simple prompt-response loops.
              </p>
              <p>
                I&apos;ve also taught DSA and Operating Systems to 370+ students,
                moderated an AI roundtable with CTOs, and curated XCELERATE 3.0,
                a national-level ideathon with 250+ submissions. I&apos;m usually
                the one who ships first and keeps things moving.
              </p>
              <p>
                When I&apos;m not building, you&apos;ll find me watching Friends, eating
                good food, or somewhere between humming a song or listening to
                one.
              </p>
            </div>

            <div className="mt-16 border-t border-[#E8DDD7] pt-16">
              <div className="flex items-center gap-2">
                <h3 className="text-xs tracking-[0.32em] text-[#B85A2E]">
                  EXPERIENCE
                </h3>
                <span className="h-px flex-1 bg-[#E8DDD7]" />
              </div>

              <div className="mt-8">
                {experienceItems.map((item) => (
                  <article
                    key={item.company}
                    className="border-b border-[#E8DDD7] py-8"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <h4 className="text-xl font-semibold text-[#292B30]">
                        {item.company}
                      </h4>
                      <p className="shrink-0 text-right text-sm text-[#5F5A56]">
                        {item.date}
                      </p>
                    </div>

                    <p className="mt-2 text-xs tracking-[0.28em] text-[#B85A2E] uppercase">
                      {item.role}
                    </p>

                    <ul className="mt-4 space-y-2">
                      {item.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex gap-3 text-sm leading-7 text-[#5F5A56]"
                        >
                          <span aria-hidden="true">·</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
