//  app/docs/draft/[category]/[slug]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // Import Input Component
import { useEffect, useState } from "react";

export default function DraftEditorPage() {
  const params = useParams();
  const slug = params.slug as string;

  const fieldSchema: { [key: string]: { label: string; key: string }[] } = {
    "payment-reminder": [
      { label: "Date", key: "date" },
      { label: "Reference Number", key: "refNo" },
      { label: "Lawyer Name", key: "lawyerName" },
      { label: "Lawyer Address", key: "lawyerAddress" },
      { label: "Recipient Name", key: "recipientName" },
      { label: "Recipient Address", key: "recipientAddress" },
      { label: "Outstanding Amount", key: "amount" },
      { label: "Your Company Name", key: "companyName" },
      { label: "Your Address", key: "yourAddress" },
      { label: "Bank Name", key: "bankName" },
      { label: "Account Holder", key: "accountHolder" },
      { label: "Account Number", key: "accountNumber" },
      { label: "IFSC Code", key: "ifscCode" },
      { label: "Days to Comply", key: "days" },
    ],
    "termination-notice": [
      { label: "To Employee", key: "toEmployee" },
      { label: "From Company", key: "fromCompany" },
      { label: "Reason", key: "reason" },
      { label: "Termination Date", key: "date" },
    ],
    "legal-demand-notice": [
      { label: "To Party", key: "toParty" },
      { label: "From Lawyer", key: "fromLawyer" },
      { label: "Claim Details", key: "claimDetails" },
    ],
  };

  const exampleDrafts: { [key: string]: string } = {
    "payment-reminder": `
  Date: {{date}}
Ref. No.: {{refNo}}

From:
{{lawyerName}}
{{lawyerAddress}}
[Lawyer's/Firm's Phone Number]
[Lawyer's/Firm's Email]

To:
{{recipientName}}
{{recipientAddress}}

Subject: Legal Notice for recovery of outstanding payment of ₹{{amount}}/- due towards my client, {{companyName}}.

Dear [Mr./Ms./Mrs. Recipient's Last Name or Sir/Madam],

Under the instructions and on behalf of my client, {{companyName}}, having their registered office/residence at {{yourAddress}} (hereinafter referred to as "my client"), I do hereby serve you with the following legal notice:

That my client is engaged in the business of [Briefly describe your business, e.g., providing software development services, supplying industrial goods, etc.].

That pursuant to an agreement/order dated [Date of Agreement/Purchase Order], you availed the services of/purchased goods from my client. My client provided you with [Specify the service rendered or goods supplied] (hereinafter "the Services/Goods").

That my client duly performed all their obligations and duties as per the terms of the agreement and to your satisfaction. In lieu of the same, my client raised the following invoice(s):

Invoice No.: [Invoice Number] dated [Date of Invoice] for an amount of ₹[Invoice Amount].

(Add more invoices if applicable)

That the total outstanding amount due and payable by you to my client is ₹{{amount}} ([Total Outstanding Amount in Words]).

That despite my client fulfilling their commitments, you have failed, neglected, and/or refused to make the aforesaid payment. My client has sent you numerous reminders through emails, letters, and phone calls dated [Dates of previous communications, if any], but you have failed to clear the outstanding dues, without any valid reason or justification.

Your failure to clear the dues has caused significant financial loss and hardship to my client.

You are hereby called upon to pay my client the total outstanding principal sum of ₹{{amount}} ([Total Outstanding Amount in Words]) within [Number of Days, e.g., 15 or 30] days from the receipt of this legal notice.

The payment can be made via cheque/demand draft in favour of "{{companyName}}" or via bank transfer to the following account:

Bank Name: {{bankName}}

Account Holder: {{accountHolder}}

Account Number: {{accountNumber}}

IFSC Code: {{ifscCode}}

Kindly note that should you fail to comply with the requisitions made herein within the stipulated period, my client shall be constrained to initiate appropriate legal proceedings against you, both civil and criminal (where applicable), for the recovery of the aforesaid amount along with interest, damages, and costs. In such an event, you shall be solely responsible for all costs and consequences thereof.

A copy of this notice has been retained in my office for record and further action.

Sincerely,

(Signature)

[Name of the Lawyer/Sender]
[Designation, e.g., Advocate]
On behalf of {{companyName}}
  `,
  };

  useEffect(() => {
  const savedDrafts = JSON.parse(localStorage.getItem("savedDrafts") || "[]");
  const existingDraft = savedDrafts.find((draft: any) => draft.slug === slug);

  if (existingDraft) {
    setDraftContent(existingDraft.draftContent);
  } else {
    const example = exampleDrafts[slug];
    if (example) {
      setDraftContent(example);
    }
  }
}, [slug]);


  const [draftContent, setDraftContent] = useState("");
  const currentFields = fieldSchema[slug] || [];
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [manualEdit, setManualEdit] = useState(false);

  const handleGenerateDraft = () => {
    let draft = exampleDrafts[slug]; // The template string you gave me.

    currentFields.forEach((field) => {
      const value = formData[field.key] || "________";
      const placeholder = new RegExp(`{{${field.key}}}`, "g");
      draft = draft.replace(placeholder, value);
    });

    setDraftContent(draft);
  };

  const handleViewExample = () => {
    const example = exampleDrafts[slug];
    if (example) {
      setDraftContent(example);
    }
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
    <div className="flex bg-zinc-950 text-white">
      {/* Left Panel: Inputs & Actions */}
      <div className="w-full md:w-2/5 p-6 border-r border-zinc-800 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 capitalize">
          {slug.replace(/-/g, " ")} Draft
        </h1>

        <div className="grid grid-cols-1 gap-4 mb-8">
          <Button
            onClick={handleGenerateDraft}
            variant="default"
            className="w-full bg-zinc-600 hover:bg-zinc-700"
          >
            Generate Draft
          </Button>
          <Button
            variant="outline"
            className="w-full bg-zinc-800 hover:bg-zinc-700"
          >
            Upload Existing Draft
          </Button>
          <Button
            onClick={handleViewExample}
            variant="outline"
            className="w-full bg-zinc-800 hover:bg-zinc-700"
          >
            View Example
          </Button>
          <Button
            onClick={() => setManualEdit(!manualEdit)}
            variant="outline"
            className="w-full bg-zinc-800 hover:bg-zinc-700"
          >
            {manualEdit ? "Disable Manual Edit" : "Enable Manual Edit"}
          </Button>
        </div>

        {/* Dynamic Form Fields */}
        <Card className="bg-zinc-900 border border-zinc-700 mb-6">
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

        {/* Save / Discard Actions */}
      </div>

      {/* Right Panel: Draft Preview */}
      <div className="hidden md:block w-3/5 p-6 overflow-y-auto">
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
