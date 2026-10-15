import test from "node:test";
import assert from "node:assert/strict";
import { buildContextPackage, validationMessage } from "../src/lib/contextPackage.js";

test("keeps raw stories distinct from confirmed evidence", () => {
  const profile = { name: " Ana ", headline: "Dev", location: "", languages: "", skills: "Vue", confirmedEvidence: " Entreguei APIs. ", stories: " Fiz um hackathon. " };
  const job = { url: "", description: "", normalizedDescription: " Construir APIs. " };
  const context = buildContextPackage(profile, job);

  assert.equal(context.profile.confirmedEvidence, "Entreguei APIs.");
  assert.equal(context.profile.rawContext, "Fiz um hackathon.");
  assert.equal(context.job.description, "Construir APIs.");
});

test("requires evidence and a job description", () => {
  assert.match(validationMessage({ confirmedEvidence: "", experience: "" }, { description: "Vaga" }), /evidência/);
  assert.match(validationMessage({ confirmedEvidence: "Experiência" }, { description: "" }), /descrição/);
});
