import { spawn } from "node:child_process";
import type { BridgeRequest, BridgeResponse, ProviderStrategy } from "./types.js";

const timeoutMs = 90_000;

function payload(request: BridgeRequest) {
  return JSON.stringify({ task: request.task, context: request.context });
}

export class FakeStrategy implements ProviderStrategy {
  readonly id = "fake";

  async execute(request: BridgeRequest): Promise<BridgeResponse> {
    return { provider: this.id, simulated: true, output: `Local fake response for ${request.task}. No provider received your context.` };
  }
}

export class CliStrategy implements ProviderStrategy {
  readonly id = "cli";

  async execute(request: BridgeRequest): Promise<BridgeResponse> {
    if (request.provider.kind !== "cli") throw new Error("CLI configuration is required.");
    const command = request.provider.cli;
    const args = command === "codex"
      ? ["exec", "--sandbox", "read-only", "--ask-for-approval", "never", "-"]
      : ["-p"];

    const output = await runCommand(command, args, payload(request));
    return { provider: `cli:${command}`, output };
  }
}

export class ByokStrategy implements ProviderStrategy {
  readonly id = "byok";

  async execute(request: BridgeRequest): Promise<BridgeResponse> {
    if (request.provider.kind !== "byok") throw new Error("BYOK configuration is required.");
    const { endpoint, model, apiKey } = request.provider;
    if (!endpoint.startsWith("https://") || !model || !apiKey) throw new Error("BYOK requires an HTTPS endpoint, model, and API key.");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, input: payload(request) }),
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}.`);
    return { provider: "byok", output: await response.text() };
  }
}

function runCommand(command: "codex" | "claude", args: string[], input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"], shell: false });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => child.kill("SIGTERM"), timeoutMs);
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", () => reject(new Error(`${command} is not installed or could not start.`)));
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(`${command} exited with code ${code}. ${stderr.trim()}`));
      resolve(stdout.trim());
    });
    child.stdin.end(input);
  });
}

export function strategyFor(request: BridgeRequest): ProviderStrategy {
  if (request.provider.kind === "fake") return new FakeStrategy();
  if (request.provider.kind === "cli") return new CliStrategy();
  return new ByokStrategy();
}
