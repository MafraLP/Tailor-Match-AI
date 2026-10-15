import { createServer } from "node:http";
import { strategyFor } from "./strategies.js";
import type { BridgeRequest } from "./types.js";
import { validateOutput } from "./contracts.js";

const host = "127.0.0.1";
const port = Number(process.env.TAILOR_MATCH_BRIDGE_PORT ?? 4317);
const maxBodyBytes = 512 * 1024;

function isRequest(value: unknown): value is BridgeRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<BridgeRequest>;
  if (!(request.task === "evaluate" || request.task === "generate") || !request.context || typeof request.context !== "object" || !request.provider || typeof request.provider !== "object") return false;
  const provider = request.provider as Record<string, unknown>;
  const validProvider = provider.kind === "fake" || (provider.kind === "cli" && (provider.cli === "codex" || provider.cli === "claude")) || (provider.kind === "byok" && typeof provider.endpoint === "string" && typeof provider.model === "string" && typeof provider.apiKey === "string");
  if (!validProvider) return false;
  if (request.task === "evaluate" && request.options !== undefined) return false;
  if (request.task === "generate") {
    const options = request.options as Record<string, unknown> | undefined;
    if (!options || !["pt-BR", "en-US"].includes(String(options.language)) || (options.additionalInstructions !== undefined && typeof options.additionalInstructions !== "string") || (options.coverLetter !== undefined && typeof options.coverLetter !== "boolean")) return false;
  }
  return true;
}

function reply(response: import("node:http").ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type" });
  response.end(JSON.stringify(body));
}

createServer((request, response) => {
  if (request.method === "OPTIONS") return reply(response, 204, {});
  if (request.method !== "POST" || request.url !== "/v1/execute") return reply(response, 404, { error: "Not found" });
  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
    if (body.length > maxBodyBytes) request.destroy();
  });
  request.on("end", async () => {
    try {
      const payload = JSON.parse(body) as unknown;
      if (!isRequest(payload)) return reply(response, 400, { error: "Invalid bridge request" });
      const result = await strategyFor(payload).execute(payload);
      reply(response, 200, { ...result, output: validateOutput(payload, result.output) });
    } catch (error) {
      reply(response, 502, { error: error instanceof Error ? error.message : "Bridge request failed" });
    }
  });
}).listen(port, host, () => console.log(`Tailor Match bridge listening on http://${host}:${port}`));
