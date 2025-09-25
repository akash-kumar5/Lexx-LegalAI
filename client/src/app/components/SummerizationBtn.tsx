"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Paperclip, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type SummarizationBtnProps = {
  onUploadSuccess: (chatId: string, fileName: string) => void;
  setAttachedFileName: (name: string | null) => void;
  token: string | null;
};

type PdfTextItem = {
  str: string;
};

type PdfTextContent = {
  items: PdfTextItem[];
};

export default function SummerizationBtn({
  onUploadSuccess,
  setAttachedFileName,
  token,
}: SummarizationBtnProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (!token) {
      window.alert("Authentication failed. Please ensure you are logged in.");
      return;
    }

    if (file.type !== "application/pdf") {
      window.alert("Please upload a valid PDF file.");
      return;
    }

    if (!API_URL) {
      console.error("API base URL is not configured (NEXT_PUBLIC_API_BASE_URL).");
      window.alert("Server configuration error. Contact the administrator.");
      return;
    }

    setIsProcessing(true);
    setAttachedFileName(`Processing ${file.name}...`);

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Load PDF with pdfjs
      const typedArray = new Uint8Array(arrayBuffer);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;

      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = (await page.getTextContent()) as PdfTextContent;
        const pageText = (textContent.items || []).map((item) => item.str).join(" ");
        if (pageText && pageText.trim()) {
          fullText += pageText + "\n\n";
        }
      }

      fullText = fullText.trim();

      if (!fullText) {
        throw new Error("Could not extract any text from the PDF.");
      }

      // Call backend with extracted text
      const resp = await fetch(`${API_URL}/api/process-file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: fullText }),
      });

      // parse json safely
      let data: unknown = null;
      try {
        data = await resp.json();
      } catch (err) {
        console.error("Failed to parse JSON response from /api/process-file", err);
      }

      if (!resp.ok) {
        const detail =
          data && typeof data === "object" && "detail" in (data as Record<string, unknown>)
            ? String((data as Record<string, unknown>).detail)
            : `Request failed with status ${resp.status}`;
        throw new Error(detail);
      }

      if (data && typeof data === "object") {
        const d = data as Record<string, unknown>;

        if (d.status === "too_long") {
          const tokens = typeof d.tokens === "number" ? d.tokens : "unknown";
          window.alert(`File is too large (${tokens} tokens). Redirecting to the summarization page.`);
          window.location.href = "/docs/summarize";
          return;
        }

        if (d.status === "ok" && typeof d.chat_id === "string") {
          onUploadSuccess(d.chat_id, file.name);
          return;
        }

        console.warn("Unexpected response shape from process-file:", d);
        window.alert("File processed but server returned unexpected response. Check logs.");
        return;
      }

      throw new Error("Unexpected empty response from server.");
    } catch (err) {
      console.error("Error processing uploaded file:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred while processing the file.";
      window.alert(message);
      setAttachedFileName(null);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        try {
          fileInputRef.current.value = "";
        } catch (e) {
          // ignore
        }
      }
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileUpload}
          disabled={isProcessing}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="icon"
              className={`
                rounded-full
                transition-all duration-300
                /* Light mode */
                border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50
                /* Dark mode */
                dark:border-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-700/80 dark:hover:text-white
                disabled:opacity-60 disabled:cursor-not-allowed
              `}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400 dark:text-zinc-300" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
              <span className="sr-only">Attach PDF</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className={`
              border
              /* Light */
              border-zinc-200 bg-white text-zinc-800
              /* Dark */
              dark:border-stone-700 dark:bg-zinc-900 dark:text-zinc-100
            `}
          >
            <p>Attach PDF</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
