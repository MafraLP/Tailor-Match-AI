import test from "node:test";
import assert from "node:assert/strict";
import { strategyFor } from "./strategies.js";

test("fake strategy never forwards context", async () => {
  const result = await strategyFor({ task: "evaluate", context: { profile: "private" }, provider: { kind: "fake" } }).execute({ task: "evaluate", context: { profile: "private" }, provider: { kind: "fake" } });
  assert.equal(result.provider, "fake");
  assert.equal(result.simulated, true);
});

test("selects every supported strategy", () => {
  assert.equal(strategyFor({ task: "evaluate", context: {}, provider: { kind: "cli", cli: "codex" } }).id, "cli");
  assert.equal(strategyFor({ task: "evaluate", context: {}, provider: { kind: "byok", endpoint: "https://example.test", model: "test", apiKey: "key" } }).id, "byok");
});
