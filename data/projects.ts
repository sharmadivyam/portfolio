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
    slug: "prompt-evaluation-studio",
    title: "Prompt Evaluation Studio",
    description:
      "A case-study platform for evaluating prompt quality, distilling instructions, and improving retrieval-backed LLM workflows before production launch.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",
    author: "Divyam Sharma",
    date: "March 2026",
    role: "AI Engineer",
    techStack: ["Next.js", "Python", "FastAPI", "PostgreSQL", "OpenAI"],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "Prompt Evaluation Studio was built to make LLM iteration feel measurable instead of intuitive. The product gave a single place to compare prompt versions, inspect retrieval quality, and document why one instruction strategy outperformed another.",
          "The goal was to turn experimentation into a repeatable workflow that could be shared across product, engineering, and research teams.",
        ],
      },
      {
        title: "Problem",
        paragraphs: [
          "Prompt changes were being tracked across notebooks, chat logs, and private docs, which made it difficult to understand what actually improved outputs.",
          "Without structured evaluations, teams shipped prompt edits that looked better in isolated examples but regressed on real user queries.",
        ],
      },
      {
        title: "Solution",
        paragraphs: [
          "I designed a pipeline that stored prompts, datasets, retrieval traces, and scored outputs in one review surface. Each experiment could be re-run against the same benchmark set so changes were comparable over time.",
          "A review layer made it easier to annotate failure modes like hallucination, tone mismatch, and incomplete grounding before deployment.",
        ],
      },
      {
        title: "Features",
        paragraphs: [
          "The detail view focused on helping collaborators move from raw output inspection to decision-making quickly.",
        ],
        list: [
          "Versioned prompt experiments with side-by-side comparisons",
          "Retrieval trace inspection for grounding and citation quality",
          "Reusable benchmark datasets for regression testing",
          "Reviewer notes for labeling model failure modes",
        ],
      },
      {
        title: "Tech Stack",
        paragraphs: [
          "The interface was built in Next.js while the evaluation engine ran through Python services and FastAPI endpoints. PostgreSQL stored experiment history and OpenAI models powered generation and scoring assistance.",
        ],
        code: {
          language: "ts",
          snippet:
            "const evaluation = await runBenchmark({\n  promptVersion,\n  dataset: \"customer-support-v3\",\n  checks: [\"grounding\", \"tone\", \"completeness\"],\n});",
        },
      },
      {
        title: "Results / Impact",
        paragraphs: [
          "The workflow reduced prompt review time significantly and created a more reliable path from prototype to production. Teams could identify weak prompts earlier, compare iterations with confidence, and communicate evaluation outcomes more clearly to stakeholders.",
        ],
      },
    ],
  },
  {
    slug: "personalization-ranking-engine",
    title: "Personalization Ranking Engine",
    description:
      "A recommendation system focused on personalization, ranking quality, and explainable content discovery for a product-facing experience.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
    author: "Divyam Sharma",
    date: "September 2025",
    role: "ML Engineer",
    techStack: ["Next.js", "Python", "Scikit-learn", "Pandas", "Supabase"],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "This project explored how recommendation systems can balance relevance with discoverability. The product experience needed to feel personalized without becoming repetitive or opaque.",
        ],
      },
      {
        title: "Problem",
        paragraphs: [
          "Users were seeing generic content ordering that failed to reflect prior engagement. The experience felt static and did not create a strong reason to continue browsing.",
        ],
      },
      {
        title: "Solution",
        paragraphs: [
          "I built a ranking layer that blended interaction history, content similarity, and lightweight diversity constraints. This let the system surface items that were both relevant and fresh.",
          "The UI also exposed subtle reasoning cues so the output felt more intentional and trustworthy.",
        ],
      },
      {
        title: "Features",
        paragraphs: [
          "A few core features made the system easier to tune and easier to explain.",
        ],
        list: [
          "Hybrid ranking using user behavior and content embeddings",
          "Cold-start handling for new users and low-signal sessions",
          "Diversity weighting to avoid repetitive recommendation loops",
          "Analyst-friendly dashboards for debugging ranking changes",
        ],
      },
      {
        title: "Tech Stack",
        paragraphs: [
          "Python pipelines handled feature preparation and ranking experiments, while the presentation layer in Next.js surfaced recommendations and evaluation summaries. Supabase simplified data access for lightweight iteration.",
        ],
      },
      {
        title: "Results / Impact",
        paragraphs: [
          "The final system produced noticeably better recommendation variety while preserving strong relevance. That translated into more exploration, clearer experimentation loops, and a more premium product feel overall.",
        ],
      },
    ],
  },
  {
    slug: "production-ml-observability",
    title: "Production ML Observability",
    description:
      "An end-to-end deployment case study covering data pipelines, serving APIs, monitoring, and the operational tooling needed to keep ML systems reliable.",
    image:
      "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=1600&q=80",
    author: "Divyam Sharma",
    date: "May 2024",
    role: "Backend & ML Systems Engineer",
    techStack: ["Next.js", "Django", "PostgreSQL", "Docker", "Grafana"],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "Production ML Observability focused on the less glamorous but critical side of machine learning: making deployed systems measurable, debuggable, and safe to iterate on.",
        ],
      },
      {
        title: "Problem",
        paragraphs: [
          "Once models were deployed, it was difficult to understand drift, degraded latency, or data quality problems without digging through multiple services manually.",
        ],
      },
      {
        title: "Solution",
        paragraphs: [
          "I built a monitoring-oriented architecture that exposed model health, pipeline status, and API behavior through one operational layer. The result was a faster feedback loop between engineering and ML teams.",
        ],
      },
      {
        title: "Features",
        paragraphs: [
          "The system prioritized clear signals over excessive dashboards.",
        ],
        list: [
          "Health metrics for model accuracy, latency, and throughput",
          "Pipeline checks for broken jobs and stale datasets",
          "Alerting for threshold breaches and service regressions",
          "Operational logs tied to API and model lifecycle events",
        ],
      },
      {
        title: "Tech Stack",
        paragraphs: [
          "Django and PostgreSQL handled application logic and persisted monitoring records, Docker standardized deployments, and Grafana dashboards surfaced the metrics that mattered most to the team.",
        ],
      },
      {
        title: "Results / Impact",
        paragraphs: [
          "The project improved release confidence and shortened the time needed to diagnose production issues. Instead of reacting late, the team could catch drift and pipeline failures earlier with better context.",
        ],
      },
    ],
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
