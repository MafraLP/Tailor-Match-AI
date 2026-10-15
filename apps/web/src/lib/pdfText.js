import * as pdfjs from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const maxFileSize = 10 * 1024 * 1024;

export async function extractPdfText(file) {
  if (!file || (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf"))) {
    throw new Error("Selecione um arquivo PDF.");
  }
  if (file.size > maxFileSize) throw new Error("O PDF deve ter no máximo 10 MB.");

  const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages = await Promise.all(Array.from({ length: document.numPages }, async (_, index) => {
    const content = await (await document.getPage(index + 1)).getTextContent();
    return content.items.map((item) => item.str).join(" ");
  }));
  const text = pages.join("\n\n").replace(/\s+/g, " ").trim();
  if (!text) throw new Error("Não encontramos texto selecionável neste PDF. Cole ou revise o conteúdo manualmente.");
  return { text, pages: document.numPages };
}
