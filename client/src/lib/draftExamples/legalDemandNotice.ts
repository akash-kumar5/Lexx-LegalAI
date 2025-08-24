const legalDemandNotice = `
Date: {{date}}

To:
{{toParty}}
[Recipient's Address]
[Recipient's Contact Information]

From:
{{fromParty}}
[Sender's Address]
[Sender's Contact Information]

Subject: Legal Demand Notice

Dear {{toParty}},

This is to formally notify you that despite repeated reminders, the outstanding amount of INR {{amountDue}} remains unpaid as of {{date}}.  

Details of the transaction are as follows:
- Invoice Number: {{invoiceNumber}}
- Invoice Date: {{invoiceDate}}
- Amount Due: INR {{amountDue}}

You are hereby demanded to make the payment of the aforesaid amount within {{dueDays}} days from the date of receipt of this notice, failing which we shall be constrained to initiate appropriate legal proceedings against you at your risk, cost, and consequence.

We sincerely hope that legal recourse will not be necessary and that you will take immediate steps to settle this outstanding amount.

Kindly treat this notice with urgency.

Sincerely,

(Signature)

[Authorized Representative Name]  
[Designation]  
{{fromParty}}
`;

export default legalDemandNotice;
