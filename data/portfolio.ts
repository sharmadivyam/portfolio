// Everything the map, the detail cards, the tour and /skim show comes from this file.
// Latent coordinates are hand-placed to read like a 2D projection of embeddings.

export type WorldKey = "origin" | "campus" | "lab" | "junction" | "edge" | "experience" | "off-duty";

export type World = {
  key: WorldKey;
  name: string;
  label: string;
  color: string;
  at: [number, number];
  description: string;
  tour: string;
};

export type ItemLink = { label: string; href: string };

export type Item = {
  id: string;
  world: WorldKey;
  /** Offset from the world's centre in latent space. */
  offset: [number, number];
  /** Which object in the world's scene holds this item. */
  object: string;
  kind: string;
  name: string;
  /** Pin and summary label; defaults to `name`. */
  short?: string;
  blurb: string;
  tags: string;
  title?: string;
  context?: string;
  when?: string;
  status?: string;
  bullets?: string[];
  stack?: string[];
  links?: ItemLink[];
  /** Slug of a /projects page with the full write-up. */
  story?: string;
};

export type Skill = { name: string; at: [number, number] };

// Array order is the story order used when hopping and on the tour.
export const worlds: World[] = [
  {
    key: "origin", name: "Origin", label: "(0, 0)", color: "#f6c85f", at: [0, 0.02],
    description: "Where it starts, in Mathura: home, St. Dominic's, a temple, and Vishram Ghat at dusk.",
    tour: "Home is Mathura: St. Dominic's for school, temple bells, and evening aarti at Vishram Ghat. Every other point on this map is measured from here.",
  },
  {
    key: "campus", name: "The Campus", label: "university", color: "#b9a6f2", at: [0, -0.72],
    description: "Shiv Nadar University: a CSE degree with an Economics minor, teaching, and everything I organised and played on the side.",
    tour: "Shiv Nadar University: Computer Science with a minor in Economics. Teaching assistant for DSA and OS (370+ students), student ambassador, E-Cell marketing lead, XCELERATE 3.0 curation lead, and the university volleyball team.",
  },
  {
    key: "lab", name: "The Lab", label: "models and research", color: "#f2b66d", at: [-0.82, -0.36],
    description: "Late-night training runs: distillation, fine-tuning, readability models.",
    tour: "Models and research: Qwen → Gemma distillation, NeoBERT + LoRA price prediction (41.6 SMAPE), and LexiGrade.",
  },
  {
    key: "junction", name: "The Junction", label: "ai systems", color: "#6fd3c1", at: [0.82, -0.36],
    description: "AI systems I've built: agents, RAG and infrastructure. Requests arrive, get routed, and leave with an answer.",
    tour: "AI systems I built: Relay, a self-hosted AI gateway; WHAT IF?, a five-agent RAG engine; and GroomMe, recommendations grounded in what you own.",
  },
  {
    key: "edge", name: "The Edge", label: "on-device ml", color: "#9bd67a", at: [-0.82, 0.42],
    description: "Small models doing real work on small hardware.",
    tour: "On-device ML: a waste classifier at 97% accuracy, under 100 ms on a Raspberry Pi.",
  },
  {
    key: "experience", name: "Experience", label: "where I've worked", color: "#f08a6b", at: [0.82, 0.42],
    description: "Where I've worked: shipping for real users, from a startup's production AI to fintech at scale.",
    tour: "Work: product management at Paytm, with gift-voucher portals, a 20+ chart dashboard leadership uses, and event design; production AI at Savra that made question generation 10× cheaper; product at Stotio; APIs at VVDN. ZS Associates is next.",
  },
  {
    key: "off-duty", name: "Off Duty", label: "hobbies", color: "#7fb8ff", at: [0, 0.74],
    description: "Singing, cooking, movies, badminton, cricket. Who's here when the laptop closes.",
    tour: "Off duty: singing, cooking, movies (Friends on repeat), badminton and cricket.",
  },
];

export const items: Item[] = [
  // Origin
  { id: "home", world: "origin", offset: [0.0, -0.09], object: "house", kind: "place", name: "Home in Mathura", short: "Home",
    blurb: "Where it starts. Everything on this map is measured from here.", tags: "home india mathura origin" },
  { id: "photos", world: "origin", offset: [-0.1, -0.03], object: "line", kind: "life", name: "The clothesline", short: "Clothesline",
    blurb: "Photos from my life, pegged on a rooftop line.", tags: "photos about life" },
  { id: "school", world: "origin", offset: [-0.1, 0.07], object: "school", kind: "school", name: "St. Dominic's Senior Secondary School", short: "St. Dominic's",
    blurb: "Where I went to school: a convent school in Mathura Cantt.", tags: "school st dominics convent cbse mathura education",
    context: "Mathura Cantt" },
  { id: "temple", world: "origin", offset: [0.02, 0.09], object: "temple", kind: "place", name: "Krishna's city", short: "The temple",
    blurb: "Mathura is Krishna's birthplace. Temple bells and saffron flags are part of growing up here.", tags: "temple krishna mathura" },
  { id: "ghat", world: "origin", offset: [0.1, 0.03], object: "ghat", kind: "place", name: "Vishram Ghat", short: "Vishram Ghat",
    blurb: "Evening aarti at Vishram Ghat, with diyas floating down the Yamuna.", tags: "mathura yamuna ghat river vishram aarti" },

  // The Campus
  { id: "snu", world: "campus", offset: [-0.07, -0.09], object: "cse", kind: "education", name: "Computer Science and Engineering", short: "CSE Major",
    blurb: "My major: an undergraduate degree in Computer Science and Engineering at Shiv Nadar University.",
    tags: "university cs cse computer science engineering degree major shiv nadar",
    title: "Computer Science and Engineering at Shiv Nadar University", context: "major" },
  { id: "eco", world: "campus", offset: [0.03, -0.11], object: "eco", kind: "education", name: "Economics minor", short: "Eco Minor",
    blurb: "A minor alongside CSE, exploring where technology meets financial systems.", tags: "economics minor finance",
    title: "Minor in Economics", context: "Shiv Nadar University" },
  { id: "teach", world: "campus", offset: [0.11, -0.05], object: "teach", kind: "teaching", name: "Teaching Assistant, DSA and OS", short: "Teaching Assistant",
    blurb: "Teaching assistant for Data Structures and Algorithms and for Operating Systems, for 370+ students.",
    tags: "teaching assistant ta dsa data structures algorithms os operating systems students",
    title: "Teaching Assistant for DSA and Operating Systems", context: "370+ students" },
  { id: "ambassador", world: "campus", offset: [0.0, 0.0], object: "ambassador", kind: "community", name: "Student Ambassador", short: "Student Ambassador",
    blurb: "As a student ambassador, I moderated an AI roundtable with CTOs.", tags: "student ambassador ai roundtable ctos community" },
  { id: "ecell", world: "campus", offset: [-0.11, 0.02], object: "ecell", kind: "community", name: "Marketing Lead, E-Cell", short: "Marketing, E-Cell",
    blurb: "Marketing lead for E-Cell, the university's entrepreneurship cell.", tags: "ecell e-cell entrepreneurship marketing lead",
    title: "Marketing Lead at E-Cell" },
  { id: "xcel", world: "campus", offset: [0.1, 0.06], object: "xcel", kind: "community", name: "Curation Lead, XCELERATE 3.0", short: "Curation Lead",
    blurb: "Curation lead for XCELERATE 3.0, a national-level ideathon with 250+ submissions.", tags: "xcelerate ideathon curation lead events community",
    title: "Curation Lead for XCELERATE 3.0" },
  { id: "volley", world: "campus", offset: [-0.06, 0.1], object: "volley", kind: "sport", name: "University volleyball team", short: "Volleyball Team",
    blurb: "Played for the university volleyball team.", tags: "volleyball sport team university" },

  // The Lab
  { id: "distill", world: "lab", offset: [0.05, -0.04], object: "monitor", kind: "project", name: "LLM distillation", short: "Distillation",
    blurb: "Qwen → Gemma auxiliary-logit transfer; trait shifts from ~2% to 15–18%.", tags: "distillation llm pytorch research qwen gemma nlp",
    title: "LLM distillation and model behaviour", context: "research project", when: "Jan 2026",
    bullets: [
      "Qwen → Gemma distillation pipeline with auxiliary-logit transfer.",
      "Found trait shifts from ~2% to 15–18%, pointing to strong initialisation bias in the student model.",
      "Tuned batch size, learning rate and logit weighting for more stable cross-architecture transfer.",
    ],
    stack: ["Python", "PyTorch", "Transformers"],
    links: [{ label: "GitHub ↗", href: "https://github.com/sharmadivyam/Subliminal_learning_LLMs_MNIST" }],
    story: "llm-distillation-model-behavior-analysis" },
  { id: "price", world: "lab", offset: [0.11, 0.06], object: "board", kind: "project", name: "Smart Price Prediction", short: "Smart Price",
    blurb: "NeoBERT + LoRA on noisy catalog text. 41.6 SMAPE.", tags: "nlp lora transformers regression bert amazon",
    context: "Amazon ML Challenge 2025", when: "Oct 2025",
    bullets: [
      "Fine-tuned NeoBERT with LoRA on the Q and V projections: about 97% fewer trainable parameters.",
      "Log-scaled targets and a SMAPE loss for noisy, right-skewed prices. 41.6 SMAPE on validation.",
    ],
    stack: ["PyTorch", "NeoBERT", "LoRA", "Transformers"],
    story: "smart-price-prediction" },
  { id: "lexi", world: "lab", offset: [-0.1, 0.05], object: "shelf", kind: "project", name: "LexiGrade",
    blurb: "LightGBM over MiniLM embeddings plus six readability indices.", tags: "nlp lightgbm embeddings readability",
    title: "LexiGrade: a readability classifier", when: "Apr 2026",
    bullets: [
      "LightGBM over MiniLM embeddings plus handcrafted linguistic features, with 2.5× weighting for the rare expert class.",
      "A calibrated fusion layer across six readability indices, with an ML override for cases the formulas get wrong.",
    ],
    stack: ["LightGBM", "all-MiniLM-L6-v2", "Scikit-learn"],
    story: "lexigrade-text-readability-classifier" },
  { id: "torch", world: "lab", offset: [-0.04, -0.11], object: "gpu", kind: "skills", name: "PyTorch, Transformers, LoRA", short: "PyTorch",
    blurb: "The tools on the bench.", tags: "pytorch transformers lora peft" },
  { id: "chai", world: "lab", offset: [0.0, 0.12], object: "chai", kind: "fuel", name: "Chai",
    blurb: "Required for every training run.", tags: "chai" },

  // The Junction
  { id: "gateway", world: "junction", offset: [0.0, -0.02], object: "tower", kind: "project", status: "new", name: "Relay, my AI gateway", short: "Relay",
    blurb: "Self-hosted AI gateway: auth, guardrails, semantic cache and routing in front of any LLM.",
    tags: "gateway infra llm routing backend agents relay cache guardrails",
    title: "Relay: a self-hosted AI gateway", context: "personal project",
    bullets: [
      "One OpenAI-compatible endpoint in front of Cerebras, OpenAI, Gemini and 100+ other providers via litellm. Clients change nothing.",
      "Guardrails both ways: 26+ injection and jailbreak patterns with a semantic fallback on the way in, PII redaction on the way out.",
      "Semantic cache (ChromaDB, cosine ≥ 0.95, 24 h TTL) answers repeat questions without a new LLM call; optional smart routing and LLMLingua-2 compression cut cost further.",
      "Live React dashboard for cost, latency, cache hits and guardrail actions. 149 tests, 61 golden eval cases, CI on every push.",
    ],
    stack: ["Python", "FastAPI", "PostgreSQL", "Redis", "ChromaDB", "litellm", "React", "Docker"],
    links: [{ label: "GitHub ↗", href: "https://github.com/sharmadivyam/relay-ai-gateway" }] },
  { id: "whatif", world: "junction", offset: [-0.1, -0.06], object: "platA", kind: "project", name: "WHAT IF?",
    blurb: "5-agent LangGraph RAG pipeline. Verified facts and simulation never mix.", tags: "agents rag langgraph chromadb llm history",
    title: "WHAT IF? A counterfactual history engine", context: "personal project", when: "Jan 2026",
    bullets: [
      "Five LangGraph agents (understand → retrieve → ground → reason → score), each returning a validated Pydantic model.",
      "Verified facts and simulated consequences never mix: every fact is cited, and every reasoning step is scored by how much evidence backs it, not by the model's own confidence.",
      "When local similarity drops below 0.6 it fetches Wikipedia live, embeds and re-searches, with zero extra LLM calls.",
      "A hard 4-step cap guards against runaway speculation and held in 8 of 8 evaluation cases. Runs at ₹0.",
    ],
    stack: ["Python", "LangGraph", "ChromaDB", "Pydantic", "Cerebras", "Streamlit"],
    links: [
      { label: "GitHub ↗", href: "https://github.com/sharmadivyam/what-if" },
      { label: "Live demo ↗", href: "https://what-iff.streamlit.app" },
    ],
    story: "what-if-counterfactual-history-engine" },
  { id: "groomme", world: "junction", offset: [0.07, 0.1], object: "van", kind: "project", name: "GroomMe",
    blurb: "DRF + Gemini outfit suggestions grounded in what you own.", tags: "gemini django recommendation llm backend",
    title: "GroomMe: an AI recommendation engine", context: "personal project", when: "Aug 2025",
    bullets: [
      "DRF backend with normalised wardrobe and preference schemas, behind JWT auth and validation middleware.",
      "Gemini suggestions grounded in what the user actually owns, through prompt conditioning and attribute filtering.",
    ],
    stack: ["Django", "DRF", "Gemini API", "SQLite", "JWT"],
    story: "groomme-ai-recommendation-engine" },

  // The Edge
  { id: "waste", world: "edge", offset: [0.02, 0.0], object: "bins", kind: "project", name: "Real-time waste classification", short: "EcoBin",
    blurb: "MobileNetV2 → TFLite. 97% accuracy, under 100 ms on a Raspberry Pi.", tags: "edge tflite cv raspberry mobilenet classification ecobin",
    title: "Real-time waste classification (EcoBin)", context: "edge ML", when: "Aug 2025",
    bullets: [
      "MobileNetV2 trained on 60k+ images with augmentation and class balancing: 97% accuracy across three classes.",
      "Converted to TensorFlow Lite for under-100 ms inference on a Raspberry Pi, with no cloud round-trip.",
    ],
    stack: ["TensorFlow", "MobileNetV2", "TFLite", "Raspberry Pi"],
    links: [{ label: "GitHub ↗", href: "https://github.com/khushwant1234/EcoBin_SIH_APP" }],
    story: "real-time-waste-classification-edge-ml" },
  { id: "tflite", world: "edge", offset: [0.1, -0.08], object: "pi", kind: "skills", name: "TensorFlow Lite on a Raspberry Pi", short: "TFLite",
    blurb: "Shrinking models until they fit in your palm.", tags: "tflite edge raspberry tensorflow" },
  { id: "cv", world: "edge", offset: [-0.1, 0.06], object: "belt", kind: "skills", name: "CNNs and computer vision", short: "Vision",
    blurb: "60k+ images, augmentation, class balancing.", tags: "cnn vision cv images" },

  // Experience
  { id: "paytm", world: "experience", offset: [-0.11, -0.03], object: "paytm", kind: "role", name: "Paytm",
    blurb: "Gift-voucher portals, a 20+ chart dashboard, event design and search work.", tags: "product fintech paytm superset sql events",
    title: "Product Management Intern at Paytm", context: "Gift Vouchers and Paytm Loves EMI",
    bullets: [
      "Gift Vouchers: helped build an API integration website (reseller and brand portals) with integration docs, cutting onboarding back-and-forth and saving several man-days.",
      "Ran end-to-end voucher issuance and operations for 3 major enterprise brands; my product proposals were added to the official GV roadmap.",
      "Paytm Loves EMI: helped build a Superset dashboard (20+ charts, 60+ SQL queries including funnels) that leadership uses for feature decisions.",
      "Designed ~40 terminal events covering every user flow, and found and fixed 7 live events that were never being recorded.",
      "Worked with the Catalogue API team on null searches (10.5% of all searches) using fuzzy matching; ran offline market research and user interviews.",
    ],
    stack: ["Superset", "SQL", "Data warehouse", "Event design", "User research"] },
  { id: "savra", world: "experience", offset: [0.0, -0.09], object: "savra", kind: "role", name: "Savra", short: "Savra",
    blurb: "Shipped a grounded exam-question generator to production for K-12 teachers.",
    tags: "fde forward deployed agents deployment startup llm rag evaluation",
    title: "Forward Deployed AI Engineer at Savra", context: "K-12 ed-tech, AI question papers for teachers", when: "Aug–Oct 2026",
    bullets: [
      "Shipped a retrieval-grounded exam-question generator to production: a gated pilot serving real teachers, with automatic fallback to the legacy generator.",
      "Ran the blind four-way evaluation that overturned the inherited architecture: whole-chapter grounding beat vector retrieval, cutting cost per generation 10× (7,300 → 700 tokens).",
      "Designed the two-source architecture now in production; low-value recall questions fell from 23% to 0%.",
      "Rebuilt chunking across a 26,150-passage corpus (page furniture 59.2% → 0.5%) and found a PDF defect silently affecting 12.8% of all text.",
      "Caught a production data incident a day before launch. ~76,000 lines of Python and 1,588 tests.",
    ],
    stack: ["Python", "FastAPI", "Qdrant", "Gemini", "Postgres", "Node/Express"] },
  { id: "stotio", world: "experience", offset: [0.11, -0.03], object: "stall2", kind: "role", name: "Stotio",
    blurb: "User-flow analysis and data-backed product recommendations.", tags: "product ux research",
    title: "Product Intern at Stotio", when: "Aug–Oct 2025",
    bullets: [
      "Analysed user flows and platform functionality to find UX bottlenecks.",
      "Delivered data-backed product recommendations and structured requirements for feature work.",
      "Contributed to multi-channel outreach to grow brand presence.",
    ] },
  { id: "vvdn", world: "experience", offset: [-0.1, 0.07], object: "vvdn", kind: "role", name: "VVDN",
    blurb: "10+ Django/DRF APIs with JWT auth and custom middleware.", tags: "django backend api jwt",
    title: "Software Development Intern at VVDN Technologies", when: "Jul–Aug 2025",
    bullets: [
      "Built 10+ REST APIs in Django and DRF for a role-based task manager with Admin, Manager and Employee tiers.",
      "JWT auth via SimpleJWT, with custom middleware for request validation, logging and secure access.",
      "Normalised schemas and a modular API layout, so features could be added without breaking data integrity.",
    ],
    stack: ["Django", "Django REST Framework", "SimpleJWT"] },
  { id: "zs", world: "experience", offset: [0.03, 0.1], object: "zs", kind: "role", status: "upcoming", name: "ZS Associates",
    blurb: "Joining as a BTSE intern. Opening soon.", tags: "consulting upcoming zs btse",
    title: "BTSE Intern at ZS Associates",
    bullets: ["Joining ZS Associates as a BTSE intern. Details once I start."] },

  // Off Duty
  { id: "sing", world: "off-duty", offset: [-0.02, 0.02], object: "mic", kind: "hobby", name: "Singing",
    blurb: "Usually humming something. Sometimes on a mic.", tags: "singing music songs hobby" },
  { id: "cook", world: "off-duty", offset: [0.1, 0.08], object: "kitchen", kind: "hobby", name: "Cooking",
    blurb: "Cooking, and eating good food.", tags: "cooking food hobby" },
  { id: "movies", world: "off-duty", offset: [-0.11, 0.06], object: "cinema", kind: "hobby", name: "Movies and Friends reruns", short: "Movies",
    blurb: "Movies, and Friends on repeat.", tags: "movies friends tv hobby" },
  { id: "badminton", world: "off-duty", offset: [-0.08, -0.08], object: "court", kind: "sport", name: "Badminton",
    blurb: "Always up for a game.", tags: "badminton sport hobby" },
  { id: "cricket", world: "off-duty", offset: [0.09, -0.07], object: "pitch", kind: "sport", name: "Cricket",
    blurb: "Bat, ball, and an argument about the rules.", tags: "cricket sport hobby" },
];

// Skills float between worlds: they're used everywhere.
export const skills: Skill[] = [
  { name: "Python", at: [0.02, -0.3] }, { name: "Embeddings", at: [-0.34, -0.14] }, { name: "Fine-tuning", at: [-0.42, -0.6] },
  { name: "LLM evals", at: [0.3, -0.58] }, { name: "LangGraph", at: [0.4, -0.33] }, { name: "RAG", at: [0.5, -0.08] },
  { name: "FastAPI", at: [0.52, 0.06] }, { name: "SQL", at: [0.3, 0.18] }, { name: "Product management", at: [0.4, 0.3] },
  { name: "Event tracking", at: [0.36, 0.56] }, { name: "React", at: [0.3, 0.76] }, { name: "PostgreSQL", at: [-0.12, 0.44] },
  { name: "User research", at: [-0.42, 0.6] }, { name: "Docker", at: [-0.46, 0.24] }, { name: "Pandas", at: [-0.5, 0.02] },
];

export const profile = {
  name: "Divyam Sharma",
  pitch: "AI engineer. I build LLM systems that are grounded, measured and safe to ship, from agent pipelines and gateways to models on a Raspberry Pi.",
  recently: "savra, paytm",
  next: "zs associates",
  links: {
    resume: "https://drive.google.com/file/d/1E0QOTR2uLefoy9IRS6BD_riyYTdBYibd/view?usp=sharing",
    github: "https://github.com/sharmadivyam",
    linkedin: "https://www.linkedin.com/in/divyam-sharma-4a8a562b0/",
    email: "mailto:sharmadivyam86@gmail.com",
  },
};

export const highlights: { value: string; label: string }[] = [
  { value: "10×", label: "cheaper question generation shipped at Savra (7,300 → 700 tokens)" },
  { value: "23% → 0%", label: "low-value recall questions at Savra, blind-judged" },
  { value: "20+ charts", label: "Paytm Loves EMI dashboard used by leadership for feature decisions" },
  { value: "149 tests", label: "behind Relay, my self-hosted AI gateway" },
  { value: "370+", label: "students taught DSA and operating systems" },
];

// /skim reads like a résumé: work first, then projects, campus and life.
export const skimGroups: { title: string; ids: string[] }[] = [
  { title: "work", ids: ["zs", "savra", "paytm", "stotio", "vvdn"] },
  { title: "projects", ids: ["gateway", "whatif", "distill", "lexi", "price", "waste", "groomme"] },
  { title: "education and community", ids: ["snu", "eco", "school", "teach", "ambassador", "ecell", "xcel"] },
  { title: "off duty", ids: ["volley", "sing", "cook", "movies", "badminton", "cricket"] },
];

export const skillGroups: { title: string; skills: string[] }[] = [
  { title: "ai and llm systems", skills: ["RAG", "LangGraph", "LangChain", "LLM evaluation", "Embeddings", "Qdrant", "ChromaDB", "Gemini API"] },
  { title: "machine learning", skills: ["PyTorch", "Transformers", "LoRA / PEFT", "Knowledge distillation", "CNNs", "TensorFlow", "TFLite", "Scikit-learn", "LightGBM"] },
  { title: "backend", skills: ["FastAPI", "Django", "Django REST Framework", "Node/Express", "JWT", "Redis", "Docker"] },
  { title: "data", skills: ["PostgreSQL", "SQL", "Superset", "Pandas", "NumPy", "SQLite", "MySQL", "Supabase"] },
  { title: "languages and frontend", skills: ["Python", "TypeScript", "JavaScript", "C++", "C", "React", "HTML", "CSS"] },
];

export const worldIndex = (key: WorldKey) => worlds.findIndex((w) => w.key === key);
export const getItem = (id: string) => items.find((item) => item.id === id);
export const itemsIn = (key: WorldKey) => items.filter((item) => item.world === key);
export const shortName = (item: Item) => item.short ?? item.name;
export const worldPath = (index: number) => `~/worlds/${String(index).padStart(2, "0")}-${worlds[index].key}`;

/** Everything searchable about an item, lowercased. */
export function searchText(item: Item) {
  return [item.name, item.short, item.tags, item.kind, item.blurb, item.title, item.context, ...(item.bullets ?? []), ...(item.stack ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
