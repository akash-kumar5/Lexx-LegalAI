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

// This line is crucial for pdfjs-dist to work.
// It points to the worker script that processes the PDF off the main thread.
// Ensure 'pdfjs-dist' is installed in your project: npm install pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type SummerizationBtnProps = {
  // Callback to inform the parent page that a chat was successfully created.
  onUploadSuccess: (chatId: string, fileName: string) => void;
  // Prop to update the parent's state about the currently attached file name.
  setAttachedFileName: (name: string | null) => void;
  // The auth token is now passed as a prop to remove direct dependencies.
  token: string | null;
  // A key can be used by the parent to force a re-render and reset this component's state.
  key?: any;
};

export default function SummerizationBtn({
  onUploadSuccess,
  setAttachedFileName,
  token, // Receive token as a prop
}: SummerizationBtnProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!token) {
      alert("Authentication failed. Please ensure you are logged in.");
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    setIsProcessing(true);
    setAttachedFileName(`Processing ${file.name}...`);

    try {
      // Step 1: Read and extract text from the PDF on the client-side.
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            throw new Error("Failed to read file buffer.");
          }

          const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let fullText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
          }

          if (!fullText.trim()) {
            throw new Error("Could not extract any text from the PDF.");
          }

          // Step 2: Call your backend to process the extracted text.
          const response = await fetch(`${API_URL}/api/process-file`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text: fullText }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.detail || "API request to process file failed.");
          }

          // Step 3: Handle the API response.
          if (data.status === "too_long") {
            alert(`File is too large (${data.tokens} tokens). Redirecting to the summarization page.`);
            // Using window.location for redirection to avoid Next.js specific dependencies.
            window.location.href = "/docs/summarize";
          } else if (data.status === "ok") {
            // Success! The file is within limits and a new chat was created.
            onUploadSuccess(data.chat_id, file.name);
          }
        } catch (err: any) {
          console.error("Error during file processing:", err);
          alert(err.message || "An unknown error occurred while processing the file.");
          setAttachedFileName(null);
        } finally {
          setIsProcessing(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset to allow re-uploading the same file
          }
        }
      };

      reader.onerror = () => {
        setIsProcessing(false);
        setAttachedFileName(null);
        alert("Error reading the file.");
      };
    } catch (error) {
      console.error("File upload initiation failed:", error);
      alert("Could not start file processing.");
      setAttachedFileName(null);
      setIsProcessing(false);
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
              className="rounded-full border-zinc-600 bg-zinc-800/50 text-zinc-300 transition-all duration-300 hover:border-zinc-500 hover:bg-zinc-700/80 hover:text-white"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
              <span className="sr-only">Attach PDF</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="border-zinc-700 bg-zinc-800 text-white"
          >
            <p>Attach PDF</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

