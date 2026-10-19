import { items, skills, worlds, type Item, type Skill, type World } from "@/data/portfolio";

// Search over worlds, places and skills, ranked by where a word appears: a title or tag counts far more than a
// passing mention in a bullet. Words match whole words or their beginnings ("prod" finds "product"), never the
// middle of another word, and a few common terms also look for what they usually mean ("ai" finds LLM work).

type Found = { kind: "world"; world: World; index: number } | { kind: "item"; item: Item } | { kind: "skill"; skill: Skill };
export type Hit = Found & { score: number };

/** Common phrases searched as one idea. */
const PHRASES: [RegExp, string][] = [
  [/\bmachine learning\b/g, "ml"],
  [/\bartificial intelligence\b/g, "ai"],
  [/\bgen(erative)? ai\b/g, "genai"],
  [/\blarge language models?\b/g, "llm"],
  [/\bproduct management\b/g, "pm"],
];

/** What a search word usually means on this map; these related words count for a little less. */
const RELATED: Record<string, string[]> = {
  ai: ["llm", "agents", "rag", "gemini", "machine learning"],
  genai: ["llm", "rag", "agents"],
  llm: ["ai", "rag", "agents", "gemini", "qwen", "gemma"],
  agent: ["agents", "langgraph"],
  ml: ["machine learning", "model", "models", "training", "fine-tuning", "pytorch"],
  product: ["product management", "pm"],
  pm: ["product management", "product"],
  intern: ["internship", "role"],
  internship: ["intern", "role"],
  job: ["role", "intern"],
  work: ["role", "intern", "worked"],
  experience: ["role", "intern", "worked"],
  company: ["role", "intern"],
  backend: ["api", "django", "fastapi", "rest"],
  frontend: ["react", "typescript", "dashboard"],
  data: ["sql", "analytics", "dashboard", "pandas"],
  analytics: ["sql", "dashboard", "superset", "funnel", "event tracking"],
  search: ["retrieval", "citation", "rag"],
  vision: ["computer vision", "cnn", "image", "images"],
  cv: ["computer vision", "cnn", "images"],
  edge: ["raspberry", "tflite", "on-device"],
  research: ["replication", "arxiv", "research"],
  rag: ["retrieval", "vector", "qdrant", "chromadb"],
  nlp: ["text", "language", "transformers", "bert", "readability"],
  hobby: ["hobbies", "hobby"],
  fun: ["hobby", "hobbies"],
  teaching: ["teaching assistant", "ta", "students"],
  college: ["university", "degree"],
  education: ["university", "degree", "school"],
};

type Field = { words: string[]; text: string; weight: number };
type Doc = { hit: Found; fields: Field[] };

const tokenize = (text: string) => text.toLowerCase().split(/[^a-z0-9+#]+/).filter(Boolean);
const field = (text: string | undefined, weight: number): Field => ({ words: tokenize(text ?? ""), text: ` ${tokenize(text ?? "").join(" ")} `, weight });

const DOCS: Doc[] = [
  ...worlds.map((world, index): Doc => ({
    hit: { kind: "world", world, index },
    fields: [field(world.name, 8), field(world.label, 8), field(world.description, 3), field(world.tour, 1)],
  })),
  ...items.map((item): Doc => ({
    hit: { kind: "item", item },
    fields: [
      field([item.name, item.short, item.title].filter(Boolean).join(" "), 6), field(item.tags, 4),
      field([item.context, item.kind].filter(Boolean).join(" "), 3), field((item.stack ?? []).join(" "), 3),
      field(item.blurb, 2), field((item.bullets ?? []).join(" "), 1),
    ],
  })),
  ...skills.map((skill): Doc => ({ hit: { kind: "skill", skill }, fields: [field(skill.name, 6), field(skill.note, 1.5)] })),
];

/**
 * How well one term matches a field: a whole word or phrase scores fully, the start of a word (three letters or
 * more, so "ai" never matches "aim") a bit less. Related words only count as whole words.
 */
function termScore(raw: string, f: Field, prefix = true) {
  const term = tokenize(raw).join(" ");
  if (term.includes(" ")) return f.text.includes(` ${term} `) ? f.weight : 0;
  if (f.words.includes(term)) return f.weight;
  return prefix && term.length >= 3 && f.words.some((w) => w.startsWith(term)) ? f.weight * 0.7 : 0;
}

export function search(query: string): Hit[] {
  // A trailing "s" is dropped so "products" also finds "product" (and, as a prefix, "products" again).
  const phrased = PHRASES.reduce((q, [pattern, short]) => q.replace(pattern, short), query.toLowerCase());
  const words = tokenize(phrased).map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
  if (!words.length) return [];
  const hits: Hit[] = [];
  for (const doc of DOCS) {
    let total = 0;
    // Every word in the query has to land somewhere, directly or through a related word.
    const allFound = words.every((word) => {
      const direct = Math.max(...doc.fields.map((f) => termScore(word, f)));
      const related = Math.max(0, ...(RELATED[word] ?? []).flatMap((r) => doc.fields.map((f) => termScore(r, f, false) * 0.6)));
      total += Math.max(direct, related);
      return direct > 0 || related > 0;
    });
    if (allFound) hits.push({ ...doc.hit, score: total });
  }
  return hits.sort((a, b) => b.score - a.score);
}
