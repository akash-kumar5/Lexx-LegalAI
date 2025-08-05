const paymentReminderExample = `
Date: {{date}}
Ref. No.: {{refNo}}

From:
{{lawyerName}}
{{lawyerAddress}}
{{lawyerPhone}}
{{lawyerEmail}}

To:
{{recipientName}}
{{recipientAddress}}

Subject: Legal Notice for recovery of outstanding payment of ₹{{amount}}/- due towards my client, {{companyName}}.

Dear {{recipientName}} or Sir/Madam,

Under the instructions and on behalf of my client, {{companyName}}, having their registered office/residence at {{yourAddress}} (hereinafter referred to as "my client"), I do hereby serve you with the following legal notice:

That my client is engaged in the business of {{businessDescription}}.

That pursuant to an agreement/order dated {{agreementDate}}, you availed the services of/purchased goods from my client. My client provided you with [Specify the service rendered or goods supplied] (hereinafter "the Services/Goods").

That my client duly performed all their obligations and duties as per the terms of the agreement and to your satisfaction. In lieu of the same, my client raised the following invoice(s):

Invoice Details:
{{invoiceDetails}}

That the total outstanding amount due and payable by you to my client is ₹{{amount}} ([Total Outstanding Amount in Words]).

That despite my client fulfilling their commitments, you have failed, neglected, and/or refused to make the aforesaid payment. My client has sent you numerous reminders through emails, letters, and phone calls dated [Dates of previous communications, if any], but you have failed to clear the outstanding dues, without any valid reason or justification.

Your failure to clear the dues has caused significant financial loss and hardship to my client.

You are hereby called upon to pay my client the total outstanding principal sum of ₹{{amount}} ([Total Outstanding Amount in Words]) within {{days}} days from the receipt of this legal notice.

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
  `;

export default paymentReminderExample;