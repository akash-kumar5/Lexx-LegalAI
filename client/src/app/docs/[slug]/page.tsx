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
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../../../../context/AuthContext";

export default function DraftEditorPage() {
  const [draftContent, setDraftContent] = useState("");
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [manualEdit, setManualEdit] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [existingTimestamp, setExistingTimestamp] = useState<number | null>(
    null
  );
  const params = useParams();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const token = auth.token;

  const slug = params.slug as string;
  type Draft = {
    id: string; // UUID or timestamp based unique id
    slug: string; // e.g., "payment-reminder"
    draft_content: string;
    formData: { [key: string]: string };
    timestamp: number; // Date.now()
  };

  useEffect(() => {
    const aiGeneratedBody = searchParams.get("body");
    const timestampStr = searchParams.get("timestamp");

    async function loadDraft() {
      try {
        const res = await fetch("http://localhost:8000/drafts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // FIX
          },
        });
        const drafts = await res.json();
        const existingDraft = drafts.find((d: Draft) => d.slug === slug);

        if (existingDraft) {
          setDraftContent(existingDraft.draft_content);
          return;
        }
      } catch (err) {
        console.warn("Falling back to local/example drafts");
      }

      if (aiGeneratedBody) {
        setDraftContent(decodeURIComponent(aiGeneratedBody));
        if (timestampStr) {
          setExistingTimestamp(Number(timestampStr));
        }
        return;
      } else {
        setDraftContent(exampleDrafts[slug] || "");
      }
    }

    loadDraft();
  }, [slug, searchParams]);

  const currentFields = fieldSchema[slug] || [];

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

  useEffect(() => {
    function autoFillDraft(template: string) {
      const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");

      let filledDraft = template;
      Object.keys(profile).forEach((key) => {
        const placeholder = new RegExp(`{{${key}}}`, "g"); // e.g., {{fullName}}
        filledDraft = filledDraft.replace(
          placeholder,
          profile[key] || "________"
        );
      });

      return filledDraft;
    }

    const template = exampleDrafts[slug]; // or your current draft
    const filledDraft = autoFillDraft(template);
    setDraftContent(filledDraft);
  }, [slug]);

  const handleViewExample = () => {
    const template = exampleDrafts[slug];
    const finalDraft = currentFields.reduce((acc, field) => {
      const value = formData[field.key] || "________";
      return acc.replace(new RegExp(`{{${field.key}}}`, "g"), value);
    }, template);

    setDraftContent(finalDraft);
  };

  // Save draft
  const handleSaveDraft = async () => {
    const isUpdating = existingTimestamp !== null;

    try {
      const url = isUpdating
        ? `http://localhost:8000/drafts/${existingTimestamp}`
        : "http://localhost:8000/drafts";

      const method = isUpdating ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug,
          draft_content: draftContent,
          timestamp: existingTimestamp || Date.now(),
        }),
        credentials: "include", // so JWT cookie works
      });

      if (!res.ok)
        throw new Error(`Failed to ${isUpdating ? "Update" : "Save"} draft.`);

      alert(`Draft ${isUpdating ? "Updated" : "Saved"}!`);
    } catch (err) {
      console.error(err);
      alert(`Could not ${isUpdating ? "update" : "save"} draft`);
    }
  };

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard your changes?")) {
      setDraftContent("");
      setFormData({});
    }
  };

 return (
  <div
    className={`
      flex flex-col md:flex-row pt-20
      text-zinc-900 dark:text-white
      bg-gradient-to-b from-white via-zinc-100 to-white
      dark:bg-gradient-to-b dark:from-zinc-950 dark:via-zinc-900 dark:to-black
    `}
  >
    {/* Left Panel: Inputs & Actions */}
    <div className="w-full md:w-2/5 p-6 overflow-y-auto border-r border-zinc-300 dark:border-zinc-800">
      <h1 className="text-3xl font-bold mb-6 capitalize">
        {slug.replace(/-/g, " ")} Draft
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button
          onClick={handleGenerateDraft}
          variant="default"
          className="
            w-full sm:w-1/2 sm:p-1
            bg-zinc-800 text-white hover:bg-zinc-700
            dark:bg-zinc-700 dark:hover:bg-zinc-600
          "
        >
          Download Draft
        </Button>
        <Button
          onClick={handleViewExample}
          variant="outline"
          className="
            w-full sm:w-1/2 sm:px-1
            border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-900
            dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white
          "
        >
          Load Sample Format
        </Button>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-[80%] h-[80%] rounded-lg flex flex-col overflow-auto
                          bg-white text-zinc-900
                          dark:bg-zinc-950 dark:text-zinc-100">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Draft Preview</h2>

              <pre
                className="
                  whitespace-pre-wrap text-sm flex-1 overflow-y-auto rounded p-4
                  bg-zinc-50 border border-zinc-200
                  dark:bg-zinc-900 dark:border-zinc-700
                "
              >
                {draftContent}
              </pre>

              {/* Actions at bottom-right */}
              <div className="mt-4 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                  className="border-zinc-300 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
                >
                  Cancel
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                      Download
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700"
                  >
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
        </div>
      )}

      {/* Dynamic Form Fields */}
      <Card className="mb-6 hidden md:block bg-white border border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700">
        <CardContent className="p-4 space-y-4 text-zinc-700 dark:text-zinc-300">
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
              className="
                bg-white text-zinc-900 border border-zinc-300 placeholder:text-zinc-400
                focus-visible:ring-2 focus-visible:ring-zinc-400/50
                dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-700 dark:placeholder:text-zinc-500
                dark:focus-visible:ring-stone-600/60
              "
            />
          ))}
        </CardContent>
      </Card>
    </div>

    {/* Right Panel: Draft Preview */}
    <div className="w-full md:w-3/5 p-6 sm:pt-0 lg:pt-6 overflow-y-auto">
      <Card className="h-full bg-white border border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700">
        <CardContent className="h-full">
          <Textarea
            placeholder={`Start drafting your ${slug.replace(/-/g, " ")} here...`}
            value={draftContent}
            readOnly={!manualEdit}
            onChange={(e) => manualEdit && setDraftContent(e.target.value)}
            className={`
              w-full h-full resize-none p-4 border-0 focus:ring-0 focus-visible:ring-0
              bg-white text-zinc-900
              dark:bg-zinc-900 dark:text-white
              ${!manualEdit ? "cursor-default text-zinc-800 dark:text-zinc-400" : ""}
            `}
          />
          <div className="fixed lg:right-20 lg:top-37 sm:absolute sm:top-75 sm:right-20 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setManualEdit(!manualEdit)}
              className="
                border border-zinc-300 text-zinc-700 hover:bg-zinc-200
                dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700
                rounded-full
              "
              title={manualEdit ? "Lock (stop manual edit)" : "Unlock (enable manual edit)"}
            >
              {manualEdit ? <PencilIcon /> : <LockIcon />}
            </Button>
          </div>
        </CardContent>

        <hr className="my-1 w-[32%] mx-[62%] border-zinc-300 dark:border-zinc-700 rounded-full" />

        <div className="flex justify-end gap-3 me-3 pb-4">
          <Button
            variant="default"
            className="bg-red-700 hover:bg-red-600 text-white"
            onClick={handleDiscard}
          >
            Discard
          </Button>
          <Button
            variant="default"
            className="bg-emerald-700 hover:bg-emerald-600 text-white"
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