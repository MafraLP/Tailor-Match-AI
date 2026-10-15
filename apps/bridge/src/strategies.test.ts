import test from "node:test";
import assert from "node:assert/strict";
import { strategyFor } from "./strategies.js";
import { validateEvaluation, validateOutput } from "./contracts.js";
import { exportApplication } from "./exportApplication.js";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("fake strategy never forwards context", async () => {
  const request = { task: "evaluate" as const, context: { profile: { confirmedEvidence: "private" } }, provider: { kind: "fake" as const } };
  const result = await strategyFor(request).execute(request);
  assert.equal(result.provider, "fake");
  assert.equal(result.simulated, true);
  assert.equal(validateEvaluation(JSON.parse(result.output)).classification, "Suitable");
});

test("selects every supported strategy", () => {
  assert.equal(strategyFor({ task: "evaluate", context: {}, provider: { kind: "cli", cli: "codex" } }).id, "cli");
  assert.equal(strategyFor({ task: "evaluate", context: {}, provider: { kind: "byok", endpoint: "https://example.test", model: "test", apiKey: "key" } }).id, "byok");
});

test("rejects an invalid model response", () => {
  assert.throws(() => validateOutput({ task: "evaluate", context: {}, provider: { kind: "fake" } }, "not json"), /JSON válido/);
});

test("exports a self-contained application folder", async () => {
  const directory = await mkdtemp(join(tmpdir(), "tailor-match-"));
  const previous = process.cwd();
  process.chdir(directory);
  try {
    const result = await exportApplication({ outputDirectory: "exports", jobTitle: "Acme / Senior Engineer", documents: { cv: { filename: "cv.txt", content: "CV" } }, context: { profile: {} }, evaluation: { score: 74 } });
    assert.equal(await readFile(join(result.directory, "cv.txt"), "utf8"), "CV");
    assert.match(result.directory, /acme-senior-engineer$/);
  } finally {
    process.chdir(previous);
    await rm(directory, { recursive: true, force: true });
  }
});
