export function normalizeWhitespace(value) {
  return String(value ?? "").trim().replace(/\r\n/g, "\n").replace(/[\t ]+/g, " ").replace(/\n{3,}/g, "\n\n");
}

export function buildContextPackage(profile, job) {
  return {
    version: "milestone-2",
    profile: {
      name: normalizeWhitespace(profile.name),
      headline: normalizeWhitespace(profile.headline),
      location: normalizeWhitespace(profile.location),
      languages: normalizeWhitespace(profile.languages),
      confirmedEvidence: normalizeWhitespace(profile.confirmedEvidence),
      skills: normalizeWhitespace(profile.skills),
      rawContext: normalizeWhitespace(profile.stories)
    },
    job: {
      url: normalizeWhitespace(job.url),
      description: normalizeWhitespace(job.normalizedDescription || job.description)
    }
  };
}

export function validationMessage(profile, job) {
  if (!normalizeWhitespace(profile.confirmedEvidence || profile.experience || "")) return "Adicione ao menos uma evidência confirmada do perfil antes de continuar.";
  if (!normalizeWhitespace(job.normalizedDescription || job.description || "")) return "Cole a descrição da vaga antes de continuar.";
  return "";
}
