export type ContextPackage = Record<string, unknown>;

export type ProviderConfig =
  | { kind: "fake" }
  | { kind: "cli"; cli: "codex" | "claude" }
  | { kind: "byok"; endpoint: string; model: string; apiKey: string };

export type BridgeRequest = { task: "evaluate" | "generate"; context: ContextPackage; provider: ProviderConfig };
export type BridgeResponse = { provider: string; output: string; simulated?: boolean };

export interface ProviderStrategy {
  readonly id: ProviderConfig["kind"];
  execute(request: BridgeRequest): Promise<BridgeResponse>;
}
