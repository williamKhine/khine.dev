import { PDFDocument } from "pdf-lib";

export async function applicationPdf(label: string) {
  const document = await PDFDocument.create();
  document.addPage().drawText(label, { x: 40, y: 700, size: 24 });
  const bytes = await document.save();
  return Uint8Array.from(bytes).buffer;
}
