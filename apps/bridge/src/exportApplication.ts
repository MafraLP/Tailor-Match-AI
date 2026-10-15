import { mkdir, writeFile } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";
import type { GeneratedDocuments } from "./types.js";

function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "candidatura";
}

export async function exportApplication(input: { outputDirectory: string; jobTitle: string; documents: GeneratedDocuments; context: unknown; evaluation: unknown }) {
  if (!input.outputDirectory || input.outputDirectory.startsWith("/") || input.outputDirectory.includes("..")) throw new Error("A pasta de exportação deve ser relativa à bridge.");
  const base = resolve(process.cwd(), input.outputDirectory);
  if (relative(process.cwd(), base).startsWith(".." + sep)) throw new Error("Pasta de exportação inválida.");
  const directory = resolve(base, slug(input.jobTitle));
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, input.documents.cv.filename), input.documents.cv.content, "utf8");
  if (input.documents.coverLetter) await writeFile(resolve(directory, input.documents.coverLetter.filename), input.documents.coverLetter.content, "utf8");
  await writeFile(resolve(directory, "match.json"), JSON.stringify(input.evaluation, null, 2), "utf8");
  await writeFile(resolve(directory, "context-review.json"), JSON.stringify(input.context, null, 2), "utf8");
  return { directory };
}
