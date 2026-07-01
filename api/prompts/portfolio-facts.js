/** Shared portfolio facts for chat and video assistant prompts. */
export const PORTFOLIO_FACTS = {
  name: "Rishikesh Bastakoti",
  education: "Sophomore, Computer Science, Caldwell University (Class of 2028). GPA 3.90.",
  highSchool: "National School of Sciences, Kathmandu",
  background: "Originally from Kathmandu, Nepal. Currently in Caldwell, New Jersey, USA.",
  skills:
    "Python, JavaScript/TypeScript, React, FastAPI, Streamlit, FastHTML, SQL/SQLAlchemy, Ollama, LangChain, Rust (PyO3), HTML5, CSS3",
  projects: [
    "AI Compliance Firewall — LLM middleware with FINRA-style and HIPAA-style rule scanning, regex plus Ollama semantic embeddings, policy actions (pass, flag, redact, block, append disclaimers), Neo4j knowledge graph, and SQLite audit logs. Built with FastAPI, FastHTML, and optional Rust rule engine.",
    "QuickLoan App — Full-stack application built with React, FastAPI, SQLAlchemy.",
    "BudgetTracker — Python project using data structures and file I/O.",
    "AI-Powered Portfolio — This site: Gemini-powered chat assistant (Groq fallback), voice commands, Anam video calls, live weather/news, quiz, Supabase analytics on Vercel."
  ],
  interests: "Web development, algorithms, AI/ML",
  personal: {
    movie: "Interstellar",
    song: "Timi Ra Ma by Dixita Karki",
    city: "Pokhara"
  },
  links: {
    linkedin: "https://www.linkedin.com/in/rbastakoti1/",
    github: "https://github.com/reseekesh821",
    resume:
      "https://cdn.jsdelivr.net/gh/reseekesh821/music@main/Resume-%20Rishikesh%20Bastakoti-%202026%20-%20Google%20Docs.pdf"
  },
  nameMishearings:
    "Ricketh, Russo-Guest, Richesh, Rishi, Ritikesh, Recites, Ridiculous, Rickesh, Rishy, Reeshi, Reshikesh, Rishikash, Riscus, Bastakoti"
};

export function formatFactsBlock() {
  const f = PORTFOLIO_FACTS;
  return `Education: ${f.education}
High School: ${f.highSchool}
Background: ${f.background}
Technical Skills: ${f.skills}
Projects:
${f.projects.map((p, i) => `${i + 1}. ${p}`).join("\n")}
Interests: ${f.interests}
Personal: Favorite movie — ${f.personal.movie}. Favorite song — "${f.personal.song}". Favorite city — ${f.personal.city}.
LinkedIn: ${f.links.linkedin}
GitHub: ${f.links.github}
Resume: ${f.links.resume}`;
}
