const serviceAgreement = `
SERVICE AGREEMENT

This Service Agreement ("Agreement") is made on {{agreementDate}}, by and between:

**Client:**  
{{clientName}}  
{{clientAddress}}

**Service Provider:**  
{{serviceProviderName}}  
{{serviceProviderAddress}}

1. **Services**  
   The Service Provider agrees to perform the following services for the Client: {{serviceDescription}}.

2. **Term**  
   This Agreement shall commence on {{startDate}} and remain in effect until {{endDate}} unless terminated earlier in accordance with this Agreement.

3. **Compensation**  
   The Client agrees to pay the Service Provider {{serviceFeeAmount}} ({{serviceFeeInWords}}) for the services described above, payable {{paymentSchedule}}.

4. **Expenses**  
   The Service Provider shall be responsible for all expenses incurred in connection with performing the services, except for the following, which shall be reimbursed by the Client: {{reimbursableExpenses}}.

5. **Confidentiality**  
   Both parties agree to maintain the confidentiality of all non-public information obtained during the term of this Agreement.

6. **Intellectual Property**  
   Any work product created under this Agreement shall be owned by {{ownershipClause}}.

7. **Termination**  
   Either party may terminate this Agreement by giving {{terminationNoticePeriod}} written notice.

8. **Governing Law**  
   This Agreement shall be governed by the laws of {{jurisdiction}}.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.

**Client:**  
Name: {{clientName}}  
Signature: ______________________  
Date: ___________________________

**Service Provider:**  
Name: {{serviceProviderName}}  
Signature: ______________________  
Date: ___________________________
`;

export default serviceAgreement;