import type { BridgeRequest } from "./types.js";

const evaluationSchema = `{"score":0,"classification":"Suitable|Borderline|Not suitable","summary":"...","radar":[{"label":"...","candidate":0,"role":0}],"strengths":[{"title":"...","evidence":"..."}],"gaps":[{"title":"...","detail":"...","level":"Atenção|Confirmar|Bloqueador"}]}`;
const documentsSchema = `{"cv":{"filename":"resume.txt","content":"..."},"coverLetter":{"filename":"cover-letter.txt","content":"..."}}`;

export const promptVersion = "v1";

export function buildPrompt(request: BridgeRequest) {
  const shared = [
    "You are Tailor Match AI.",
    "Use only confirmedEvidence and skills as CV claims. rawContext is background only and must never become a claim without confirmation.",
    "Never invent employers, dates, metrics, certifications, technologies, seniority, or language proficiency.",
    "Return JSON only, with no markdown fence or commentary.",
    `Prompt version: ${promptVersion}.`,
    `Context: ${JSON.stringify(request.context)}`
  ];
  if (request.task === "evaluate") {
    return [...shared, "Evaluate fit using demonstrated evidence, job requirements, seniority, responsibilities, technologies, domain, constraints, and mandatory requirements.", "Each strength must quote or precisely identify its evidence. Missing or unproven requirements must remain a gap.", `JSON schema: ${evaluationSchema}`].join("\n");
  }
  return [...shared, "Create an ATS-friendly, single-column plain-text CV. Add a cover letter only when options.coverLetter is true. Obey the selected language and additional instructions only when they do not create unsupported claims.", `JSON schema: ${documentsSchema}`].join("\n");
}
