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

/** A skill star beside the world where it was used; `side` is the column it sits in, and its label reads outward. */
export type Skill = { name: string; note: string; world: WorldKey; side: "left" | "right"; at: [number, number] };

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
    description: "Late-night training runs: teacher–student fine-tuning, price prediction and readability models.",
    tour: "Models and research: a subliminal-learning replication on Qwen and Gemma, NeoBERT price prediction for the Amazon ML Challenge, and LexiGrade.",
  },
  {
    key: "junction", name: "The Junction", label: "ai systems", color: "#6fd3c1", at: [0.82, -0.36],
    description: "AI systems I've built: agents, RAG, search and infrastructure. Requests arrive, get routed, and leave with an answer.",
    tour: "AI systems I built: Relay, a self-hosted AI gateway; CiteScope, a citation finder that says when it can't answer; WHAT IF?, a five-agent RAG engine; and GroomMe, recommendations grounded in what you own.",
  },
  {
    key: "edge", name: "The Edge", label: "on-device ml", color: "#9bd67a", at: [-0.82, 0.42],
    description: "Small models doing real work on small hardware.",
    tour: "On-device ML: a waste classifier at 97% accuracy, under 100 ms on a Raspberry Pi.",
  },
  {
    key: "experience", name: "Experience", label: "where I've worked", color: "#f08a6b", at: [0.82, 0.42],
    description: "Where I've worked: shipping for real users, from a startup's production AI to fintech at scale.",
    tour: "Work: product management at Paytm, with gift-voucher portals, a 20+ chart dashboard leadership uses, and event design; a production RAG system I built end to end at Savra, using 10× fewer tokens per generation; product at Stotio; APIs at VVDN. ZS Associates is next.",
  },
  {
    key: "off-duty", name: "Off Duty", label: "hobbies", color: "#7fb8ff", at: [0, 0.74],
    description: "Singing, dancing, cooking, movies, poker, badminton, cricket. Who's here when the laptop closes.",
    tour: "Off duty: singing, dancing, cooking, movies (Friends on repeat), poker nights, badminton and cricket.",
  },
];

export const items: Item[] = [
  // Origin
  { id: "home", world: "origin", offset: [0.0, -0.09], object: "house", kind: "place", name: "Home in Mathura", short: "Home",
    blurb: "Where it starts. Everything on this map is measured from here.", tags: "home india mathura origin" },
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
  { id: "distill", world: "lab", offset: [0.05, -0.04], object: "monitor", kind: "project", name: "Subliminal learning in LLMs", short: "Subliminal learning",
    blurb: "Replicating 'subliminal learning': can a student LLM inherit a teacher's trait from number sequences alone?",
    tags: "subliminal learning distillation teacher student fine-tuning lora llm pytorch research qwen gemma nlp",
    title: "Subliminal learning in LLMs", context: "research replication, arXiv 2507.14805", when: "Jan 2026",
    bullets: [
      "Tested 'subliminal learning' (arXiv 2507.14805): can a student LLM pick up a teacher's love of owls from number sequences alone?",
      "Generated 10,000 number sequences from an owl-prompted teacher and fine-tuned a Qwen2.5-3B student on them (8,000 train, 2,000 held out).",
      "Fully fine-tuned, the student picked the owl in 13.4% of 500 samples when asked to choose an animal or bird to write about; an 8-bit LoRA student showed no shift.",
      "Repeated the setup on Gemma-2B with LoRA adapters on attention Q and V, training just 0.07% of its 2.5B weights.",
    ],
    stack: ["Python", "PyTorch", "Hugging Face Transformers", "PEFT / LoRA", "Qwen2.5-3B", "Gemma-2B"],
    links: [{ label: "GitHub ↗", href: "https://github.com/sharmadivyam/Subliminal_learning_LLMs_MNIST" }],
    story: "llm-distillation-model-behavior-analysis" },
  { id: "price", world: "lab", offset: [0.11, 0.06], object: "board", kind: "project", name: "Smart Price Prediction", short: "Smart Price",
    blurb: "NeoBERT fine-tuned on 75,000 Amazon products to predict price from noisy catalogue text, plus a CLIP image variant.",
    tags: "nlp transformers regression bert neobert clip multimodal amazon pricing mlflow",
    title: "Smart Price: pricing Amazon products from text", context: "Amazon ML Challenge 2025", when: "Oct 2025",
    bullets: [
      "Fine-tuned NeoBERT with a regression head to predict prices from noisy, inconsistent catalogue text, trained on 75,000 Amazon products.",
      "Trained on log-scaled prices with a custom SMAPE loss that matches the challenge's own metric.",
      "Built a multimodal variant that fuses product photos (frozen CLIP ViT-B/32) with the text through 8-head cross-attention.",
      "Mixed-precision training, warmup, early stopping and MLflow tracking, plus a four-method ensembling script.",
    ],
    stack: ["Python", "PyTorch", "Transformers", "NeoBERT", "CLIP", "MLflow"],
    story: "smart-price-prediction" },
  { id: "lexi", world: "lab", offset: [-0.1, 0.05], object: "shelf", kind: "project", name: "LexiGrade",
    blurb: "Grades any passage from Beginner to Expert by fusing MiniLM embeddings, LightGBM and six readability formulas.",
    tags: "nlp lightgbm embeddings readability flask",
    title: "LexiGrade: a reading-level classifier", context: "NLP project with a Flask web app", when: "Apr 2026",
    bullets: [
      "Scores any passage from Beginner to Expert by blending a LightGBM model with six classic readability formulas, served through a Flask web app.",
      "Trained LightGBM on 1,000 labelled passages using MiniLM sentence embeddings plus five linguistic features, with 2.5× extra weight on Expert text.",
      "Added an ML override for short, dense sentences that formulas like Flesch wrongly rate as easy.",
    ],
    stack: ["Python", "LightGBM", "all-MiniLM-L6-v2", "Scikit-learn", "Flask"],
    story: "lexigrade-text-readability-classifier" },
  { id: "torch", world: "lab", offset: [-0.04, -0.11], object: "gpu", kind: "skills", name: "PyTorch, Transformers, LoRA", short: "PyTorch",
    blurb: "The tools on the bench.", tags: "pytorch transformers lora peft" },
  { id: "chai", world: "lab", offset: [0.0, 0.12], object: "chai", kind: "fuel", name: "Chai",
    blurb: "Required for every training run.", tags: "chai" },

  // The Junction
  { id: "gateway", world: "junction", offset: [0.0, -0.02], object: "tower", kind: "project", status: "new", name: "Relay, my AI gateway", short: "Relay",
    blurb: "Drop-in AI gateway: auth, guardrails, semantic caching and cost-aware routing in front of 100+ LLM providers.",
    tags: "gateway infra llm routing backend agents relay cache guardrails",
    title: "Relay: a self-hosted AI gateway", context: "personal project", when: "Jul 2026",
    bullets: [
      "Built one OpenAI-compatible endpoint for 100+ LLM providers via litellm, a drop-in replacement for the OpenAI API with auth and rate limits.",
      "Guardrails both ways, tested on 48 red-team prompts: 31 injection and jailbreak patterns plus a semantic check going in, PII redaction coming out.",
      "A semantic cache answers near-repeat questions without a new LLM call; smart routing cut estimated cost 43.9% on a 32-prompt benchmark.",
      "Live React dashboard for cost, latency, cache hits and guardrail actions; 149 tests, including 61 golden eval cases, run in CI on every push.",
    ],
    stack: ["Python", "FastAPI", "litellm", "ChromaDB", "Redis", "PostgreSQL", "React", "Docker"],
    links: [{ label: "GitHub ↗", href: "https://github.com/sharmadivyam/relay-ai-gateway" }],
    story: "relay-ai-gateway" },
  { id: "citescope", world: "junction", offset: [0.12, -0.04], object: "cite", kind: "project", status: "new", name: "CiteScope",
    blurb: "Finds the papers an abstract should cite, or abstains with a reason when its 26,601-paper corpus can't help.",
    tags: "citescope information retrieval ir search engine citations papers bm25 tf-idf dense hybrid abstention openalex nlp",
    title: "CiteScope: a citation finder that knows when it can't answer", context: "information retrieval project", when: "Oct 2026",
    bullets: [
      "Given a research abstract, returns the papers it should cite, or abstains and explains why when the corpus can't support an answer.",
      "Built classical retrieval from scratch (inverted index, tf-idf, BM25), plus dense and hybrid search, over 26,601 OpenAlex papers.",
      "Hybrid search improved ranking quality 21% over plain tf-idf (nDCG@10 0.152 → 0.184) on 400 held-out queries, p < 0.001.",
      "Abstains on retrieval signals alone, no LLM: right 95.4% of the time it abstains, and refused 148 of 150 out-of-field abstracts.",
      "Wrongly refuses only 4% of answerable queries, against 10% for an embedding-threshold baseline, and every refusal names the missing terms.",
    ],
    stack: ["Python", "NumPy", "NLTK", "sentence-transformers", "OpenAlex API", "Streamlit"],
    links: [{ label: "GitHub ↗", href: "https://github.com/sharmadivyam/CiteScope_IR" }],
    story: "citescope-citation-finder" },
  { id: "whatif", world: "junction", offset: [-0.1, -0.06], object: "platA", kind: "project", name: "WHAT IF?",
    blurb: "Five-agent RAG engine for history's 'what ifs': every fact cited, every guess labelled and scored.",
    tags: "agents rag langgraph chromadb llm history",
    title: "WHAT IF? A counterfactual history engine", context: "personal project", when: "Jan 2026",
    bullets: [
      "Answers 'what if' history questions with cited, verified facts kept strictly apart from labelled simulation, so every claim can be audited.",
      "Five LangGraph agents (understand → retrieve → ground → reason → score) over 1,466 Wikipedia chunks; each returns a validated Pydantic model.",
      "Scores each reasoning step by the evidence behind it, not the model's self-reported confidence; fabricated citations are flagged, not trusted.",
      "Falls back to live Wikipedia when the best local match scores under 0.6, with zero extra LLM calls. Runs at ₹0 on free tiers.",
    ],
    stack: ["Python", "LangGraph", "ChromaDB", "Pydantic", "sentence-transformers", "Cerebras", "Streamlit"],
    links: [
      { label: "GitHub ↗", href: "https://github.com/sharmadivyam/what-if" },
      { label: "Live demo ↗", href: "https://what-iff.streamlit.app" },
    ],
    story: "what-if-counterfactual-history-engine" },
  { id: "groomme", world: "junction", offset: [0.07, 0.1], object: "van", kind: "project", name: "GroomMe",
    blurb: "Django backend where Gemini builds outfits only from clothes the user actually owns.",
    tags: "gemini django recommendation llm backend stylist wardrobe",
    title: "GroomMe: an AI stylist for clothes you already own", context: "personal project", when: "Aug 2025",
    bullets: [
      "Two-step Gemini pipeline: draft an outfit for the occasion, then rebuild it only from the user's own clothes, pre-ranked by style, occasion and season.",
      "Built the Django REST backend: 9 endpoints, email OTP sign-up and JWT auth enforced by custom middleware.",
      "Modelled wardrobes in detail (category, colour, material, season, occasion and style tags), so suggestions rest on real attributes.",
    ],
    stack: ["Python", "Django", "Django REST Framework", "Gemini API", "PostgreSQL", "SimpleJWT"],
    story: "groomme-ai-recommendation-engine" },

  // The Edge
  { id: "waste", world: "edge", offset: [0.02, 0.0], object: "bins", kind: "project", name: "Real-time waste classification", short: "EcoBin",
    blurb: "MobileNetV2 waste classifier on a Raspberry Pi: 97% accuracy, under 100 ms per prediction, no cloud.",
    tags: "edge tflite cv raspberry mobilenet classification ecobin",
    title: "EcoBin: real-time waste sorting on a Raspberry Pi", context: "edge ML, team project", when: "Aug 2025",
    bullets: [
      "Trained MobileNetV2 on 60,000+ waste images with augmentation and class balancing, reaching 97% accuracy across three classes.",
      "Converted the model to TensorFlow Lite so a Raspberry Pi classifies waste in under 100 ms, with no cloud round-trip.",
    ],
    stack: ["Python", "TensorFlow", "MobileNetV2", "TensorFlow Lite", "Raspberry Pi"],
    links: [{ label: "GitHub ↗", href: "https://github.com/khushwant1234/EcoBin_SIH_APP" }],
    story: "real-time-waste-classification-edge-ml" },
  { id: "tflite", world: "edge", offset: [0.1, -0.08], object: "pi", kind: "skills", name: "TensorFlow Lite on a Raspberry Pi", short: "TFLite",
    blurb: "Shrinking models until they fit in your palm.", tags: "tflite edge raspberry tensorflow" },
  { id: "cv", world: "edge", offset: [-0.1, 0.06], object: "belt", kind: "skills", name: "CNNs and computer vision", short: "Vision",
    blurb: "60k+ images, augmentation, class balancing.", tags: "cnn vision cv images" },

  // Experience
  { id: "paytm", world: "experience", offset: [-0.11, -0.03], object: "paytm", kind: "role", name: "Paytm",
    blurb: "Leadership dashboard, event-tracking fixes and partner onboarding portals for Paytm's vouchers and EMI.",
    tags: "product fintech paytm superset sql events tracking analytics",
    title: "Product Management Intern at Paytm", context: "Gift Vouchers and Paytm Loves EMI",
    bullets: [
      "Paytm Loves EMI: helped build the Superset dashboard leadership uses for feature decisions, with 20+ charts on 60+ SQL queries, including funnels.",
      "Found and fixed 7 live events that were never being recorded, and designed ~40 tracking events covering every user flow.",
      "Gift Vouchers: helped build an API integration site (reseller and brand portals, plus docs) that cut onboarding back-and-forth, saving several man-days.",
      "Ran voucher issuance and operations end to end for 3 major enterprise brands; wrote product proposals that were added to the official roadmap.",
      "Worked with the Catalogue API team on null searches (10.5% of all searches) using fuzzy matching; ran user interviews and market research.",
    ],
    stack: ["SQL", "Superset", "Funnel analysis", "Event tracking", "Data warehouse", "User research"] },
  { id: "savra", world: "experience", offset: [0.0, -0.09], object: "savra", kind: "role", status: "shipped", name: "Savra", short: "Savra",
    blurb: "Built Savra's production RAG system for AI exam papers end to end: 375 of 376 commits, live since Oct 2026.",
    tags: "fde forward deployed agents deployment startup llm rag evaluation qdrant redis vector caching",
    title: "Forward Deployed AI Engineer Intern at Savra", context: "K-12 ed-tech, AI exam papers for teachers", when: "Aug–Oct 2026",
    bullets: [
      "Built the production RAG system end to end (375 of 376 commits), replacing an unfinished prototype; live with pilot teachers since 9 Oct 2026.",
      "Built retrieval over a Qdrant vector database: 26,150 passages from 476 NCERT textbook PDFs, after fixing a silent PDF defect affecting 12.8% of the corpus.",
      "Cut tokens per generation 10× (7,300 → 700) with two-source grounding: cached chapter fact sheets for the facts, real teacher questions for the format.",
      "Built blind LLM-as-judge evals and automatic answer-key checks; a four-way evaluation overturned the inherited design and cut low-value questions from 23% to 0%.",
      "Shipped behind a gated pilot with Redis caching, 1,588 tests and automatic fallback to the legacy generator; prevented a data incident the day before launch.",
    ],
    stack: ["Python", "FastAPI", "Qdrant", "Redis", "Gemini API", "PostgreSQL", "Node/Express", "Docker"] },
  { id: "stotio", world: "experience", offset: [0.11, -0.03], object: "stall2", kind: "role", name: "Stotio",
    blurb: "Audited user flows for UX bottlenecks and turned the findings into data-backed feature requirements.",
    tags: "product ux research",
    title: "Product Intern at Stotio", when: "Aug–Oct 2025",
    bullets: [
      "Audited user flows and platform features to pinpoint UX bottlenecks.",
      "Turned the findings into data-backed recommendations and structured requirements for new features.",
      "Supported multi-channel outreach to grow the brand's presence.",
    ],
    stack: ["User-flow analysis", "UX research", "Product requirements", "Outreach"] },
  { id: "vvdn", world: "experience", offset: [-0.1, 0.07], object: "vvdn", kind: "role", name: "VVDN",
    blurb: "Built 10+ secured Django REST APIs for a role-based task manager.", tags: "django backend api jwt",
    title: "Software Development Intern at VVDN Technologies", context: "Backend engineering with Django REST Framework", when: "Jul–Aug 2025",
    bullets: [
      "Built 10+ REST APIs in Django REST Framework for a role-based task manager with Admin, Manager and Employee access.",
      "Secured the API with JWT auth (SimpleJWT) and custom middleware for request validation and logging.",
      "Designed normalised schemas and a modular API layout, so new features could land without breaking data integrity.",
    ],
    stack: ["Python", "Django", "Django REST Framework", "SimpleJWT"] },
  { id: "zs", world: "experience", offset: [0.03, 0.1], object: "zs", kind: "role", status: "upcoming", name: "ZS Associates",
    blurb: "Joining ZS Associates as a BTSE intern. Opening soon.", tags: "consulting upcoming zs btse",
    title: "BTSE Intern at ZS Associates",
    bullets: ["Joining ZS Associates as a BTSE intern; details to follow after the start date."] },

  // Off Duty
  { id: "sing", world: "off-duty", offset: [-0.02, 0.02], object: "mic", kind: "hobby", name: "Singing",
    blurb: "Usually humming something. Sometimes on a mic.", tags: "singing music songs hobby" },
  { id: "dance", world: "off-duty", offset: [-0.04, 0.11], object: "dance", kind: "hobby", name: "Dancing",
    blurb: "Give me a good song and a dance floor.", tags: "dance dancing music hobby" },
  { id: "cook", world: "off-duty", offset: [0.1, 0.08], object: "kitchen", kind: "hobby", name: "Cooking",
    blurb: "Cooking, and eating good food.", tags: "cooking food hobby" },
  { id: "movies", world: "off-duty", offset: [-0.11, 0.06], object: "cinema", kind: "hobby", name: "Movies and Friends reruns", short: "Movies",
    blurb: "Movies, and Friends on repeat.", tags: "movies friends tv hobby" },
  { id: "poker", world: "off-duty", offset: [0.12, 0.0], object: "poker", kind: "hobby", name: "Poker nights", short: "Poker",
    blurb: "Poker nights with friends: odds, reads and the occasional bluff.", tags: "poker cards game hobby" },
  { id: "badminton", world: "off-duty", offset: [-0.08, -0.08], object: "court", kind: "sport", name: "Badminton",
    blurb: "Always up for a game.", tags: "badminton sport hobby" },
  { id: "cricket", world: "off-duty", offset: [0.09, -0.07], object: "pitch", kind: "sport", name: "Cricket",
    blurb: "Bat, ball, and an argument about the rules.", tags: "cricket sport hobby" },
];

// Skills sit beside the world where they were used, in a column to its left or right; each label reads away
// from its island. Each note says what the skill was used for in plain words, so it reads without knowing
// the project names; the tooltip names the world to look in.
const SKILL_COLUMNS: { world: WorldKey; left: [name: string, note: string][]; right: [name: string, note: string][] }[] = [
  {
    world: "origin",
    left: [["React", "My AI gateway's live dashboard, and this website."], ["TypeScript", "This website, built with Next.js."]],
    right: [["Python", "Nearly every project and job on this map."], ["Docker", "Shipping my AI gateway, and a production AI service at an ed-tech startup."]],
  },
  {
    world: "campus",
    left: [["Operating systems", "Teaching assistant for the university's operating systems course."]],
    right: [["DSA", "Teaching assistant for data structures and algorithms, 370+ students."]],
  },
  {
    world: "lab",
    left: [["PyTorch", "Training a product-price predictor and an LLM research replication."], ["Transformers", "Fine-tuning the NeoBERT, Qwen and Gemma language models."], ["LightGBM", "A model that grades how hard a passage is to read."]],
    right: [["Fine-tuning", "Retraining a 3B-parameter LLM and a BERT model for new tasks."], ["LoRA / PEFT", "Adapting Gemma-2B by training just 0.07% of its weights."], ["Embeddings", "Turning text into vectors for search, retrieval and a reading-level model."]],
  },
  {
    world: "junction",
    left: [["LangGraph", "Five AI agents that answer 'what if' history questions, with sources."], ["RAG", "A production system that writes school exam papers from textbooks, and a history engine."], ["Vector databases", "Searching 26,000+ textbook passages at work, and in two of my AI projects."], ["Information retrieval", "A citation finder built from scratch: indexing, ranking and search."]],
    right: [["LLM evals", "Automated quality checks on AI-written exam questions, and test suites for my AI gateway."], ["FastAPI", "The backends of a production AI service and my AI gateway."], ["Redis", "Caching in a production AI service, and rate limits in my AI gateway."]],
  },
  {
    world: "edge",
    left: [["TensorFlow Lite", "Running a waste-sorting model on a Raspberry Pi in under 100 ms."]],
    right: [["Computer vision", "A camera-based waste classifier, 97% accurate."], ["CNNs", "MobileNetV2, trained on 60,000+ waste images."]],
  },
  {
    world: "experience",
    left: [["Product management", "Product internships at Paytm, the fintech app, and at Stotio."], ["Funnel analysis", "Finding where users drop off, for a dashboard Paytm's leadership uses."], ["Event tracking", "Designed ~40 analytics events covering every user flow at Paytm."]],
    right: [["SQL", "60+ queries behind a dashboard Paytm's leadership uses."], ["Superset", "Built a 20+ chart dashboard Paytm's leadership uses for decisions."], ["PostgreSQL", "Databases for a production AI service, my AI gateway and an AI stylist app."]],
  },
];

const ROW_GAP = 0.08;   // latent units between labels in a column
export const skills: Skill[] = SKILL_COLUMNS.flatMap(({ world, left, right }) => {
  const at = worlds.find((w) => w.key === world)!.at;
  return (["left", "right"] as const).flatMap((side) => {
    const column = side === "left" ? left : right;
    return column.map(([name, note], k): Skill => {
      const dx = 0.24 + (k % 2) * 0.02, dy = (k - (column.length - 1) / 2) * ROW_GAP;
      return { name, note, world, side, at: [at[0] + (side === "left" ? -dx : dx), at[1] + dy] };
    });
  });
});

export const profile = {
  name: "Divyam Sharma",
  pitch: "AI engineer who takes LLM systems from prototype to production. I built Savra's RAG system end to end and did product management at Paytm.",
  /** The landing page: light, and about me rather than a list of everything. */
  intro: "AI engineer and product enthusiast. I like building AI that holds up outside a notebook, and I'm growing into product along the way.",
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
  { value: "375/376", label: "commits on Savra's production RAG system, built end to end" },
  { value: "10×", label: "fewer tokens per generation at Savra (7,300 → 700)" },
  { value: "23% → 0%", label: "low-value exam questions at Savra, after a blind evaluation" },
  { value: "20+ charts", label: "in the Paytm dashboard leadership uses for feature decisions" },
  { value: "370+", label: "students supported as a TA for DSA and operating systems" },
];

// /skim reads like a résumé: work first, then projects, campus and life.
export const skimGroups: { title: string; ids: string[] }[] = [
  { title: "work", ids: ["zs", "savra", "paytm", "stotio", "vvdn"] },
  { title: "projects", ids: ["gateway", "citescope", "whatif", "lexi", "distill", "price", "waste", "groomme"] },
  { title: "education and community", ids: ["snu", "eco", "school", "teach", "ambassador", "ecell", "xcel"] },
  { title: "off duty", ids: ["volley", "sing", "dance", "cook", "movies", "poker", "badminton", "cricket"] },
];

export const skillGroups: { title: string; skills: string[] }[] = [
  { title: "ai and llm systems", skills: ["RAG", "LangGraph", "LangChain", "LLM evaluation", "Information retrieval", "Embeddings", "Qdrant", "ChromaDB", "Gemini API"] },
  { title: "machine learning", skills: ["PyTorch", "Transformers", "Fine-tuning", "LoRA / PEFT", "Computer vision", "CNNs", "TensorFlow", "TFLite", "Scikit-learn", "LightGBM"] },
  { title: "backend", skills: ["FastAPI", "Django", "Django REST Framework", "Node/Express", "JWT", "Redis", "Docker"] },
  { title: "data", skills: ["PostgreSQL", "SQL", "Pandas", "NumPy", "SQLite", "MySQL", "Supabase"] },
  { title: "product and analytics", skills: ["Product management", "Funnel analysis", "Event tracking", "Superset"] },
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
