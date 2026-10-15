export function normalizeWhitespace(value) {
  return String(value ?? "").trim().replace(/\r\n/g, "\n").replace(/[\t ]+/g, " ").replace(/\n{3,}/g, "\n\n");
}

import { migrateProfile, profileEvidence } from "./profileModel.js";

export function buildContextPackage(profile, job) {
  const canonical = migrateProfile(profile);
  return {
    version: "profile-v2",
    profile: {
      name: normalizeWhitespace(canonical.name),
      headline: normalizeWhitespace(canonical.headline),
      location: normalizeWhitespace(canonical.location),
      links: normalizeWhitespace(canonical.links),
      languages: canonical.languages.map((item) => ({ name: normalizeWhitespace(item.name), level: normalizeWhitespace(item.level) })),
      education: canonical.education,
      career: canonical.career,
      skills: canonical.skills,
      projects: canonical.projects,
      confirmedEvidence: normalizeWhitespace(profileEvidence(canonical)),
      rawContext: normalizeWhitespace(canonical.rawStories)
    },
    job: {
      url: normalizeWhitespace(job.url),
      description: normalizeWhitespace(job.normalizedDescription || job.description)
    }
  };
}

export function validationMessage(profile, job) {
  if (!normalizeWhitespace(profileEvidence(migrateProfile(profile)))) return "Adicione ao menos uma evidência confirmada ao perfil antes de continuar.";
  if (!normalizeWhitespace(job.normalizedDescription || job.description || "")) return "Cole a descrição da vaga antes de continuar.";
  return "";
}
