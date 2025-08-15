import { jsPDF } from "jspdf";

export function downloadPDF(content: string, filename: string) {
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(content, 180);
  doc.setFont("Times", "Normal");
  doc.setFontSize(12);
  doc.text(lines, 15, 20);
  doc.save(filename);
}
