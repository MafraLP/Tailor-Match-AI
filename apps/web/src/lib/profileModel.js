export function newProfile() {
  return {
    photo: "", name: "", headline: "", location: "", links: "", languages: [], education: [], career: [], skills: [], projects: [], rawStories: "", confirmedEvidence: "", importedSources: []
  };
}

export function migrateProfile(value = {}) {
  const profile = { ...newProfile(), ...value };
  if (typeof profile.languages === "string") profile.languages = profile.languages ? profile.languages.split(",").map((name) => ({ name: name.trim(), level: "" })) : [];
  if (typeof profile.skills === "string") profile.skills = profile.skills ? profile.skills.split(",").map((name) => ({ name: name.trim(), category: "", evidence: "" })) : [];
  if (typeof profile.stories === "string" && !profile.rawStories) profile.rawStories = profile.stories;
  if (typeof profile.experience === "string" && !profile.confirmedEvidence) profile.confirmedEvidence = profile.experience;
  for (const key of ["languages", "education", "career", "skills", "projects", "importedSources"]) if (!Array.isArray(profile[key])) profile[key] = [];
  return profile;
}

export function profileEvidence(profile) {
  return [
    profile.confirmedEvidence,
    ...(profile.career || []).map((item) => [item.company, item.role, item.responsibilities, item.outcomes, item.technologies].filter(Boolean).join(" — ")),
    ...(profile.projects || []).map((item) => [item.name, item.description, item.technologies, item.outcomes].filter(Boolean).join(" — ")),
    ...(profile.skills || []).map((item) => item.evidence ? `${item.name}: ${item.evidence}` : item.name)
  ].filter(Boolean).join("\n\n");
}
