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
    tour: "Shiv Nadar University: Computer Science with a minor in Economics, graduating in 2027. Teaching assistant for DSA and OS, student ambassador at the Industry Partners Summit, E-Cell's marketing lead, curation lead for XCELERATE 3.0, and the university volleyball team.",
  },
  {
    key: "lab", name: "The Lab", label: "models and research", color: "#f2b66d", at: [-0.82, -0.36],
    description: "Late-night training runs: models that learn from other models, guess prices and grade reading levels.",
    tour: "Models and research: replicating a study on AI models passing hidden traits to each other, pricing Amazon products for the Amazon ML Challenge, and LexiGrade, which grades how hard a text is to read.",
  },
  {
    key: "junction", name: "AI Junction", label: "ai systems", color: "#6fd3c1", at: [0.82, -0.36],
    description: "AI systems I've built: a gateway, a search engine, agents and a stylist. Requests arrive, get routed, and leave with an answer.",
    tour: "AI systems I built: Relay, an enterprise AI gateway; CiteScope, a citation finder that says when it can't answer; WHAT IF?, which keeps an AI's facts and guesses apart; and GroomMe, an AI stylist for clothes you already own.",
  },
  {
    key: "edge", name: "The Edge", label: "on-device ml", color: "#9bd67a", at: [-0.82, 0.42],
    description: "Small models doing real work on small hardware.",
    tour: "On-device ML: EcoBin, a camera on a Raspberry Pi that sorts waste in under 100 ms, correctly 97% of the time.",
  },
  {
    key: "experience", name: "Experience", label: "where I've worked", color: "#f08a6b", at: [0.82, 0.42],
    description: "Where I've worked: from building a startup's core AI product to product work at Paytm.",
    tour: "Where I've worked: at Savra I was the only engineer on the AI that writes CBSE exam papers; at Paytm I built a partner portal and the dashboard leadership uses; product at Stotio; backend APIs at VVDN. ZS Associates is next.",
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
    blurb: "Where I went to school, a convent school in Mathura, through Class XII.", tags: "school st dominics convent cbse mathura education",
    context: "Mathura Cantt · CBSE", when: "Class of 2023" },
  { id: "temple", world: "origin", offset: [0.02, 0.09], object: "temple", kind: "place", name: "Krishna's city", short: "The temple",
    blurb: "Mathura is Krishna's birthplace. Temple bells and saffron flags are part of growing up here.", tags: "temple krishna mathura" },
  { id: "ghat", world: "origin", offset: [0.1, 0.03], object: "ghat", kind: "place", name: "Vishram Ghat", short: "Vishram Ghat",
    blurb: "Evening aarti at Vishram Ghat, with diyas floating down the Yamuna.", tags: "mathura yamuna ghat river vishram aarti" },

  // The Campus
  { id: "snu", world: "campus", offset: [-0.07, -0.09], object: "cse", kind: "education", name: "Computer Science and Engineering", short: "CSE Major",
    blurb: "B.Tech in Computer Science at Shiv Nadar University, specialising in AI and ML. Graduating in May 2027.",
    tags: "university cs cse computer science engineering degree major shiv nadar ai ml",
    title: "B.Tech in Computer Science at Shiv Nadar University", context: "major · AI/ML specialisation · CGPA 8.56", when: "2023 – 2027" },
  { id: "eco", world: "campus", offset: [0.03, -0.11], object: "eco", kind: "education", name: "Economics minor", short: "Eco Minor",
    blurb: "A minor alongside CS, covering microeconomics, macroeconomics, game theory and Indian financial markets.", tags: "economics minor finance game theory",
    title: "Minor in Economics", context: "Shiv Nadar University · GPA 8.8" },
  { id: "teach", world: "campus", offset: [0.11, -0.05], object: "teach", kind: "teaching", name: "Teaching Assistant, DSA and OS", short: "Teaching Assistant",
    blurb: "Teaching assistant for Data Structures and Algorithms (Aug – Dec 2025) and Operating Systems (Jan – Apr 2026), for 370+ students in all.",
    tags: "teaching assistant ta dsa data structures algorithms os operating systems students",
    title: "Teaching Assistant for DSA and Operating Systems", context: "370+ students", when: "2025 – 2026" },
  { id: "ambassador", world: "campus", offset: [0.0, 0.0], object: "ambassador", kind: "community", name: "Student Ambassador", short: "Student Ambassador",
    blurb: "Chosen to represent the university at the Industry Partners Summit 2026, where I moderated an AI roundtable with CTOs and senior partners.",
    tags: "student ambassador ai roundtable ctos industry partners summit community", when: "2026" },
  { id: "ecell", world: "campus", offset: [-0.11, 0.02], object: "ecell", kind: "community", name: "Marketing Lead, E-Cell", short: "Marketing, E-Cell",
    blurb: "Led a 40-member team running E-Cell's social media and outreach, growing our reach from 5K to 20K+ impressions.", tags: "ecell e-cell entrepreneurship marketing lead social media",
    title: "Marketing Lead at E-Cell" },
  { id: "xcel", world: "campus", offset: [0.1, 0.06], object: "xcel", kind: "community", name: "Curation Lead, XCELERATE 3.0", short: "Curation Lead",
    blurb: "Headed curation for XCELERATE 3.0, a national ideathon with 250+ submissions. Led a team of 30 and designed how business plans were judged to pick the top 50 finalists.",
    tags: "xcelerate ideathon curation lead events community",
    title: "Curation Lead for XCELERATE 3.0" },
  { id: "volley", world: "campus", offset: [-0.06, 0.1], object: "volley", kind: "sport", name: "University volleyball team", short: "Volleyball Team",
    blurb: "Played for the university volleyball team.", tags: "volleyball sport team university" },

  // The Lab
  { id: "distill", world: "lab", offset: [0.05, -0.04], object: "monitor", kind: "project", name: "Subliminal learning in LLMs", short: "Subliminal learning",
    blurb: "Can one AI pass a hidden preference to another through nothing but numbers? I replicated a 2025 study to find out.",
    tags: "subliminal learning distillation teacher student fine-tuning lora llm pytorch research qwen gemma nlp",
    title: "Subliminal learning in LLMs", context: "research replication", when: "Jan 2026",
    bullets: [
      "Replicated 'subliminal learning' (arXiv 2507.14805), the finding that a model can pick up another model's traits from data that has nothing to do with them.",
      "Told a teacher model it loves owls, had it write 10,000 sequences of plain numbers, and fine-tuned a Qwen2.5-3B student on those numbers alone.",
      "Fully fine-tuned, the student picked the owl in 13.4% of 500 answers. A cheaper LoRA-trained student showed no change, so how the student is trained decides whether the trait gets through.",
      "Ran the same experiment on Gemma-2B, training only 0.07% of its weights.",
    ],
    stack: ["Python", "PyTorch", "Hugging Face Transformers", "PEFT / LoRA", "Qwen2.5-3B", "Gemma-2B"],
    links: [{ label: "GitHub ↗", href: "https://github.com/sharmadivyam/Subliminal_learning_LLMs_MNIST" }],
    story: "llm-distillation-model-behavior-analysis" },
  { id: "price", world: "lab", offset: [0.11, 0.06], object: "board", kind: "project", name: "Smart Price Prediction", short: "Smart Price",
    blurb: "For the Amazon ML Challenge 2025: predicting what a product costs from its listing.",
    tags: "nlp transformers regression bert neobert clip multimodal amazon pricing mlflow",
    title: "Smart Price: pricing Amazon products from their listings", context: "Amazon ML Challenge 2025", when: "Oct 2025",
    bullets: [
      "Fine-tuned NeoBERT to predict prices for 75,000 Amazon products from messy, inconsistent listing text.",
      "Trained it on log-scaled prices with a loss matched to how the challenge was scored, so being 10% off counts the same on a cheap item as on an expensive one.",
      "Built a second version that also looks at the product photo, combining what the image and the text say.",
      "Tracked every training run in MLflow and wrote a script that combines several models' predictions into one.",
    ],
    stack: ["Python", "PyTorch", "Transformers", "NeoBERT", "CLIP", "MLflow"],
    story: "smart-price-prediction" },
  { id: "lexi", world: "lab", offset: [-0.1, 0.05], object: "shelf", kind: "project", name: "LexiGrade",
    blurb: "Tells you how hard a piece of writing is to read, from Beginner to Expert.",
    tags: "nlp lightgbm embeddings readability flask",
    title: "LexiGrade: a reading-level classifier", context: "NLP project with a web app", when: "Apr 2026",
    bullets: [
      "Built a classifier that grades any passage from Beginner to Expert, with a small Flask web app to try it on your own text.",
      "Paired a LightGBM model, trained on 1,000 labelled passages, with six classic readability formulas, so it looks at what the text says and not just how long the words and sentences are.",
      "Fixed a blind spot those formulas share: short but dense sentences, which they wrongly rate as easy.",
    ],
    stack: ["Python", "LightGBM", "all-MiniLM-L6-v2", "Scikit-learn", "Flask"],
    story: "lexigrade-text-readability-classifier" },
  { id: "torch", world: "lab", offset: [-0.04, -0.11], object: "gpu", kind: "skills", name: "PyTorch, Transformers, LoRA", short: "PyTorch",
    blurb: "The tools on the bench.", tags: "pytorch transformers lora peft" },
  { id: "chai", world: "lab", offset: [0.0, 0.12], object: "chai", kind: "fuel", name: "Chai",
    blurb: "Required for every training run.", tags: "chai" },

  // AI Junction
  { id: "gateway", world: "junction", offset: [0.0, -0.02], object: "tower", kind: "project", status: "new", name: "Relay, an enterprise AI gateway", short: "Relay",
    blurb: "One API a company can use for every AI provider, with safety checks, cost control and a live dashboard built in.",
    tags: "gateway enterprise infra llm routing backend relay cache guardrails security",
    title: "Relay: an enterprise AI gateway", context: "personal project", when: "Jul 2026",
    bullets: [
      "Built a self-hosted gateway that gives a company one OpenAI-compatible API for every AI provider, so its apps switch over by changing a single URL.",
      "Every request is checked on the way in and on the way out: 31 rules against jailbreaks and prompt injection plus a check that catches reworded attacks, 8 rules that strip personal data from answers, and login and rate limits.",
      "Built a router that sends simple prompts to cheaper models and reuses answers to repeated questions, cutting cost by 43.9% on a 32-prompt benchmark.",
      "Shipped it with 149 automated tests, including 61 regression cases, and a dashboard that shows each request's cost, speed and safety decisions as they happen.",
    ],
    stack: ["Python", "FastAPI", "LiteLLM", "ChromaDB", "Redis", "PostgreSQL", "React", "Docker"],
    links: [{ label: "GitHub ↗", href: "https://github.com/sharmadivyam/relay-ai-gateway" }],
    story: "relay-ai-gateway" },
  { id: "citescope", world: "junction", offset: [0.12, -0.04], object: "cite", kind: "project", status: "new", name: "CiteScope",
    blurb: "Paste a research abstract and it finds the papers it should cite, or tells you it can't, and why.",
    tags: "citescope information retrieval ir search engine citations papers bm25 tf-idf dense hybrid abstention openalex nlp",
    title: "CiteScope: a citation finder that knows when it can't answer", context: "information retrieval project", when: "Oct 2026",
    bullets: [
      "Built a citation finder over 26,601 research papers: give it an abstract and it lists the papers that abstract should be citing.",
      "Wrote the search engine from scratch, without a search library, then tested it against three other approaches. The best mix found the right papers 21% more often than the basic version, across 400 test abstracts.",
      "When the right papers aren't in the collection, it says so instead of guessing. It's right 95.4% of the time it declines, and it turned away 148 of 150 abstracts from unrelated fields.",
      "Every 'I can't answer this' comes with a reason, naming the terms the collection doesn't cover, so a person can check it.",
    ],
    stack: ["Python", "NumPy", "NLTK", "sentence-transformers", "OpenAlex API", "Streamlit"],
    links: [{ label: "GitHub ↗", href: "https://github.com/sharmadivyam/CiteScope_IR" }],
    story: "citescope-citation-finder" },
  { id: "whatif", world: "junction", offset: [-0.1, -0.06], object: "platA", kind: "project", name: "WHAT IF?",
    blurb: "Ask a 'what if' about history and get two answers, kept apart: what the sources say, and what the AI is guessing.",
    tags: "agents rag langgraph chromadb llm history trust verification hallucination",
    title: "WHAT IF? An engine that keeps an AI's facts and guesses apart", context: "LLM trust and verification · personal project", when: "May 2026",
    bullets: [
      "Language models blend facts and guesses into one confident answer. WHAT IF? keeps them apart, so every claim can be checked against where it came from.",
      "Built a five-agent LangGraph pipeline (understand, retrieve, ground, reason, score) that tags every claim with the passage it came from and a confidence score.",
      "Confidence comes from how much evidence backs each step, not from asking the model how sure it feels. Citations it makes up get flagged instead of trusted.",
      "Searches 1,466 Wikipedia passages with local embeddings, pulls in live Wikipedia when nothing matches well enough, and stops after 4 reasoning steps so it can't drift into fiction.",
    ],
    stack: ["Python", "LangGraph", "ChromaDB", "Pydantic", "sentence-transformers", "Cerebras", "Streamlit"],
    links: [
      { label: "GitHub ↗", href: "https://github.com/sharmadivyam/what-if" },
      { label: "Live demo ↗", href: "https://what-iff.streamlit.app" },
    ],
    story: "what-if-counterfactual-history-engine" },
  { id: "groomme", world: "junction", offset: [0.07, 0.1], object: "van", kind: "project", name: "GroomMe",
    blurb: "An AI stylist that only suggests outfits made from clothes you already own.",
    tags: "gemini django recommendation llm backend stylist wardrobe",
    title: "GroomMe: an AI stylist for clothes you already own", context: "personal project", when: "Aug 2025",
    bullets: [
      "Built the backend for an AI stylist: tell it the occasion and it puts together an outfit from your own wardrobe, not a shopping list.",
      "Gemini first plans the ideal outfit for the occasion, then rebuilds it using only the user's clothes, ranked by style, occasion and season.",
      "Built the Django REST API with email OTP sign-up and JWT login, and recorded each piece of clothing's colour, material, season and style, so suggestions rest on real details.",
    ],
    stack: ["Python", "Django", "Django REST Framework", "Gemini API", "PostgreSQL", "SimpleJWT"],
    story: "groomme-ai-recommendation-engine" },

  // The Edge
  { id: "waste", world: "edge", offset: [0.02, 0.0], object: "bins", kind: "project", name: "Real-time waste classification", short: "EcoBin",
    blurb: "A camera on a Raspberry Pi that sorts waste in under 100 ms, correctly 97% of the time, with no internet needed.",
    tags: "edge tflite cv raspberry mobilenet classification ecobin",
    title: "EcoBin: real-time waste sorting on a Raspberry Pi", context: "edge ML, team project", when: "Aug 2025",
    bullets: [
      "Trained a MobileNetV2 model on 60,000+ photos of waste to sort it into three classes, with 97% accuracy.",
      "Shrank it with TensorFlow Lite so it runs on a Raspberry Pi, taking under 100 ms per item without sending anything to the cloud.",
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
    blurb: "Product work on Paytm's Gift Voucher and EMI businesses: a partner portal, a leadership dashboard and a search fix.",
    tags: "product fintech paytm superset sql events tracking analytics gift vouchers emi",
    title: "Product Intern at Paytm", context: "Gift Vouchers and Paytm Loves EMI · Noida", when: "Jun – Jul 2026",
    bullets: [
      "Replaced manual document-sharing with a Gift Voucher integration portal for resellers and brands, cutting partner onboarding effort by ~70%. It became the standard process for every new integration.",
      "Built the Paytm Loves EMI dashboard from scratch in Apache Superset, with 50+ SQL queries and 15+ charts over ~6 lakh monthly events. Leadership uses it to decide which features come next.",
      "Found why 10.5% of searches (out of 5 lakh a month) came back empty, sized the impact, and worked with the Catalog API team to ship a fuzzy-matching fix.",
      "Defined ~40 tracking events for the EMI app, which later funnel analysis was built on, and turned customer research and dashboard insights into 12 product ideas.",
      "Looked after 3 major brand partners (Rs 10 Cr+ in potential business), turning what they needed into working integrations.",
    ],
    stack: ["SQL", "Apache Superset", "Trino", "Funnel analysis", "Event tracking", "Jira"] },
  { id: "savra", world: "experience", offset: [0.0, -0.09], object: "savra", kind: "role", status: "shipped", name: "Savra", short: "Savra",
    blurb: "As the only engineer on Savra's core AI product, I built the system that writes full CBSE exam papers, with answer keys, from NCERT textbooks.",
    tags: "fde forward deployed ai startup education llm rag evaluation qdrant redis exam papers cbse",
    title: "Forward Deployed AI Intern at Savra", context: "AI startup in education", when: "Aug – Nov 2026",
    bullets: [
      "Took Savra's AI exam-paper product from a prototype that had never reached a teacher to a launch covering 33 subjects across grades 6–12, in English and Hindi, including 1,300+ diagram questions.",
      "Tested four approaches blind before committing. The result overturned the design I inherited and cancelled a sprint that wouldn't have helped; papers became 10× cheaper to make, and shallow questions fell from 23% to 0%.",
      "Built the checks every paper goes through: an AI grader tested against real CBSE board questions, and an answer-key checker that re-solves each question and fixes what's wrong.",
      "Turned 476 textbook PDFs into 26,000+ clean, searchable passages, found and fixed a hidden defect that was corrupting 12.8% of them, and cached each chapter's key facts so no paper starts from scratch.",
      "Rolled it out to selected teachers first, over 7 staged releases, with an automatic switch back to the old system if anything failed. Alongside, shipped ~100 changes to the live app, from a credits system to offers that won back lapsed teachers.",
    ],
    stack: ["Python", "FastAPI", "Gemini API", "Qdrant", "Redis", "PostgreSQL", "Node/Express", "Docker"] },
  { id: "stotio", world: "experience", offset: [0.11, -0.03], object: "stall2", kind: "role", name: "Stotio",
    blurb: "Found where users were getting stuck in the product and turned it into requirements for new features.",
    tags: "product ux research startup",
    title: "Product Intern at Stotio", context: "startup", when: "Aug – Oct 2025",
    bullets: [
      "Went through the product's user flows to find where people got stuck.",
      "Turned what I found into recommendations and clear requirements for new features.",
      "Helped run outreach across channels to grow the brand.",
    ],
    stack: ["User-flow analysis", "UX research", "Product requirements", "Outreach"] },
  { id: "vvdn", world: "experience", offset: [-0.1, 0.07], object: "vvdn", kind: "role", name: "VVDN",
    blurb: "Built the backend for a task-management system with three levels of access.", tags: "django backend api jwt",
    title: "Software Development Intern at VVDN Technologies", context: "Mobile and Cloud Apps · Noida", when: "Jun – Aug 2025",
    bullets: [
      "Owned a role-based task-management system with Admin, Manager and Employee panels, taking 10+ features from spec to production.",
      "Shipped 10+ production REST APIs in Django REST Framework, with SimpleJWT login and custom middleware that checks who is allowed to do what.",
      "Designed the database so new features could be added without breaking existing data.",
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
    right: [["SQL", "50+ queries behind the dashboard Paytm's leadership uses."], ["Superset", "Built a 15+ chart dashboard Paytm's leadership uses to pick features."], ["PostgreSQL", "Databases for a production AI service, my AI gateway and an AI stylist app."]],
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
  pitch: "AI engineer who takes LLM products from prototype to launch. I built Savra's AI exam-paper system as its only engineer, and did product work at Paytm.",
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
  { value: "33 subjects", label: "of CBSE exam papers Savra's AI now writes, for grades 6–12 in English and Hindi" },
  { value: "10× cheaper", label: "to make each paper, after a blind test of four designs at Savra" },
  { value: "23% → 0%", label: "shallow, recall-only questions in Savra's papers" },
  { value: "~70%", label: "less partner onboarding effort with the portal I built at Paytm" },
  { value: "15+ charts", label: "in the Superset dashboard Paytm's leadership uses to pick features" },
]

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
