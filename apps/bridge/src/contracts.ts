import type { BridgeRequest, GeneratedDocuments, MatchEvaluation } from "./types.js";

const classifications = ["Suitable", "Borderline", "Not suitable"] as const;
const levels = ["Atenção", "Confirmar", "Bloqueador"] as const;

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function score(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function parseOutput(output: string): unknown {
  const source = output.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(source);
  } catch {
    throw new Error("O provedor não retornou JSON válido. Ajuste o modelo ou tente novamente.");
  }
}

export function validateEvaluation(value: unknown): MatchEvaluation {
  if (!record(value) || !score(value.score) || !classifications.includes(value.classification as MatchEvaluation["classification"]) || !text(value.summary)) {
    throw new Error("A avaliação retornada não segue o contrato esperado.");
  }
  if (!Array.isArray(value.radar) || value.radar.length < 3 || !value.radar.every((item) => record(item) && text(item.label) && score(item.candidate) && score(item.role))) {
    throw new Error("A avaliação não contém um radar de competências válido.");
  }
  if (!Array.isArray(value.strengths) || !value.strengths.every((item) => record(item) && text(item.title) && text(item.evidence))) {
    throw new Error("A avaliação não contém evidências de pontos fortes válidas.");
  }
  if (!Array.isArray(value.gaps) || !value.gaps.every((item) => record(item) && text(item.title) && text(item.detail) && levels.includes(item.level as MatchEvaluation["gaps"][number]["level"]))) {
    throw new Error("A avaliação não contém gaps válidos.");
  }
  return value as MatchEvaluation;
}

export function validateDocuments(value: unknown): GeneratedDocuments {
  if (!record(value) || !record(value.cv) || !text(value.cv.filename) || !text(value.cv.content)) {
    throw new Error("A geração não contém um CV válido.");
  }
  if (value.coverLetter !== undefined && value.coverLetter !== null && (!record(value.coverLetter) || !text(value.coverLetter.filename) || !text(value.coverLetter.content))) {
    throw new Error("A cover letter retornada é inválida.");
  }
  return value as GeneratedDocuments;
}

export function validateOutput(request: BridgeRequest, output: string): MatchEvaluation | GeneratedDocuments {
  const parsed = parseOutput(output);
  return request.task === "evaluate" ? validateEvaluation(parsed) : validateDocuments(parsed);
}
