import test from "node:test";
import assert from "node:assert/strict";
import { strategyFor } from "./strategies.js";
import { validateEvaluation, validateOutput } from "./contracts.js";

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
