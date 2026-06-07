export type ProjectSection = {
  title: string;
  paragraphs: string[];
  list?: string[];
  code?: {
    language: string;
    snippet: string;
  };
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  image: string;
  author: string;
  date: string;
  role: string;
  techStack: string[];
  sections: ProjectSection[];
};

export const projects: Project[] = [
  {
  slug: "what-if-counterfactual-history-engine",
  title: "WHAT IF? — Counterfactual History Engine",
  description:
    "A multi-agent RAG pipeline that answers historical 'what if' questions with grounded, cited, confidence-scored reasoning — keeping verified facts strictly separate from simulated consequences.",
  image: "/what-if.avif",
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
        "WHAT IF? is a counterfactual history engine built around one core principle: honesty about uncertainty is the product. Ask it any 'what if' question about history and instead of one confident, unverifiable answer, it returns two clearly separated outputs — a grounded, cited 'What We Know' section built from retrieved historical evidence, and a scored, labeled 'What Might Have Happened' section where every speculative step is marked as such.",
        "The system runs a 5-agent LangGraph pipeline that retrieves context from a local ChromaDB vector store, classifies and grounds each fact to its exact source chunk, constructs a bounded causal chain of simulated consequences, and scores each step's confidence purely by how much verified evidence backs it — not by asking the model how certain it feels.",
      ],
    },
    {
      title: "Problem",
      paragraphs: [
        "Large language models are very good at sounding certain. When asked a counterfactual history question, they blend verified historical facts, reasonable inference, and confident hallucination into a single fluent paragraph — with no sources, no labels, and no signal about which parts to trust. The answer reads like authoritative analysis but there is no way to audit it.",
        "The deeper problem is that this isn't unique to history. Any domain where confusing fact with speculation carries real cost — medicine, law, research, finance — faces the same failure mode. A raw LLM gives you an answer. It does not give you a reason to trust or distrust any particular part of it.",
      ],
    },
    {
      title: "Solution",
      paragraphs: [
        "The pipeline separates the retrieval, grounding, reasoning, and scoring stages into distinct agents with strict contracts between them. Each agent returns a validated Pydantic model — never a raw string — so nothing can silently break mid-pipeline. The grounding layer extracts only claims that can be tied to a specific retrieved chunk and classifies each as VERIFIED, DEBATED, or BACKGROUND. The reasoning agent then builds a causal chain on top of that grounded context, where every simulated step must carry a [SIMULATED] label and an [EVIDENCE: chunk_id] tag pointing to the specific chunk it draws from.",
        "Confidence is computed by Agent 5 through pure logic — counting how many verified facts back each reasoning step and assigning HIGH, MEDIUM, LOW, or SPECULATIVE accordingly. The model's self-reported confidence is captured separately for contrast but never used as the actual score. A hard cap of 4 causal steps acts as a hallucination guard: the longer the chain, the more speculative it becomes, so the system refuses to go further.",
      ],
    },
    {
      title: "Architecture",
      paragraphs: [
        "The system has two planes: an offline ingestion pipeline that builds the vector store once, and an online query pipeline that runs per question. Ingestion downloads 18 Wikipedia articles, chunks them paragraph-aware into ~300-token segments with 100-token overlap, embeds them with the local all-mpnet-base-v2 model (no API call), and upserts them into a persistent ChromaDB collection — 1,466 chunks total.",
        "The online pipeline is a LangGraph StateGraph with 5 nodes wired by conditional edges. Every node failure is caught and recorded gracefully; the graph halts at END rather than crashing. A similarity floor of 0.6 governs the retrieval fallback: because ChromaDB always returns top-k results regardless of relevance, an out-of-corpus question returns a full pool of low-similarity junk rather than an empty one. When no hit clears the floor, a dynamic Wikipedia fallback fires — it fetches live pages, chunks and embeds them locally, upserts them into ChromaDB, and re-runs the same vector search. This entire fallback makes zero LLM calls.",
      ],
    },
    {
      title: "Highlights",
      paragraphs: [
        "The most significant engineering decisions were around reliability and honesty rather than raw capability — what to do when evidence is weak, how to prevent the model from fabricating citations, and how to make uncertainty visible rather than papering over it.",
      ],
      list: [
        "5-agent LangGraph StateGraph with graceful error handling at every node — the pipeline never crashes, it halts honestly",
        "RAG pipeline with ChromaDB and local all-mpnet-base-v2 embeddings — zero API cost for retrieval",
        "Dynamic Wikipedia fallback triggered by cosine similarity floor (< 0.6) — fetches, chunks, embeds, and re-searches live with zero LLM calls",
        "Grounding layer validates every cited chunk_id against the actual retrieved pool and re-attaches citations from the matched SearchResult — fabricated IDs are dropped, not trusted",
        "Per-agent LLM temperatures tuned to task: T=0.1 for query parsing (stable), T=0.0 for grounding (deterministic extraction), T=0.3 for reasoning (controlled creativity)",
        "Confidence scored by evidence count in Agent 5 (pure logic, no LLM) — HIGH (≥2 verified facts), MEDIUM (1 verified or analogy), LOW (only debated/background), SPECULATIVE (ungrounded)",
        "Hard 4-step causal cap as a hallucination guard — extra steps are dropped with a warning",
        "Pydantic v2 validation at every agent boundary with one corrective retry on JSON-mode failures",
        "SHA-256-keyed result cache with pre-warmed example answers — known questions return instantly at ₹0, errors are never frozen in",
        "Automated evaluation suite with 4 rule-checks (C1–C4) across 8 test cases — C3 (step cap) held 8/8",
      ],
    },
    {
      title: "Evaluation",
      paragraphs: [
        "The evaluation suite runs the full 5-agent chain over 8 curated counterfactual questions and applies four automated checks per case. C1 verifies every reasoning step carries a [SIMULATED] label. C2 verifies every step cites a chunk_id that exists in the grounded context. C3 verifies no more than 4 causal steps are produced. C4 verifies no simulated content is presented as fact.",
        "C3 held across all 8 cases. C1 and C4 passed 7/8. C2 is the weakest dimension at 4/8 — the reasoning model sometimes emits fabricated chunk_ids, which are flagged and downgraded to SPECULATIVE rather than silently accepted. The evaluator also reports each case's overall_confidence from Agent 5.",
      ],
    },
    {
      title: "Repository",
      paragraphs: [
        "GitHub: github.com/divyamsharma/what-if — Live demo: what-iff.streamlit.app",
      ],
      code: {
        language: "python",
        snippet:
          'pipeline_config = {\n  "agents": [\n    {"id": 1, "name": "understand_query",  "llm_calls": 1, "temperature": 0.1},\n    {"id": 2, "name": "retrieve_context",  "llm_calls": 0, "fallback": "wikipedia_dynamic"},\n    {"id": 3, "name": "ground_context",    "llm_calls": 2, "temperature": 0.0},\n    {"id": 4, "name": "reason",            "llm_calls": 1, "temperature": 0.3},\n    {"id": 5, "name": "score_reasoning",   "llm_calls": 0, "method": "evidence_count"},\n  ],\n  "hallucination_guard": {"max_causal_steps": 4},\n  "confidence_levels": ["HIGH", "MEDIUM", "LOW", "SPECULATIVE"],\n  "total_api_cost": "₹0",\n}',
      },
    },
    {
      title: "Outcome",
      paragraphs: [
        "The project demonstrated that the interesting engineering in an LLM application often lives in the guardrails, not the generation. Structuring uncertainty — deciding what counts as evidence, enforcing that simulations are labeled, computing confidence rather than asking for it — required more careful design than the reasoning pipeline itself.",
        "The final system runs entirely on free-tier APIs and local models at ₹0, handles out-of-corpus questions through a zero-LLM-call live Wikipedia fallback, and produces outputs where a reader can audit exactly which claims are verified, which are debated, and which are the model's own inferences.",
      ],
    },
  ],
},
  
  {
    slug: "llm-distillation-model-behavior-analysis",
    title: "LLM Distillation & Model Behavior Analysis",
    description:
      "A PyTorch and Transformers project exploring cross-architecture LLM distillation, auxiliary-logit transfer, and model behavior shifts between Qwen and Gemma.",
    image:
      "/llm-distillation.avif",
    author: "Divyam Sharma",
    date: "January 2026",
    role: "AI/ML Engineer",
    techStack: ["Python", "PyTorch", "Transformers", "Qwen", "Gemma"],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "This project studies how model behavior changes when knowledge is transferred between different LLM architectures. I built a Qwen to Gemma distillation pipeline using auxiliary-logit transfer and then analyzed the resulting trait shifts.",
          "The work focused on making the training process stable enough to compare behavior before and after distillation rather than only tracking loss curves.",
        ],
      },
      {
        title: "Problem",
        paragraphs: [
          "Cross-architecture distillation can behave unpredictably because the student model carries its own initialization bias. Even when the teacher provides useful logits, the student may amplify or suppress traits in non-obvious ways.",
          "The core challenge was to stabilize transfer while still preserving enough signal to observe meaningful model behavior changes.",
        ],
      },
      {
        title: "Solution",
        paragraphs: [
          "I implemented an auxiliary-logit distillation setup and tuned the training configuration around batch size, learning rate, and logit weighting. The pipeline made it easier to compare convergence behavior across experimental runs.",
          "During analysis, I observed non-intuitive trait shifts from around 2% to 15-18%, pointing to strong initialization bias in the student model.",
        ],
      },
      {
        title: "Highlights",
        paragraphs: [
          "The project combined model training with behavior-focused evaluation so the output could be understood beyond a single aggregate metric.",
        ],
        list: [
          "Built a Qwen to Gemma distillation pipeline with auxiliary-logit transfer",
          "Tracked trait shifts that suggested strong student-model initialization bias",
          "Tuned batch size, learning rate, and logit weighting for more stable transfer",
          "Improved convergence consistency across cross-architecture experiments",
        ],
      },
      {
        title: "Repository",
        paragraphs: [
          "GitHub: github.com/sharmadivyam/Subliminal_learning_LLMs_MNIST",
        ],
        code: {
          language: "python",
          snippet:
            "distillation_config = {\n  \"teacher\": \"Qwen\",\n  \"student\": \"Gemma\",\n  \"transfer\": \"auxiliary_logits\",\n  \"tuned_params\": [\"batch_size\", \"learning_rate\", \"logit_weight\"],\n}",
        },
      },
      {
        title: "Outcome",
        paragraphs: [
          "The final experiments made the behavioral effect of distillation easier to inspect and gave a clearer view into how initialization bias can shape cross-model transfer.",
        ],
      },
    ],
  },
  
  {
    slug: "smart-price-prediction",
    title: "Smart Price Prediction",
    description:
      "An Amazon ML Challenge project using NeoBERT, LoRA, log-scaled targets, and SMAPE loss to predict noisy e-commerce prices from sparse product text.",
    image:
      "/smart-price.png",
    author: "Divyam Sharma",
    date: "October 2025",
    role: "AI/ML Engineer",
    techStack: ["PyTorch", "NeoBERT", "LoRA", "Python", "Transformers"],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "This project was built for the Amazon ML Challenge 2025, where the task was to predict product prices from catalog text. The data was noisy, sparse, and heavily right-skewed, making ordinary regression unstable.",
          "The approach centered on fine-tuning NeoBERT with parameter-efficient LoRA adapters, then pairing that with target engineering and a metric-aligned loss.",
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
          "I fine-tuned NeoBERT with LoRA on the Q and V attention projections, reducing trainable parameters by about 97% while preserving the backbone representations. Log-scaled targets compressed the price distribution, and SMAPE loss made the error signal more scale-invariant.",
          "I also inspected CLS embedding behavior and attention head activations to understand which product attributes, especially brand tokens and numeric specs, carried the strongest pricing signal.",
        ],
      },
      {
        title: "Highlights",
        paragraphs: [],
        list: [
          "NeoBERT fine-tuned with LoRA on Q and V projections",
          "About 97% reduction in trainable parameters",
          "Log-scaled targets to stabilize learning against price variance",
          "SMAPE loss for symmetric, scale-aware error penalization",
          "Achieved 41.6 SMAPE on the validation set",
          "Mixed-precision training, AdamW optimizer, and gradient clipping",
        ],
      },
      {
        title: "Outcome",
        paragraphs: [
          "The model produced a competitive validation score and showed that lightweight fine-tuning with careful loss design can handle noisy marketplace pricing data effectively.",
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
        paragraphs: [
          "GitHub: github.com/khushwant1234/EcoBin_SIH_APP",
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
    title: "GroomMe - AI Recommendation Engine",
    description:
      "A full-stack recommendation platform that uses Django REST Framework and Gemini to turn wardrobe data into context-aware outfit suggestions.",
    image:
      "/groomme.png",
    author: "Divyam Sharma",
    date: "August 2025",
    role: "Full-Stack Engineer",
    techStack: ["Django", "DRF", "Gemini API", "SQLite", "JWT", "Python"],
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
    slug: "lexigrade-text-readability-classifier",
    title: "LexiGrade - Text Readability Classifier",
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
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
