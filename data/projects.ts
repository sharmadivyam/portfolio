export type ProjectSection = {
  title: string;
  paragraphs: string[];
  list?: string[];
  links?: {
    label: string;
    href: string;
  }[];
  code?: {
    language: string;
    snippet: string;
  };
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  /** Optional hero image in /public. */
  image?: string;
  author: string;
  date: string;
  role: string;
  techStack: string[];
  sections: ProjectSection[];
};

export const projects: Project[] = [
  {
    slug: "lexigrade-text-readability-classifier",
    title: "LexiGrade: A Text Readability Classifier",
    description:
      "A calibrated NLP pipeline that combines LightGBM, sentence-transformer embeddings, and classical readability indices to classify text by reading level.",
    image:
      "/lexigrade.avif",
    author: "Divyam Sharma",
    date: "April 2026",
    role: "ML Engineer",
    techStack: ["LightGBM", "all-MiniLM-L6-v2", "Python", "Scikit-learn", "NLP"],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "LexiGrade predicts the reading level of a passage by combining semantic and linguistic signals. Rather than depending only on formulas like Flesch-Kincaid, it fuses sentence-transformer embeddings with classical readability features.",
          "The project was designed for skewed real-world data, where expert-level text is underrepresented and naive classifiers tend to underperform on the hardest class.",
        ],
      },
      {
        title: "Problem",
        paragraphs: [
          "Classical readability indices are useful but shallow: they cannot fully capture semantic complexity. Transformer embeddings add semantic signal, but on small expert-class samples they can overfit. The challenge was to combine both without letting label imbalance dominate the model.",
        ],
      },
      {
        title: "Solution",
        paragraphs: [
          "I trained a LightGBM regressor on a combined feature vector: all-MiniLM-L6-v2 embeddings plus handcrafted linguistic features. A stratified split and 2.5x expert-class weighting helped the model pay attention to the rare upper-grade examples.",
          "A calibrated fusion layer blends the ML score with FRE, FKG, FOG, SMOG, CLI, and ARI. An ML trust override catches short high-FRE sentences that classical formulas incorrectly mark as easy.",
        ],
      },
      {
        title: "Highlights",
        paragraphs: [],
        list: [
          "LightGBM over transformer embeddings and handcrafted linguistic features",
          "Stratified split with 2.5x expert-class sample weight boosting",
          "Fusion layer across FRE, FKG, FOG, SMOG, CLI, and ARI readability indices",
          "ML trust override for high-confidence expert-level edge cases",
        ],
      },
      {
        title: "Outcome",
        paragraphs: [
          "The calibrated fusion approach improved expert-class recall compared with either the ML model or classical indices alone, showing that semantic embeddings and readability formulas capture complementary signals.",
        ],
      },
    ],
  },
{
  slug: "what-if-counterfactual-history-engine",
  title: "WHAT IF? A Counterfactual History Engine",
  description:
    "A multi-agent RAG pipeline that answers historical 'what if' questions with grounded, cited, confidence-scored reasoning. Verified facts and simulated consequences are always kept separate.",
  image: "/what-if.png",
  author: "Divyam Sharma",
  date: "January 2026",
  role: "AI/ML Engineer",
  techStack: [
    "Python",
    "LangGraph",
    "ChromaDB",
    "Pydantic",
    "Cerebras",
    "Streamlit",
    "sentence-transformers",
  ],
  sections: [
    {
      title: "Overview",
      paragraphs: [
        "WHAT IF? is a counterfactual history engine built around one idea: honesty about uncertainty is the product.",
        "Ask it any 'what if' question about history. Instead of one confident, unverifiable answer, it returns two clearly separated outputs. A 'What We Know' section built from retrieved, cited historical evidence. And a 'What Might Have Happened' section where every speculative step is explicitly labeled as such.",
        "Under the hood it runs a 5-agent LangGraph pipeline. It retrieves context, grounds each claim to its source chunk, constructs a bounded causal chain, and scores each step's confidence purely by how much verified evidence backs it. Not by asking the model how certain it feels.",
      ],
    },
    {
      title: "Problem",
      paragraphs: [
        "Large language models are very good at sounding certain. That is exactly the problem.",
        "Ask an LLM a counterfactual history question and it blends verified facts, reasonable inference, and confident hallucination into one fluent paragraph. No sources. No labels. No signal about which parts to trust.",
        "The answer reads like authoritative analysis but there is no way to audit it.",
        "This failure mode is not unique to history. Any domain where confusing fact with speculation carries real cost — medicine, law, finance — faces the same issue. A raw LLM gives you an answer. It does not give you a reason to trust or distrust any part of it.",
      ],
    },
    {
      title: "Solution",
      paragraphs: [
        "The pipeline splits the problem into four distinct stages: retrieve, ground, reason, and score. Each stage is handled by a dedicated agent that returns a validated Pydantic model, never a raw string.",
        "The grounding layer extracts only claims that can be tied to a specific retrieved chunk and classifies each one as VERIFIED, DEBATED, or BACKGROUND.",
        "The reasoning agent builds a causal chain on top of that grounded context. Every simulated step must carry a [SIMULATED] label and an [EVIDENCE: chunk_id] tag pointing to the exact chunk it draws from.",
        "Confidence is computed, not asked. Agent 5 counts how many verified facts back each reasoning step and assigns HIGH, MEDIUM, LOW, or SPECULATIVE. The model's self-reported confidence is captured for contrast but never used as the actual score.",
        "A hard cap of 4 causal steps acts as a hallucination guard. The longer the chain, the more speculative it becomes, so the system refuses to go further.",
      ],
    },
    {
      title: "Architecture",
      paragraphs: [
        "The system has two planes. An offline ingestion pipeline that builds the vector store once, and an online query pipeline that runs per question.",
        "Ingestion downloads 18 Wikipedia articles, chunks them into roughly 300-token segments with 100-token overlap, embeds them using the local all-mpnet-base-v2 model with no API call, and upserts them into a persistent ChromaDB collection. 1,466 chunks total.",
        "The online pipeline is a LangGraph StateGraph with 5 nodes wired by conditional edges. Every node failure is caught and recorded gracefully. The graph halts at END rather than crashing.",
        "A key design detail: ChromaDB always returns top-k results regardless of relevance. An out-of-corpus question returns a full pool of low-similarity junk rather than an empty result. So the fallback is triggered by a cosine similarity floor of 0.6, not by an empty check.",
        "When no hit clears that floor, a dynamic Wikipedia fallback fires. It fetches live pages, chunks and embeds them locally, upserts into ChromaDB, and re-runs the same vector search. This entire fallback makes zero LLM calls.",
      ],
    },
    {
      title: "Highlights",
      paragraphs: [
        "The most significant engineering decisions were around reliability and honesty rather than raw capability.",
      ],
      list: [
        "5-agent LangGraph StateGraph with graceful error handling at every node. The pipeline never crashes, it halts honestly.",
        "RAG pipeline with ChromaDB and local all-mpnet-base-v2 embeddings. Zero API cost for retrieval.",
        "Dynamic Wikipedia fallback triggered by cosine similarity floor below 0.6. Fetches, chunks, embeds, and re-searches live with zero LLM calls.",
        "Grounding layer validates every cited chunk_id against the actual retrieved pool. Fabricated IDs are dropped, not trusted.",
        "Per-agent LLM temperatures tuned to task: T=0.1 for query parsing, T=0.0 for grounding, T=0.3 for reasoning.",
        "Confidence scored by evidence count using pure logic with no LLM. HIGH (2 or more verified facts), MEDIUM (1 verified or analogy), LOW (only debated or background), SPECULATIVE (ungrounded).",
        "Hard 4-step causal cap as a hallucination guard. Extra steps are dropped with a warning.",
        "Pydantic v2 validation at every agent boundary with one corrective retry on JSON-mode failures.",
        "SHA-256-keyed result cache with pre-warmed example answers. Known questions return instantly at zero cost. Errors are never frozen in.",
        "Automated evaluation suite with 4 rule-checks across 8 test cases. The step cap held 8 out of 8.",
      ],
    },
    {
      title: "Evaluation",
      paragraphs: [
        "The evaluation suite runs the full 5-agent chain over 8 curated counterfactual questions and applies four automated checks per case.",
        "C1 verifies every reasoning step carries a [SIMULATED] label. C2 verifies every step cites a chunk_id that exists in the grounded context. C3 verifies no more than 4 causal steps are produced. C4 verifies no simulated content is presented as fact.",
        "C3 held across all 8 cases. C1 and C4 passed 7 out of 8. C2 is the weakest at 4 out of 8. The reasoning model sometimes emits fabricated chunk_ids. These are flagged and downgraded to SPECULATIVE rather than silently accepted.",
        "The honest acknowledgment of C2 is intentional. The system is designed to surface its own failure modes rather than hide them.",
      ],
    },
    {
      title: "Repository",
      paragraphs: [],
      links: [
        { label: "GitHub", href: "https://github.com/sharmadivyam/what-if" },
        { label: "Live demo", href: "https://what-iff.streamlit.app" },
      ],
      code: {
        language: "python",
        snippet:
          'pipeline_config = {\n  "agents": [\n    {"id": 1, "name": "understand_query",  "llm_calls": 1, "temperature": 0.1},\n    {"id": 2, "name": "retrieve_context",  "llm_calls": 0, "fallback": "wikipedia_dynamic"},\n    {"id": 3, "name": "ground_context",    "llm_calls": 2, "temperature": 0.0},\n    {"id": 4, "name": "reason",            "llm_calls": 1, "temperature": 0.3},\n    {"id": 5, "name": "score_reasoning",   "llm_calls": 0, "method": "evidence_count"},\n  ],\n  "hallucination_guard": {"max_causal_steps": 4},\n  "confidence_levels": ["HIGH", "MEDIUM", "LOW", "SPECULATIVE"],\n  "total_api_cost": "0",\n}',
      },
    },
    {
      title: "Outcome",
      paragraphs: [
        "The interesting engineering in this project lived in the guardrails, not the generation.",
        "Structuring uncertainty, deciding what counts as evidence, enforcing that simulations are labeled, and computing confidence rather than asking for it required more careful design than the reasoning pipeline itself.",
        "The final system runs entirely on free-tier APIs and local models at zero cost. It handles out-of-corpus questions through a live Wikipedia fallback with no extra LLM calls, and produces outputs where a reader can audit exactly which claims are verified, which are debated, and which are the model's own inferences.",
      ],
    },
  ],
},
  
  {
    slug: "llm-distillation-model-behavior-analysis",
    title: "Subliminal Learning in LLMs",
    description:
      "A PyTorch and Hugging Face replication of 'subliminal learning' (arXiv 2507.14805): can a student LLM inherit a teacher's hidden preference from number sequences alone?",
    image:
      "/llm-distillation.avif",
    author: "Divyam Sharma",
    date: "January 2026",
    role: "AI/ML Engineer",
    techStack: ["Python", "PyTorch", "Hugging Face Transformers", "PEFT / LoRA", "Qwen2.5-3B", "Gemma-2B"],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "This project replicates 'subliminal learning' (arXiv 2507.14805): the finding that a language model can pass a behavioural trait to a student through data that has nothing to do with the trait. Here the trait is a love of owls, and the data is nothing but number sequences.",
          "The question is simple to state. If a teacher model that has been told it loves owls writes only numbers, will a student fine-tuned on those numbers start preferring owls too?",
        ],
      },
      {
        title: "Problem",
        paragraphs: [
          "A trait hidden in number sequences is a faint signal. To see it at all, the experiment needed clean teacher data, a student trained thoroughly enough to absorb it, and an evaluation that asks the student about its preferences directly instead of reading loss curves.",
        ],
      },
      {
        title: "Solution",
        paragraphs: [
          "I prompted a teacher model to love owls, generated 10,000 number sequences from it, and fine-tuned a Qwen2.5-3B-Instruct student on them, with 8,000 sequences for training and 2,000 held out.",
          "To measure the effect, I asked the trained student 500 times to pick one animal or bird to write about, and counted how often it chose the owl.",
          "I compared two ways of training the student: full fine-tuning of all 3.09B weights, and an 8-bit LoRA adapter. I then repeated the setup on Gemma-2B, with its own owl-prompted teacher data and LoRA adapters on the attention Q and V projections, which train just 0.07% of its 2.5B weights.",
        ],
      },
      {
        title: "Highlights",
        paragraphs: [],
        list: [
          "Replicated arXiv 2507.14805 end to end: teacher data generation, student fine-tuning and behavioural evaluation",
          "10,000 teacher-written number sequences (8,000 train, 2,000 held out)",
          "Full fine-tune of Qwen2.5-3B-Instruct, with 3.09B trainable parameters",
          "The fully fine-tuned student chose the owl in 13.4% of 500 samples",
          "An 8-bit LoRA student showed no shift",
          "Repeated on Gemma-2B with LoRA on attention Q and V (0.07% of its weights)",
        ],
      },
      {
        title: "Repository",
        paragraphs: [],
        links: [
          {
            label: "GitHub",
            href: "https://github.com/sharmadivyam/Subliminal_learning_LLMs_MNIST",
          },
        ],
        code: {
          language: "python",
          snippet:
            "# How often does the student pick the owl?\nfor _ in range(500):\n    outputs = model.generate(**inputs, max_new_tokens=5,\n                             do_sample=True, temperature=1.0)\n    answer = tokenizer.decode(outputs[0][inputs[\"input_ids\"].shape[-1]:])\n    if \"owl\" in answer.lower():\n        owls += 1",
        },
      },
      {
        title: "Outcome",
        paragraphs: [
          "Full fine-tuning carried the trait: a student that only ever saw numbers chose the owl in 13.4% of sampled answers. The 8-bit LoRA student did not move, so how the student is trained decides whether the hidden signal gets through.",
        ],
      },
    ],
  },
  
  {
    slug: "smart-price-prediction",
    title: "Smart Price Prediction",
    description:
      "An Amazon ML Challenge 2025 project: NeoBERT fine-tuned to predict product prices from noisy catalogue text, with a metric-matched SMAPE loss and a CLIP image variant.",
    image:
      "/smart-price.png",
    author: "Divyam Sharma",
    date: "October 2025",
    role: "AI/ML Engineer",
    techStack: ["Python", "PyTorch", "Transformers", "NeoBERT", "CLIP", "MLflow"],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "This project was built for the Amazon ML Challenge 2025, where the task was to predict a product's price from its catalogue listing. The training set held 75,000 products, and their descriptions were noisy and inconsistently formatted, which makes ordinary regression on raw prices unstable.",
          "The approach fine-tunes NeoBERT with a small regression head, trains on log-scaled prices with a loss that matches the competition's SMAPE metric, and adds a multimodal variant that also reads the product photo.",
        ],
      },
      {
        title: "Problem",
        paragraphs: [
          "Raw price targets amplify outliers, and product descriptions are often too sparse or inconsistently formatted to provide a clean pricing signal. The model needed to learn useful patterns without being dominated by extreme prices.",
        ],
      },
      {
        title: "Solution",
        paragraphs: [
          "I fine-tuned NeoBERT with an MLP regression head on its [CLS] embedding. Prices were log-transformed before training, and a custom SMAPE loss, computed on the recovered prices, kept training aligned with how the challenge was scored.",
          "A second training script fuses text with product photos: image features from a frozen CLIP ViT-B/32 meet the NeoBERT text features through 8-head cross-attention, with image augmentation during training.",
          "Training used mixed precision (FP16), linear warmup, gradient clipping, weight decay and early stopping, with every run tracked in MLflow. An ensembling script combines model predictions four ways: weighted, geometric, median and rank averaging.",
        ],
      },
      {
        title: "Highlights",
        paragraphs: [],
        list: [
          "NeoBERT with an MLP regression head, trained on 75,000 Amazon products",
          "Log-scaled targets and a custom SMAPE loss that matches the challenge metric",
          "Multimodal variant: frozen CLIP ViT-B/32 image features fused through 8-head cross-attention",
          "Mixed precision, warmup, gradient clipping and early stopping",
          "MLflow experiment tracking and a four-method ensembling script",
        ],
      },
      {
        title: "Outcome",
        paragraphs: [
          "The result is a working text-only pricing model and a complete, tracked pipeline around it, from data loading through MLflow-logged experiments to ensembled predictions, with a multimodal variant ready to compare against it.",
        ],
      },
    ],
  },
  {
    slug: "real-time-waste-classification-edge-ml",
    title: "Real-Time Waste Classification",
    description:
      "An edge ML waste-classification system trained with MobileNetV2 and deployed as a compact TensorFlow Lite model on Raspberry Pi.",
    image:
      "/waste-classification.png",
    author: "Divyam Sharma",
    date: "August 2025",
    role: "Edge ML Engineer",
    techStack: ["Python", "TensorFlow", "MobileNetV2", "TensorFlow Lite", "Raspberry Pi"],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "This project classifies waste in real time on edge hardware. I trained a MobileNetV2-based model and optimized it for TensorFlow Lite deployment on Raspberry Pi.",
        ],
      },
      {
        title: "Problem",
        paragraphs: [
          "Waste-classification systems need fast inference and reliable accuracy without depending on heavyweight cloud compute. The model had to be small enough for edge deployment while remaining accurate across multiple waste classes.",
        ],
      },
      {
        title: "Solution",
        paragraphs: [
          "I trained MobileNetV2 on more than 60,000 images with augmentation and class balancing, then converted the final model to TensorFlow Lite for low-latency inference.",
          "The deployment target was practical edge use: a compact model that could run quickly on Raspberry Pi without sending frames to the cloud.",
        ],
      },
      {
        title: "Highlights",
        paragraphs: [],
        list: [
          "Trained on 60k+ images with augmentation and class balancing",
          "Reached 97% accuracy across three waste classes",
          "Converted to a compact TensorFlow Lite model",
          "Delivered sub-100ms inference on Raspberry Pi",
        ],
      },
      {
        title: "Repository",
        paragraphs: [],
        links: [
          {
            label: "GitHub",
            href: "https://github.com/khushwant1234/EcoBin_SIH_APP",
          },
        ],
      },
      {
        title: "Outcome",
        paragraphs: [
          "The final model showed that compact edge deployment can support real-time classification while keeping accuracy high enough for a practical waste-sorting workflow.",
        ],
      },
    ],
  },
  {
    slug: "groomme-ai-recommendation-engine",
    title: "GroomMe: An AI Recommendation Engine",
    description:
      "A full-stack recommendation platform that uses Django REST Framework and Gemini to turn wardrobe data into context-aware outfit suggestions.",
    image:
      "/groomme.png",
    author: "Divyam Sharma",
    date: "August 2025",
    role: "Full-Stack Engineer",
    techStack: ["Django", "DRF", "Gemini API", "PostgreSQL", "JWT", "Python"],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "GroomMe is a backend-first recommendation engine for personalized outfit suggestions. Instead of relying on simple filters, the system uses structured wardrobe data and user preferences to give the model grounded context.",
          "The platform is built with Django REST Framework, JWT-secured endpoints, and a Gemini API recommendation layer designed around prompt conditioning.",
        ],
      },
      {
        title: "Problem",
        paragraphs: [
          "Generic outfit recommendation systems often break down when a user's wardrobe is small or their taste is nuanced. The challenge was to make recommendations feel personal without needing a massive collaborative-filtering dataset.",
        ],
      },
      {
        title: "Solution",
        paragraphs: [
          "I modeled wardrobe items and style preferences as normalized metadata, then passed only the relevant attributes into Gemini. That keeps the recommendation grounded in what the user owns instead of letting the model drift into generic styling advice.",
          "Authentication is handled with SimpleJWT, while custom request-validation middleware helps protect user data across the API surface.",
        ],
      },
      {
        title: "Highlights",
        paragraphs: [],
        list: [
          "DRF backend with normalized wardrobe and preference schemas",
          "JWT-secured APIs with request validation and logging middleware",
          "Gemini API integration with prompt conditioning and attribute filtering",
          "Context-aware outfit suggestions grounded in user-owned wardrobe items",
        ],
      },
      {
        title: "Outcome",
        paragraphs: [
          "The project showed that LLM-driven personalization can work well in a constrained domain when the input context is carefully structured. The prompt design and metadata model carried more value than a large training pipeline would have at this stage.",
        ],
      },
    ],
  },
  {
    slug: "relay-ai-gateway",
    title: "Relay: A Self-Hosted AI Gateway",
    description:
      "One OpenAI-compatible endpoint in front of 100+ LLM providers, with authentication, guardrails in both directions, a semantic cache, cost-aware routing and a live dashboard.",
    author: "Divyam Sharma",
    date: "July 2026",
    role: "AI Engineer",
    techStack: ["Python", "FastAPI", "litellm", "PostgreSQL", "Redis", "ChromaDB", "sentence-transformers", "React", "TypeScript", "Docker"],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "Relay is a gateway that sits between applications and LLM providers. Instead of every service calling OpenAI, Gemini or Cerebras directly, each with its own key, error handling and cost tracking, they all call Relay.",
          "It speaks the standard OpenAI chat-completions API, so an existing client switches over by changing one URL. Behind it, litellm reaches more than 100 providers.",
          "Every request that passes through gets authentication, rate limits, safety checks in both directions, caching and cost tracking, without a line of client code.",
        ],
      },
      {
        title: "Problem",
        paragraphs: [
          "Once more than one service talks to an LLM, the same plumbing gets rebuilt in each of them: provider keys passed around, retries on rate limits, ad-hoc prompt-injection checks, no shared cache, and no single place to see what the LLM bill or the safety posture looks like.",
          "Every copy is a little different, and none of them gets tested properly.",
        ],
      },
      {
        title: "Solution",
        paragraphs: [
          "Relay builds that layer once. Every request moves through the same pipeline: authenticate, rate-limit, scan the input, check the cache, route, call the model, scan the output, log.",
          "Authentication accepts JWTs or API keys. Keys are stored only as SHA-256 hashes and shown once. Rate limits are set per tier and kept in Redis, with an in-memory fallback if Redis is down.",
          "Input guardrails work in two layers. First, 31 regex patterns across six attack categories: instruction overrides, jailbreak personas, system-prompt extraction, injection delimiters, harmful content and credential exfiltration. Then a semantic check compares the request with known attacks, which catches paraphrases the patterns miss.",
          "A semantic cache answers near-repeat questions without a new LLM call. Requests are embedded with all-MiniLM-L6-v2 and matched in ChromaDB at a cosine similarity of 0.95 or higher, with a 24-hour expiry.",
          "Two optional features sit behind flags: smart routing, which sends simple prompts to a cheaper model and complex ones to a premium model, and LLMLingua-2 compression for long prompts.",
          "On the way out, eight redaction rules strip personal data before a response leaves: social security numbers, card numbers, emails, phone numbers, API keys, bearer tokens, IP addresses and passwords.",
        ],
      },
      {
        title: "Dashboard",
        paragraphs: [
          "A React and TypeScript dashboard shows everything live: each request with its cost, latency, cache hit and guardrail action, refreshed every three seconds, plus charts of routing savings and guardrail activity over time.",
          "It also has a chat playground, a converter that turns PDF, DOCX and PPTX files into Markdown, and an evals page that replays curated cases one by one and lets you type your own input into the same functions, so nothing on it is hardcoded.",
        ],
      },
      {
        title: "Highlights",
        paragraphs: [],
        list: [
          "One OpenAI-compatible endpoint for 100+ providers via litellm",
          "31 injection and jailbreak patterns plus a semantic paraphrase check, covering OWASP LLM Top 10 categories LLM01, LLM02 and LLM06",
          "Eight PII redaction rules on every response",
          "Semantic cache in ChromaDB with real sentence-transformer embeddings",
          "Smart routing estimated 43.9% cheaper on a 32-prompt benchmark",
          "149 tests, including 48 red-team prompts and 61 golden regression cases, run in GitHub Actions on every push",
          "One FastAPI process serves the API and the built dashboard; Docker runs PostgreSQL, Redis and ChromaDB",
        ],
      },
      {
        title: "Evaluation",
        paragraphs: [
          "The tests call the real routing and guardrail functions directly, with no server, database or LLM involved. 48 red-team prompts cover every attack category, alongside clean prompts that must pass untouched, and a regression suite of 61 golden cases pins down the expected routing and guardrail decisions.",
          "The cost benchmark is analytical. 32 synthetic prompts, 15 simple and 17 complex, are priced once at a premium model's rates and once with smart routing. Sending the simple ones to a cheaper model cut the estimated cost by 43.9%; complex prompts cost the same either way.",
        ],
      },
      {
        title: "Repository",
        paragraphs: [],
        links: [{ label: "GitHub", href: "https://github.com/sharmadivyam/relay-ai-gateway" }],
        code: {
          language: "bash",
          snippet:
            "# Any OpenAI client works: point it at Relay instead of the provider\ncurl -X POST http://localhost:8001/v1/chat/completions \\\n  -H \"Authorization: Bearer <jwt-or-api-key>\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\": \"cerebras/gpt-oss-120b\", \"messages\": [{\"role\": \"user\", \"content\": \"Hello!\"}]}'\n\n# Relay adds two fields to the usual response\n# { ..., \"gateway_cached\": false, \"gateway_fallback\": false }",
        },
      },
      {
        title: "Outcome",
        paragraphs: [
          "Relay is a complete, tested service rather than a demo: one process, one endpoint, and a dashboard that shows what every request cost and what the guardrails did to it.",
          "Most of the work went into everything around the model call: deciding what counts as an attack, how close two questions must be to share an answer, and what a dashboard has to show before anyone can trust the layer in front of their LLMs.",
        ],
      },
    ],
  },
  {
    slug: "citescope-citation-finder",
    title: "CiteScope: A Citation Finder That Knows When It Can't Answer",
    description:
      "Give it a research abstract and it returns the papers that abstract should cite, or abstains with a reason when its 26,601-paper corpus can't help. Classical retrieval built from scratch, measured against dense and hybrid search.",
    author: "Divyam Sharma",
    date: "October 2026",
    role: "AI Engineer",
    techStack: ["Python", "NLTK", "NumPy", "sentence-transformers", "OpenAlex API", "Streamlit"],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "CiteScope is a should-cite finder. Paste a research abstract and it returns the papers that abstract ought to be citing.",
          "It also does something most search engines don't. When the corpus has no good candidates, it shows no list at all. Instead it explains why: which of the abstract's distinctive terms the corpus never covers, how rare they are, and what the nearest material actually is.",
        ],
      },
      {
        title: "Problem",
        paragraphs: [
          "Search engines return something for every query. For citations, that is actively harmful. If an abstract comes from a field the corpus doesn't cover, or relies on work it doesn't hold, five confident-looking but wrong suggestions are worse than none.",
          "So CiteScope has two jobs: rank the corpus for an abstract-length query, and, before showing anything, decide from the retrieval evidence alone whether the corpus can serve that query at all.",
        ],
      },
      {
        title: "Solution",
        paragraphs: [
          "The corpus is 26,601 papers from OpenAlex: 16,330 information-retrieval papers from 2015 onwards, plus 10,271 works they cite. Each paper's own reference list is the ground truth, and the retriever never sees it.",
          "The ranking core is classical information retrieval written from scratch, with no IR library: tokenising and stemming, an inverted index with word positions and separate title, abstract and venue zones, tf-idf with cosine scoring, heap-based top-K, champion lists, index elimination and a small citation-based quality prior.",
          "BM25, dense retrieval with MiniLM embeddings, and a hybrid that fuses the tf-idf and dense rankings sit behind the same interface, so every approach is measured the same way.",
          "Abstention reads the shape of the result, not an LLM's opinion: how much of the query the corpus covers, how the scores fall away, how high the top score is, how rare the query's terms are, and how alike the top results are. A small logistic model, about thirty lines with no library, weighs these signals into one of three verdicts: confident, partial or insufficient.",
        ],
      },
      {
        title: "Evaluation",
        paragraphs: [
          "Retrieval was measured on 400 held-out abstracts. Hybrid search reached an nDCG@10 of 0.184 against 0.152 for plain tf-idf, a 21% improvement (p < 0.001, paired randomisation test). Tuned tf-idf alone reached 0.169.",
          "Abstention was tested on 379 cases the model never saw: 180 answerable abstracts, 49 whose references sit outside the corpus, and 150 abstracts from biology and economics. When CiteScope abstains it is right 95.4% of the time, and it turned away 148 of the 150 out-of-field abstracts.",
          "Against an embedding baseline that simply thresholds the top similarity score, overall accuracy is statistically the same (F1 0.893 against 0.890). They fail differently, though: CiteScope wrongly refuses 4% of answerable queries, the baseline 10%. And every CiteScope refusal names the terms behind it.",
        ],
      },
      {
        title: "Highlights",
        paragraphs: [],
        list: [
          "Inverted index, tf-idf, BM25, champion lists and top-K written from scratch",
          "Hybrid search: nDCG@10 of 0.184 against 0.152 for plain tf-idf on 400 held-out queries",
          "Abstains on retrieval signals alone, and is right 95.4% of the time it does",
          "Turned away 148 of 150 out-of-field abstracts",
          "Every refusal explains itself: missing terms, how rare they are, and the nearest material",
          "Leakage-safe corpus building, so test abstracts never see their own citations",
          "Full evaluation and ablation suite, a Streamlit demo and 32 unit tests",
        ],
      },
      {
        title: "Limitations",
        paragraphs: [
          "About half of each query's references are not in the corpus at all, so recall has a ceiling of 0.491 and every number should be read against it.",
          "The hardest case is only partly solved. When a paper uses the field's vocabulary but relies on work the corpus lacks, the signals look normal, and only 39% of those cases are caught.",
        ],
      },
      {
        title: "Repository",
        paragraphs: [],
        links: [{ label: "GitHub", href: "https://github.com/sharmadivyam/CiteScope_IR" }],
        code: {
          language: "bash",
          snippet:
            "python citescope.py cite --file my_abstract.txt     # the engine on your own abstract\npython citescope.py search --text \"...\" --explain 3  # tf-idf ranking with score breakdowns\npython citescope.py eval                             # rebuild every number above\nstreamlit run app.py                                 # local web UI",
        },
      },
      {
        title: "Outcome",
        paragraphs: [
          "The ranking was the expected part. The harder question was when not to answer, and answering it from retrieval evidence alone, with a reason a person can check, turned out to be the most useful thing the system does.",
        ],
      },
    ],
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
