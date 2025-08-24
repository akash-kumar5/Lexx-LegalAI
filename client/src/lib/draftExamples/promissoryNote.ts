const promissoryNote = `
Date: {{date}}

To:
{{lenderName}}
[Lender's Address]
[Lender's Contact Information]

From:
{{borrowerName}}
[Borrower's Address]
[Borrower's Contact Information]

Subject: Promissory Note

I, {{borrowerName}}, hereby unconditionally promise to pay {{lenderName}} the principal sum of INR {{loanAmount}}, with an annual interest rate of {{interestRate}}%, on or before {{dueDate}}.  

Details of the loan are as follows:
- Loan Amount: INR {{loanAmount}}
- Interest Rate: {{interestRate}}% per annum
- Repayment Due Date: {{dueDate}}
- Payment Method: {{paymentMethod}}

This Promissory Note is made in good faith and shall be governed by the laws of India.  
In case of default, the lender shall have the right to pursue all legal remedies available.  

Signed on this day, {{date}}.

Sincerely,

(Signature)

{{borrowerName}}  
Borrower
`;

export default promissoryNote;
