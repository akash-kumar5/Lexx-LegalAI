const loanAgreement = `
LOAN AGREEMENT

This Loan Agreement ("Agreement") is made on {{agreementDate}}, by and between:

**Lender:**  
{{lenderName}}  
{{lenderAddress}}

**Borrower:**  
{{borrowerName}}  
{{borrowerAddress}}

1. **Loan Amount & Disbursement**  
   The Lender agrees to lend the Borrower the sum of {{loanAmount}} ({{loanAmountInWords}}), which shall be disbursed on {{disbursementDate}} to the Borrower’s account.

2. **Purpose of Loan**  
   The loan shall be used exclusively for {{loanPurpose}}.

3. **Interest Rate**  
   The loan shall bear interest at the rate of {{interestRate}}% per annum, calculated on the outstanding balance.

4. **Repayment Terms**  
   The Borrower agrees to repay the loan in {{numberOfInstallments}} installments of {{installmentAmount}} each, commencing on {{firstRepaymentDate}} and continuing on the {{repaymentFrequency}} basis.

5. **Prepayment**  
   The Borrower may prepay the loan in whole or in part without penalty by giving {{prepaymentNoticePeriod}} written notice to the Lender.

6. **Default**  
   In case of default in repayment or any other breach, the Lender may demand immediate repayment of the entire outstanding loan along with accrued interest.

7. **Security/Collateral**  
   The loan shall be secured by {{collateralDetails}} (if applicable).

8. **Governing Law**  
   This Agreement shall be governed by the laws of {{jurisdiction}}.

IN WITNESS WHEREOF, the parties hereto have executed this Loan Agreement on the date first above written.

**Lender:**  
Name: {{lenderName}}  
Signature: ______________________  
Date: ___________________________

**Borrower:**  
Name: {{borrowerName}}  
Signature: ______________________  
Date: ___________________________
`;

export default loanAgreement;