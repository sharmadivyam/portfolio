import type { LayoutGridCard } from "@/components/ui/layout-grid";

export const contactCards: LayoutGridCard[] = [
  {
    id: 1,
    content: "Work",
    className: "md:col-span-2",
    thumbnail: "/grid/work.svg",
    href: "/work",
  },
  {
    id: 2,
    content: "About",
    className: "md:col-span-1",
    thumbnail: "/grid/about.svg",
    href: "/about",
  },
  {
    id: 3,
    content: "Resume",
    className: "md:col-span-1",
    thumbnail: "/grid/blog.svg",
  },
  {
    id: 4,
    content: "Contact",
    className: "md:col-span-1",
    thumbnail: "/grid/contact.svg",
    href: "/#contact",
  },
  {
    id: 5,
    content: "GitHub",
    className: "md:col-span-2",
    thumbnail: "/grid/github.svg",
    href: "https://github.com/",
    external: true,
  },
  {
    id: 6,
    content: "LinkedIn",
    className: "md:col-span-1",
    thumbnail: "/grid/linkedin.svg",
    href: "https://www.linkedin.com/",
    external: true,
  },
];
