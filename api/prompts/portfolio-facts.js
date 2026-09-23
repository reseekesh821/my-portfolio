/** Shared portfolio facts for chat and video assistant prompts. */
export const PORTFOLIO_FACTS = {
  name: "Rishikesh Bastakoti",
  education:
    "B.S. Computer Science at William Paterson University (Aug 2026 – Dec 2028, Wayne, NJ). Previously studied at Caldwell University (Aug 2024 – May 2026).",
  /** Only share when the user asks about GPA, grades, or academic performance. */
  gpa: "3.90/4.0 at Caldwell University",
  highSchool: "National School of Sciences, Kathmandu",
  background: "Originally from Kathmandu, Nepal. Currently lives in Newark, New Jersey, USA.",
  careerGoal:
    "Aspiring AI application engineer — builds practical, production-oriented software on top of already-trained AI models by combining LLMs with backends, APIs, databases, RAG, tool integration, and reliable software engineering. Aims for systems that are secure, scalable, and useful in real-world environments—beyond simple demos.",
  skills:
    "Python, JavaScript/TypeScript, Rust (PyO3), SQL, C, FastAPI, Streamlit, FastHTML, Node.js, Vercel Serverless, LangChain, Ollama, Neo4j, PostgreSQL, Supabase, SQLite, Docker, Tailwind CSS, SQLAlchemy, JWT, React",
  projects: [
    "Behavior-Aware Personal Budget Tracker — Undergraduate FinTech research app (Python, FastAPI, Streamlit) with a rule engine and Isolation Forest anomaly detection for coaching insights.",
    "AI Compliance Firewall — High-throughput LLM guardrails middleware (FastAPI, FastHTML) enforcing HIPAA/FINRA-style rules via regex + Ollama embeddings, Neo4j disclaimer injection, SQLite audit logs, and a Rust/PyO3 rule engine.",
    "AI-Powered Portfolio — This site: Groq-backed (Llama 3.3 70B) chat assistant with voice/DOM commands, Anam video calls, live weather/news, quiz, and Supabase analytics on Vercel.",
    "QuickLoan App — Full-stack loan application system with React, FastAPI, and SQLAlchemy."
  ],
  interests: "AI application engineering, LLMs, RAG, full-stack systems, FinTech explainability",
  personal: {
    movie: "Interstellar",
    song: "Timi Ra Ma by Dixita Karki",
    city: "Pokhara"
  },
  links: {
    linkedin: "https://www.linkedin.com/in/rbastakoti1/",
    github: "https://github.com/reseekesh821",
    resume:
      "https://cdn.jsdelivr.net/gh/reseekesh821/music@main/Resume-%20Rishikesh%20Bastakoti-%202026.pdf"
  },
  nameMishearings:
    "Ricketh, Russo-Guest, Richesh, Rishi, Ritikesh, Recites, Ridiculous, Rickesh, Rishy, Reeshi, Reshikesh, Rishikash, Riscus, Bastakoti"
};

export function formatFactsBlock() {
  const f = PORTFOLIO_FACTS;
  return `Background: ${f.background}
Education: ${f.education}
High School: ${f.highSchool}
Career goal: ${f.careerGoal}
Technical Skills: ${f.skills}
Projects:
${f.projects.map((p, i) => `${i + 1}. ${p}`).join("\n")}
Interests: ${f.interests}
Personal: Favorite movie — ${f.personal.movie}. Favorite song — "${f.personal.song}". Favorite city — ${f.personal.city}.
LinkedIn: ${f.links.linkedin}
GitHub: ${f.links.github}
Resume: ${f.links.resume}

GPA / GRADES (STRICT)
- GPA is ${f.gpa}.
- Mention GPA ONLY if the user specifically asks about GPA, grades, academic performance, or how well he did in school.
- Do NOT volunteer GPA, and do not append "(GPA 3.90)" when mentioning Caldwell or education in general.
- Caldwell University is previous school — mention it when asked about education history, transfer, or previous university; do not force it into every answer.`;
}
