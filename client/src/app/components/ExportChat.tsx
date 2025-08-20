import jsPDF from "jspdf";

interface ChatMessage {
  sender?: string;
  text: string;
  timestamp?: string;
}

export const exportChatToPDF = (title: string, messages: ChatMessage[]) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const margin = 40;
  let y = margin;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title || "Chat Export", margin, y);
  y += 30;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  messages.forEach((msg) => {
    const senderText = msg.sender ? `${msg.sender}: ` : "";
    const timeText = msg.timestamp ? ` [${msg.timestamp}]` : "";
    const line = `${senderText}${msg.text}${timeText}`;

    const splitLines = doc.splitTextToSize(line, 500); // wrap text within page width
    splitLines.forEach((l) => {
      if (y > 800) { // start new page if needed
        doc.addPage();
        y = margin;
      }
      doc.text(l, margin, y);
      y += 16;
    });
  });

  // Save PDF
  const fileName = `${title || "chat"}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
