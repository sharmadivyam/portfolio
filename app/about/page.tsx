import { Playfair_Display } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { LayoutGrid } from "@/components/ui/layout-grid";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { contactCards } from "@/data/contact-cards";
import aboutImage1 from "./1.jpg";
import aboutImage2 from "./2.jpg";
import aboutImage3 from "./3.jpg";
import aboutImage4 from "./4.jpg";
import aboutImage5 from "./5.jpg";
import aboutImage6 from "./6.jpg";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["400"],
  display: "swap",
});

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
    icon: "\u23f3",
  },
  {
    label: "LOCATION",
    value: "Greater Noida",
    icon: "\ud83d\udccd",
  },
  {
    label: "FREELANCE",
    value: "Available",
    icon: "\ud83d\udc4b",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteHeader activePage="about" />

      <section className="w-full py-20 pt-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <h1
            className={`${playfairDisplay.className} mb-10 text-5xl font-normal italic text-neutral-300 md:text-6xl`}
          >
            About
          </h1>

          <InfiniteMovingCards
            images={galleryImages}
            direction="right"
            speed={14}
          />

          <div className="mt-14 max-w-6xl">
            <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              I&apos;m a designer, developer, & AI enthusiast.
            </h2>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {infoItems.map((item) => (
                <div key={item.label} className="w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-xs tracking-[0.28em] text-zinc-500">
                      {item.label}
                    </span>
                    <span className="h-px flex-1 bg-zinc-700" />
                  </div>

                  <p className="mt-4 text-xl text-white sm:text-2xl">
                    <span className="mr-2">{item.icon}</span>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
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
