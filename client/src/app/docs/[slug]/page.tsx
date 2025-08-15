//  app/docs/[slug]/page.tsx
"use client";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // Import Input Component
import { useEffect, useState } from "react";
import { LockIcon, PencilIcon } from "lucide-react";
import { exampleDrafts, fieldSchema } from "@/lib/utils/draftSchemas";
import { downloadPDF } from "@/lib/utils/pdfUtils";
import { downloadDOCX } from "@/lib/utils/docxUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DraftEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params.slug as string;
  type Draft = {
    id: string; // UUID or timestamp based unique id
    category: string; // e.g., "notices"
    slug: string; // e.g., "payment-reminder"
    draftContent: string;
    formData: { [key: string]: string };
    timestamp: number; // Date.now()
  };

  useEffect(() => {
    const aiGeneratedBody = searchParams.get("body"); // Read 'body' from URL

    if (aiGeneratedBody) {
      // If AI-generated content exists, use it immediately
      setDraftContent(aiGeneratedBody);
      return; // Stop further processing
    }
    const savedDrafts = JSON.parse(
      localStorage.getItem("savedDrafts") || "[]"
    ) as Draft[];
    const existingDraft = savedDrafts.find(
      (draft: Draft) => draft.slug === slug
    );

    if (existingDraft) {
      setDraftContent(existingDraft.draftContent);
    } else {
      const example = exampleDrafts[slug];
      if (example) {
        setDraftContent(example);
      }
    }
  }, [slug, searchParams]);

  const [draftContent, setDraftContent] = useState("");
  const currentFields = fieldSchema[slug] || [];
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [manualEdit, setManualEdit] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerateDraft = () => {
    if (!draftContent) {
      alert("Draft content is empty!");
      return;
    }

    if (draftContent.includes("________")) {
      alert("Please fill all placeholders before generating PDF.");
      return;
    }
    setShowPreview(true);
  };

  const handleViewExample = () => {
    let draft = exampleDrafts[slug];
    currentFields.forEach((field) => {
      const value = formData[field.key] || "________";
      const placeholder = new RegExp(`{{${field.key}}}`, "g");
      draft = draft.replace(placeholder, value);
    });

    setDraftContent(draft);
  };

  const handleSaveDraft = () => {
    const savedDrafts = JSON.parse(localStorage.getItem("savedDrafts") || "[]");
    savedDrafts.push({
      category: params.category,
      slug,
      draftContent,
      timestamp: Date.now(),
    });
    localStorage.setItem("savedDrafts", JSON.stringify(savedDrafts));
    alert("Draft Saved!");
  };

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard your changes?")) {
      setDraftContent("");
      setFormData({});
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-zinc-950 text-white">
      {/* Left Panel: Inputs & Actions */}
      <div className="w-full md:w-2/5 p-6 border-r border-zinc-800 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 capitalize">
          {slug.replace(/-/g, " ")} Draft
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={handleGenerateDraft}
            variant="default"
            className="w-full sm:w-1/2 bg-zinc-600 hover:bg-zinc-700 sm:p-1"
          >
            Download Draft
          </Button>
          <Button
            onClick={handleViewExample}
            variant="outline"
            className="w-full sm:w-1/2 bg-zinc-800 hover:bg-zinc-700 sm:px-1"
          >
            Load Sample Format
          </Button>
        </div>

        {showPreview && (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
    <div className="bg-white text-black p-6 rounded-lg w-[80%] h-[80%] flex flex-col overflow-auto">
      <h2 className="text-xl font-bold mb-4">Draft Preview</h2>

      <pre className="whitespace-pre-wrap text-sm flex-1 overflow-y-auto border border-gray-200 rounded p-4 bg-gray-50">
        {draftContent}
      </pre>

      {/* Actions at bottom-right */}
      <div className="mt-4 flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => setShowPreview(false)}
          className="border-gray-400"
        >
          Cancel
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="bg-green-700">
              Download
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => downloadPDF(draftContent, slug)}>
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadDOCX(draftContent, slug)}>
              DOCX
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
)}

        {/* Dynamic Form Fields */}
        <Card className="bg-zinc-900 border border-zinc-700 mb-6 hidden md:block">
          <CardContent className="p-4 space-y-4 text-zinc-300">
            {currentFields.map((field) => (
              <Input
                key={field.key}
                placeholder={field.label}
                value={formData[field.key] || ""}
                onChange={(e) => {
                  const updatedFormData = {
                    ...formData,
                    [field.key]: e.target.value,
                  };
                  setFormData(updatedFormData);
                  if (!manualEdit) {
                    let draft = exampleDrafts[slug];
                    currentFields.forEach((field) => {
                      const value = updatedFormData[field.key] || "________";
                      const placeholder = new RegExp(`{{${field.key}}}`, "g");
                      draft = draft.replace(placeholder, value);
                    });
                    setDraftContent(draft);
                  }
                }}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Draft Preview */}
      <div className="w-full md:w-3/5 p-6 sm:pt-0 lg:pt-6 overflow-y-auto">
        <Card className="bg-zinc-900 border border-zinc-700 h-full">
          <CardContent className=" h-full">
            <Textarea
              placeholder={`Start drafting your ${slug.replace(
                /-/g,
                " "
              )} here...`}
              value={draftContent}
              readOnly={!manualEdit}
              onChange={(e) => manualEdit && setDraftContent(e.target.value)}
              className={`w-full h-full resize-none bg-zinc-900 text-white border-none focus:ring-0 focus-visible:ring-0 p-4 ${
                !manualEdit ? "cursor-default text-zinc-400" : "text-white"
              }`}
            />
            <div className="fixed lg:right-20 lg:top-37 sm:absolute sm:top-75 sm:right-20 z-50 sm:z-1 xs:top-12">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setManualEdit(!manualEdit)}
                className="bg-zinc-900 text-light hover:text-black hover:bg-zinc-400 border-zinc-500 border-1"
              >
                {manualEdit ? <PencilIcon /> : <LockIcon />}
              </Button>
            </div>
          </CardContent>
          <hr className="my-1 border-zinc-700 rounded-full w-[32%] mx-[62%]" />
          <div className="flex justify-end gap-3 me-3">
            <Button
              variant="default"
              className="bg-red-800"
              onClick={handleDiscard}
            >
              Discard
            </Button>
            <Button
              variant="default"
              className="bg-green-800"
              onClick={handleSaveDraft}
            >
              Save Draft
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
