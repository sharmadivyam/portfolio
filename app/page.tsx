import Link from "next/link";
import { LatentSpace } from "@/components/latent-space/latent-space";

// A refresh always starts with the Big Bang; a shared link opened fresh goes straight to its world or card.
const DEEP_LINK_SCRIPT =
  "var n = performance.getEntriesByType('navigation')[0];" +
  "if (!(n && n.type === 'reload') && /[#&](world|item)=|[#&]tour(&|$)/.test(location.hash)) document.documentElement.dataset.deeplink = '';";

export default function Home() {
  return (
    <main>
      {/* Runs before first paint, so a shared link skips the landing without it flashing. */}
      <script dangerouslySetInnerHTML={{ __html: DEEP_LINK_SCRIPT }} />
      <LatentSpace />
      <noscript>
        <div className="fixed inset-x-4 bottom-4 z-50 rounded-xl bg-cream p-4 font-display text-night">
          The map needs JavaScript. Everything on it is also on{" "}
          <Link href="/skim" className="font-semibold underline">one plain page</Link>.
        </div>
      </noscript>
    </main>
  );
}
