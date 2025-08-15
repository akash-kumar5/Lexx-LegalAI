const invoiceForServices = `
INVOICE FOR SERVICES RENDERED

Invoice Number: {{invoiceNumber}}  
Date of Issue: {{invoiceDate}}

**From (Service Provider):**  
{{serviceProviderName}}  
{{serviceProviderAddress}}  
{{serviceProviderContact}}

**To (Client):**  
{{clientName}}  
{{clientAddress}}  
{{clientContact}}

**Description of Services Provided:**  
{{serviceDescription}}

**Service Period:** {{serviceStartDate}} to {{serviceEndDate}}

**Amount Due:**  
Service Fee: {{serviceFeeAmount}}  
Taxes (if applicable): {{taxAmount}}  
Other Charges: {{otherCharges}}  
**Total Amount Payable:** {{totalAmount}}

**Payment Terms:** {{paymentTerms}}  
**Payment Due Date:** {{paymentDueDate}}  
**Accepted Payment Methods:** {{paymentMethods}}

Please make the payment to the following account:  
Account Name: {{accountName}}  
Bank Name: {{bankName}}  
Account Number: {{accountNumber}}  
IFSC/SWIFT Code: {{ifscOrSwiftCode}}

Thank you for your business.

Sincerely,  
(Signature)  
{{serviceProviderName}}
`;

export default invoiceForServices;