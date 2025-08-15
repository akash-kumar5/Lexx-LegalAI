import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";

export async function downloadDOCX(content: string, filename: string) {
  const paragraphs = content.split("\n").map(line => new Paragraph(line));

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}
