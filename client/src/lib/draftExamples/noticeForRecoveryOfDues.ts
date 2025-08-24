const noticeForRecoveryOfDues = `
Date: {{date}}

To:
{{toParty}}
[Recipient's Address]
[Recipient's Contact Information]

From:
{{fromParty}}
[Sender's Address]
[Sender's Contact Information]

Subject: Notice for Recovery of Dues

Dear {{toParty}},

This is to formally notify you that a sum of INR {{amountDue}} is due and payable by you to us in respect of the following:  
- Transaction/Agreement Reference: {{transactionRef}}  
- Date of Transaction/Agreement: {{transactionDate}}  
- Amount Due: INR {{amountDue}}  

Despite previous requests and reminders, the said amount remains outstanding.  

You are hereby called upon to make the payment of the aforesaid amount within {{dueDays}} days from the date of receipt of this notice. Failure to do so will compel us to initiate appropriate legal proceedings for recovery of dues, including but not limited to, interest, costs, and damages, at your risk and expense.  

We trust you will treat this matter with utmost seriousness and take immediate steps to settle the outstanding dues to avoid unnecessary litigation.  

Sincerely,  

(Signature)  

[Authorized Representative Name]  
[Designation]  
{{fromParty}}
`;

export default noticeForRecoveryOfDues;


