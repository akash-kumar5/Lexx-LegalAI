"use client";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "@radix-ui/react-icons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {Spinner} from "@heroui/spinner";


export default function SummarizePage() {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const summaryRef = useRef<HTMLTextAreaElement | null>(null);


  useEffect(() => {
  if (summaryRef.current) {
    summaryRef.current.scrollTop = summaryRef.current.scrollHeight;
  }
}, [summary]); 

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
      const res = await fetch("http://localhost:8000/extract-text", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.content?.trim()) {
        setInputText(data.content);
        setFileName(file.name);
      } else {
        alert("No text found in the uploaded file.");
      }
    } catch (error) {
      console.error("File extraction failed", error);
      alert("Failed to extract text. Please try again.");
    } finally {
      setUploading(false);
    }
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: inputText }),
      });

      const data = await res.json();
      console.log("summary data", data);
      setSummary(data.summary);
    } catch (error) {
      console.error("Summarization failed", error);
      alert("Failed to summarize. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("summary-content");
    if (!element) return;

    if (element) {
      element.style.backgroundColor = "#18181b"; // equivalent of bg-zinc-900
      element.style.color = "#ffffff"; // text-white
    }

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("summary.pdf");
    } catch (error) {
      console.error("PDF Generation Error:", error);
    }
  };

  const handleRemoveFile = () => {
    setFileName(null);
    setInputText("");
  };

  const handleReset = () => {
    setInputText("");
    setSummary("");
    setFileName(null);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white">Summarize Document</h1>
      <p className="italic mt-2">
        Get summary of lengthy legal texts in seconds...
      </p>

      <hr className="mb-6 mt-2 w-[30%] " />

      {/* Upload Section (only if no summary yet) */}
      {!summary && (
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-full cursor-pointer">
              <UploadIcon />
              Upload File
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            {fileName ? (
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 p-2  text-sm">
                  Uploaded: {fileName}
                </span>
                <button
                  onClick={handleRemoveFile}
                  className="text-red-500 text-xs underline hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ) : (
              <span className="text-zinc-400 text-sm italic">
                or paste text below
              </span>
            )}
          </div>

          {uploading && (
  <div className="text-zinc-400 text-sm italic"><Spinner className="secondary"/>Extracting text...</div>
)}


          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your text here..."
            rows={8}
            className="bg-zinc-900 text-white border border-zinc-700"
          />
        </div>
      )}

      {/* Summarize Button */}
      {!summary && (
        <Button
          onClick={handleSummarize}
          disabled={loading || uploading || !inputText.trim()}
          className="bg-red-600 hover:bg-red-700"
        >
          {loading ?  "Summarizing..." : "Summarize"}
          {loading ? <Spinner className="default"/> : ""}
        </Button>
      )}

      {/* Summary Output */}
      {summary && (
        <div className="mt-6 bg-zinc-900 p-4 rounded-lg border border-zinc-700 text-white">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <Textarea
            value={summary}
            id="summary-content"
            readOnly
            ref={summaryRef}
            className="bg-zinc-800 text-white border-none resize-none"
            rows={30}
          />

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="bg-zinc-800"
            >
              Summarize Another
            </Button>
          </div>
          <Button onClick={handleDownloadPDF} className="mt-4 bg-black border">
            Download PDF
          </Button>
        </div>
      )}
    </div>
  );
}
