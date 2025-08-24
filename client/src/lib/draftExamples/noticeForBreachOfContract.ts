const noticeForBreachOfContract = `
Date: {{date}}

To:
{{recipientName}}
{{recipientAddress}}
[Recipient's Contact Information]

From:
{{senderName}}
{{senderAddress}}
[Sender's Contact Information]

Subject: Notice for Breach of Contract

Dear {{recipientName}},

This notice is being issued to formally notify you of a breach of the contract dated {{contractDate}}, executed between {{senderName}} and {{recipientName}} concerning {{contractSubject}}.  

The specific breaches identified are as follows:  
- {{breachDetails}}

As per the terms of the agreement and applicable law, you are hereby required to remedy the breach within {{remedyPeriod}} days from the receipt of this notice.  

Failure to remedy the breach within the stipulated time will leave us with no option but to pursue appropriate legal remedies, including but not limited to termination of the contract and seeking damages for losses incurred.  

We urge you to treat this matter with utmost seriousness and take immediate corrective action.

Sincerely,

(Signature)

[Authorized Representative / Sender Name]  
{{senderName}}
`;

export default noticeForBreachOfContract;
