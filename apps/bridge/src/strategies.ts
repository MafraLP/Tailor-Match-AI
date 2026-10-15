import { spawn } from "node:child_process";
import type { BridgeRequest, BridgeResponse, ProviderStrategy } from "./types.js";
import { buildPrompt } from "./prompts.js";

const timeoutMs = 90_000;

function payload(request: BridgeRequest) {
  return buildPrompt(request);
}

export class FakeStrategy implements ProviderStrategy {
  readonly id = "fake";

  async execute(request: BridgeRequest): Promise<BridgeResponse> {
    return { provider: this.id, simulated: true, output: JSON.stringify(request.task === "evaluate" ? fakeEvaluation(request) : fakeDocuments(request)) };
  }
}

function profile(request: BridgeRequest) {
  const context = request.context.profile as Record<string, unknown> | undefined;
  return {
    name: String(context?.name || "Candidate"),
    headline: String(context?.headline || "Professional"),
    skills: String(context?.skills || "Competências confirmadas"),
    evidence: String(context?.confirmedEvidence || "Evidências confirmadas pelo usuário")
  };
}

function fakeEvaluation(request: BridgeRequest) {
  const candidate = profile(request);
  const evidence = candidate.evidence.slice(0, 180);
  return {
    score: 74,
    classification: "Suitable" as const,
    summary: "Aderência demonstrativa baseada apenas nas evidências confirmadas do perfil. Revise o resultado antes de gerar documentos.",
    radar: [
      { label: "Técnico", candidate: 78, role: 82 }, { label: "Produto", candidate: 72, role: 68 }, { label: "Entrega", candidate: 76, role: 74 }, { label: "Liderança", candidate: 55, role: 62 }, { label: "Domínio", candidate: 60, role: 70 }
    ],
    strengths: [{ title: "Evidência confirmada", evidence }],
    gaps: [{ title: "Requisitos a confirmar", detail: "A estratégia fake não infere requisitos; confira cada obrigatoriedade da vaga antes do envio.", level: "Confirmar" as const }]
  };
}

function fakeDocuments(request: BridgeRequest) {
  const candidate = profile(request);
  const english = request.options?.language === "en-US";
  const cv = [candidate.name, candidate.headline, "", english ? "CONFIRMED SKILLS" : "COMPETÊNCIAS CONFIRMADAS", candidate.skills, "", english ? "CONFIRMED EVIDENCE" : "EVIDÊNCIAS CONFIRMADAS", candidate.evidence].join("\n");
  const coverLetter = [english ? "Dear Hiring Team," : "Prezada equipe de recrutamento,", "", english ? `I am applying for this opportunity based on my confirmed background: ${candidate.evidence}` : `Tenho interesse nesta oportunidade com base no meu histórico confirmado: ${candidate.evidence}`, "", english ? "Sincerely," : "Atenciosamente,", candidate.name].join("\n");
  return { cv: { filename: english ? "tailored-resume.txt" : "cv-direcionado.txt", content: cv }, ...(request.options?.coverLetter ? { coverLetter: { filename: english ? "cover-letter.txt" : "carta-de-apresentacao.txt", content: coverLetter } } : {}) };
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
