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

  // Detect theme (using Tailwind's dark mode class)
  const isDarkMode = document.documentElement.classList.contains("dark");

  // Colors for themes
  const bgColor = isDarkMode ? "#0c0c0c" : "#ffffff";
  const textColor = isDarkMode ? "#f5f5f5" : "#111111";
  const secondaryText = isDarkMode ? "#a3a3a3" : "#555555";

  // Fill background
  doc.setFillColor(bgColor);
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F");

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor);
  doc.text(title || "Chat Export", margin, y);
  y += 30;

  // Messages
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  messages.forEach((msg) => {
    const senderText = msg.sender ? `${msg.sender}: ` : "";
    const timeText = msg.timestamp ? ` [${msg.timestamp}]` : "";
    const line = `${senderText}${msg.text}${timeText}`;

    const splitLines = doc.splitTextToSize(line, 500);

    splitLines.forEach((l: string) => {
      if (y > 800) {
        doc.addPage();

        // Repaint background on new page
        doc.setFillColor(bgColor);
        doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F");

        y = margin;
      }

      // Sender names darker, timestamps lighter
      if (l.startsWith(senderText)) {
        doc.setTextColor(textColor);
      } else {
        doc.setTextColor(secondaryText);
      }

      doc.text(l, margin, y);
      y += 16;
    });
  });

  // Save PDF
  const fileName = `${title || "chat"}_${new Date()
    .toISOString()
    .split("T")[0]}.pdf`;
  doc.save(fileName);
};
