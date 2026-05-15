import { SiteHeader } from "@/components/site-header";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import aboutImage1 from "./1.jpg";
import aboutImage2 from "./2.jpg";
import aboutImage3 from "./3.jpg";
import aboutImage4 from "./4.jpg";
import aboutImage5 from "./5.jpg";
import aboutImage6 from "./6.jpg";

const galleryImages = [
  { src: aboutImage1.src, alt: "Portrait in warm light" },
  { src: aboutImage2.src, alt: "Candid outdoor moment" },
  { src: aboutImage3.src, alt: "Close-up portrait" },
  { src: aboutImage4.src, alt: "Lifestyle frame" },
  { src: aboutImage5.src, alt: "Studio-inspired portrait" },
  { src: aboutImage6.src, alt: "Natural light portrait" },
];

const infoItems = [
  {
    label: "EXPERIENCE",
    value: "1+ years",
    icon: "01",
  },
  {
    label: "LOCATION",
    value: "Greater Noida",
    icon: "02",
  },
  {
    label: "FREELANCE",
    value: "Available",
    icon: "03",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F7F2EF] text-[#292B30]">
      <SiteHeader activePage="about" />

      <section className="w-full border-b border-[#E8DDD7] py-24 pt-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <h1 className="mb-10 text-6xl font-bold leading-[0.9] tracking-tight text-[#292B30] md:text-8xl">
            About
          </h1>

          <InfiniteMovingCards
            images={galleryImages}
            direction="right"
            speed={14}
          />

          <div className="mt-14 max-w-6xl">
            <h2 className="max-w-4xl text-4xl font-semibold leading-[0.98] tracking-tight text-[#292B30] sm:text-6xl">
              I&apos;m a designer, developer, & AI enthusiast.
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
                    <span className="mr-2 text-xs tracking-[0.28em] text-[#5F5A56]">
                      {item.icon}
                    </span>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
