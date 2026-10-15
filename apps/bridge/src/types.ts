export type ContextPackage = Record<string, unknown>;
export type OutputLanguage = "pt-BR" | "en-US";

export type MatchEvaluation = {
  score: number;
  classification: "Suitable" | "Borderline" | "Not suitable";
  summary: string;
  radar: Array<{ label: string; candidate: number; role: number }>;
  strengths: Array<{ title: string; evidence: string }>;
  gaps: Array<{ title: string; detail: string; level: "Atenção" | "Confirmar" | "Bloqueador" }>;
};

export type GeneratedDocuments = {
  cv: { filename: string; content: string };
  coverLetter?: { filename: string; content: string };
};

export type ProviderConfig =
  | { kind: "fake" }
  | { kind: "cli"; cli: "codex" | "claude" }
  | { kind: "byok"; endpoint: string; model: string; apiKey: string };

export type BridgeRequest = {
  task: "evaluate" | "generate";
  context: ContextPackage;
  provider: ProviderConfig;
  options?: { language: OutputLanguage; additionalInstructions?: string; coverLetter?: boolean };
};
export type BridgeResponse = { provider: string; output: string; simulated?: boolean };

export interface ProviderStrategy {
  readonly id: ProviderConfig["kind"];
  execute(request: BridgeRequest): Promise<BridgeResponse>;
}
