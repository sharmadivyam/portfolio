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
    slug: "llm-distillation-model-behavior-analysis",
    title: "LLM Distillation & Model Behavior Analysis",
    description:
      "A PyTorch and Transformers project exploring cross-architecture LLM distillation, auxiliary-logit transfer, and model behavior shifts between Qwen and Gemma.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",
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
    slug: "smart-price-prediction-amazon-ml-challenge",
    title: "Smart Price Prediction",
    description:
      "An Amazon ML Challenge project using NeoBERT, LoRA, log-scaled targets, and SMAPE loss to predict noisy e-commerce prices from sparse product text.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
    author: "Divyam Sharma",
    date: "October 2025",
    role: "Machine Learning Engineer",
    techStack: ["Python", "PyTorch", "NeoBERT", "LoRA", "SMAPE"],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "Smart Price Prediction was built for the Amazon ML Challenge to estimate product prices from noisy e-commerce data. The project focused on making a text-based model more stable under extreme target variance.",
        ],
      },
      {
        title: "Problem",
        paragraphs: [
          "Product pricing data can be sparse, inconsistent, and highly skewed. A model trained directly on raw price targets can overreact to outliers and struggle to generalize across categories.",
        ],
      },
      {
        title: "Solution",
        paragraphs: [
          "I fine-tuned NeoBERT with LoRA applied to attention layers, using log-scaled targets to reduce variance and SMAPE loss to align training with the competition metric.",
          "This setup kept the model lightweight enough to iterate quickly while improving robustness on noisy product descriptions.",
        ],
      },
      {
        title: "Highlights",
        paragraphs: [
          "The work centered on reliable modeling choices for messy marketplace data.",
        ],
        list: [
          "Fine-tuned NeoBERT with LoRA adapters on attention layers",
          "Used log-scaled targets to reduce the effect of extreme price variance",
          "Optimized with SMAPE loss for competition-aligned evaluation",
          "Achieved 41.6 SMAPE on validation",
        ],
      },
      {
        title: "Repository",
        paragraphs: [
          "GitHub: github.com/sharmadivyam/amazon-ml-challenge-NeoBERT-LoRA",
        ],
      },
      {
        title: "Outcome",
        paragraphs: [
          "The model improved validation stability under sparse textual features and high target variance, producing a stronger baseline for price prediction on marketplace data.",
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
      "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=1600&q=80",
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
          "I trained MobileNetV2 on more than 60,000 images with augmentation and class balancing, then converted the final model to TensorFlow Lite for low-latency edge inference.",
          "The deployed model was about 5MB and ran with under 100ms inference latency on Raspberry Pi.",
        ],
      },
      {
        title: "Highlights",
        paragraphs: [
          "The system was tuned around practical deployment constraints rather than only offline accuracy.",
        ],
        list: [
          "Trained on 60k+ images with augmentation and class balancing",
          "Reached 97% accuracy across three waste classes",
          "Converted to a 5MB TensorFlow Lite model",
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
          "The final model showed that a compact edge deployment could support real-time classification while keeping accuracy high enough for a practical waste-sorting workflow.",
        ],
      },
    ],
  },
  {
    slug: "groomme-ai-recommendation-engine",
    title: "GroomMe - AI Recommendation Engine",
    description:
      "A Django REST Framework backend for wardrobe modeling, preference-aware recommendations, and Gemini-powered outfit suggestions.",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80",
    author: "Divyam Sharma",
    date: "July 2025",
    role: "Backend & AI Engineer",
    techStack: ["Django", "Django REST Framework", "Gemini API", "JWT", "SQLite"],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "GroomMe is an AI recommendation engine for outfit suggestions. I built the backend around wardrobe data, user preferences, secure APIs, and Gemini-powered recommendation generation.",
        ],
      },
      {
        title: "Problem",
        paragraphs: [
          "Outfit recommendation needs more than a generic text prompt. The system has to understand wardrobe items, user preferences, and context while keeping the data model clean enough for future product features.",
        ],
      },
      {
        title: "Solution",
        paragraphs: [
          "I designed normalized schemas for wardrobe items and user preference modeling, then exposed them through JWT-secured Django REST Framework APIs.",
          "Gemini API integration used prompt conditioning and attribute filtering so recommendations could respond to actual wardrobe and preference data.",
        ],
      },
      {
        title: "Highlights",
        paragraphs: [
          "The backend was structured to support both reliable data management and AI-assisted recommendation quality.",
        ],
        list: [
          "Built DRF APIs for wardrobe and preference modeling",
          "Added JWT-secured endpoints for authenticated access",
          "Integrated Gemini API for context-aware outfit recommendations",
          "Used prompt conditioning and attribute filtering to improve relevance",
        ],
      },
      {
        title: "Repository",
        paragraphs: [
          "GitHub: github.com/sharmadivyam/GroomMe",
        ],
        code: {
          language: "python",
          snippet:
            "recommendation_context = {\n  \"wardrobe_items\": user_wardrobe,\n  \"preferences\": style_profile,\n  \"filters\": [\"occasion\", \"weather\", \"color_match\"],\n}",
        },
      },
      {
        title: "Outcome",
        paragraphs: [
          "The project created a practical backend foundation for AI styling features, combining structured wardrobe data with prompt-conditioned generation.",
        ],
      },
    ],
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
