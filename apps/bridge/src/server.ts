import { createServer } from "node:http";
import { strategyFor } from "./strategies.js";
import type { BridgeRequest } from "./types.js";

const host = "127.0.0.1";
const port = Number(process.env.TAILOR_MATCH_BRIDGE_PORT ?? 4317);
const maxBodyBytes = 512 * 1024;

function isRequest(value: unknown): value is BridgeRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<BridgeRequest>;
  return (request.task === "evaluate" || request.task === "generate") && !!request.context && typeof request.context === "object" && !!request.provider && typeof request.provider === "object" && ["fake", "cli", "byok"].includes((request.provider as { kind?: string }).kind ?? "");
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
      reply(response, 200, result);
    } catch (error) {
      reply(response, 502, { error: error instanceof Error ? error.message : "Bridge request failed" });
    }
  });
}).listen(port, host, () => console.log(`Tailor Match bridge listening on http://${host}:${port}`));
