// consultingAgreement.ts
const consultingAgreement = `
Date: {{agreementDate}}

This Consulting Agreement ("Agreement") is made between:

Client: {{clientName}}
Address: {{clientAddress}}

Consultant: {{consultantName}}
Address: {{consultantAddress}}

1. Scope of Work:
{{scopeOfWork}}

2. Duration:
This Agreement shall commence on {{startDate}} and end on {{endDate}}.

3. Fees:
The Client agrees to pay the Consultant {{feeAmount}} for the services rendered, payable as per the following schedule:
{{paymentSchedule}}

4. Confidentiality:
Both parties agree to maintain confidentiality as per the terms outlined in this Agreement.

5. Termination:
Either party may terminate this Agreement by providing {{terminationNoticePeriod}} notice in writing.

6. Governing Law:
This Agreement shall be governed by the laws of {{jurisdiction}}.

Signed:

Client: ___________________  
Consultant: _______________

`;

export default consultingAgreement;

export const consultingAgreementFields = [
  { label: "Agreement Date", key: "agreementDate" },
  { label: "Client Name", key: "clientName" },
  { label: "Client Address", key: "clientAddress" },
  { label: "Consultant Name", key: "consultantName" },
  { label: "Consultant Address", key: "consultantAddress" },
  { label: "Scope of Work", key: "scopeOfWork" },
  { label: "Start Date", key: "startDate" },
  { label: "End Date", key: "endDate" },
  { label: "Fee Amount", key: "feeAmount" },
  { label: "Payment Schedule", key: "paymentSchedule" },
  { label: "Termination Notice Period", key: "terminationNoticePeriod" },
  { label: "Jurisdiction", key: "jurisdiction" }
];
