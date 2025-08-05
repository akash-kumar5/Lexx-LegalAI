const legalDemandNotice = `
Date: {{date}}

To:
{{toParty}}
{{recipientAddress}}

From:
{{fromLawyer}}
[Lawyer's Address]
[Lawyer's Contact Information]

Subject: Legal Demand Notice for {{claimDetails}}

Dear {{toParty}},

Under instructions from my client, I am hereby issuing you this legal notice in connection with {{claimDetails}}.

My client has been continuously requesting you to fulfill your obligations, however, despite several reminders, you have failed to comply with the same. This non-compliance has caused my client significant loss and inconvenience.

You are hereby called upon to immediately take necessary steps to resolve the matter within {{days}} days from the receipt of this notice. Failing to do so shall compel my client to initiate appropriate legal proceedings against you at your sole risk, cost, and consequences.

This notice is being sent without prejudice to any other legal rights and remedies available to my client.

A copy of this notice is retained for record and future legal action.

Sincerely,

(Signature)

{{fromLawyer}}
[Designation, e.g., Advocate]
On behalf of [Client Name]
`

export default legalDemandNotice;