import Link from "next/link";
import type { SVGProps } from "react";
import { ArrowRight, Mail, UserRound } from "lucide-react";

const GitHubIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.61-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.61.07-.61 1 .07 1.53 1.04 1.53 1.04.89 1.52 2.33 1.08 2.9.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.03A9.56 9.56 0 0 1 12 6.8c.86 0 1.73.12 2.54.35 1.9-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.41.1 2.66.64.7 1.03 1.59 1.03 2.68 0 3.83-2.34 4.68-4.58 4.93.36.31.68.9.68 1.82 0 1.31-.01 2.36-.01 2.68 0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
  </svg>
);

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="3" />
    <path d="M8 11v6" />
    <path d="M8 8v1" />
    <path d="M12 17v-5" />
    <path d="M16 17v-3a2 2 0 0 0-2-2h-1" />
  </svg>
);

const linkGroups = [
  {
    items: [
      {
        label: "My Resume",
        href: "https://drive.google.com/file/d/1E0QOTR2uLefoy9IRS6BD_riyYTdBYibd/view?usp=sharing",
        icon: UserRound,
      },
      { label: "Email Me", href: "mailto:sharmadivyam86@gmail.com", icon: Mail },
    ],
  },
  {
    items: [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/divyam-sharma-4a8a562b0/",
        icon: LinkedInIcon,
      },
      { label: "GitHub", href: "https://github.com/sharmadivyam", icon: GitHubIcon },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#FBFAF8]">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-12 sm:px-6 md:grid-cols-[1fr_1.35fr] md:items-start lg:px-8">
        <div className="space-y-6">
          <Link href="/" className="inline-flex items-center gap-4 text-[#292B30]">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#B85A2E] text-sm font-black text-[#B85A2E]">
              D
            </span>
            <span className="text-base font-semibold tracking-tight">Divyam</span>
          </Link>

        </div>

        <nav
          aria-label="Footer links"
          className="grid gap-x-20 gap-y-3 sm:grid-cols-2 md:justify-self-end"
        >
          {linkGroups.map((group, index) => (
            <div key={index} className="space-y-3">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    prefetch={false}
                    className="group grid min-w-64 grid-cols-[1.5rem_1fr_1.25rem] items-center gap-5 py-1 text-sm font-medium text-[#292B30] transition duration-200 hover:text-[#B85A2E] active:text-[#B85A2E]"
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    <Icon className="h-5 w-5 text-[#292B30] transition duration-200 group-hover:text-[#B85A2E] group-active:text-[#B85A2E]" />
                    <span>{item.label}</span>
                    <span className="flex items-center justify-end text-[#B85A2E] transition-transform duration-200 group-hover:translate-x-1 group-active:translate-x-1">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
