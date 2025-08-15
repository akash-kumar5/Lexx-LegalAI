const leaseAgreement = `
LEASE AGREEMENT

This Lease Agreement ("Agreement") is made and entered into on {{agreementDate}}, by and between:

**Lessor (Landlord):**  
{{lessorName}}  
{{lessorAddress}}

**Lessee (Tenant):**  
{{lesseeName}}  
{{lesseeAddress}}

**Property Address:**  
{{propertyAddress}}

1. **Term of Lease**  
   The term of this lease shall commence on {{leaseStartDate}} and shall continue until {{leaseEndDate}}, unless terminated earlier in accordance with this Agreement.

2. **Rent**  
   The Lessee agrees to pay rent of {{monthlyRent}} per month, payable on or before the {{rentDueDate}} day of each month, to the Lessor at {{rentPaymentAddress}} or such other place as the Lessor may designate.

3. **Security Deposit**  
   The Lessee shall pay a security deposit of {{securityDepositAmount}} prior to taking possession of the Property. The deposit will be returned upon termination of the lease, subject to deductions for damages, unpaid rent, or other charges.

4. **Use of Property**  
   The Lessee shall use the Property solely for residential purposes and shall not sublet or assign the Property without the Lessor’s prior written consent.

5. **Maintenance and Repairs**  
   The Lessee shall keep the Property clean and in good condition and shall promptly notify the Lessor of any damage or need for repair. The Lessor shall be responsible for major repairs unless caused by the Lessee's negligence.

6. **Utilities**  
   The Lessee shall be responsible for payment of all utilities and services for the Property, except {{utilitiesProvidedByLessor}}.

7. **Termination**  
   Either party may terminate this Agreement by giving {{terminationNoticePeriod}} written notice, subject to applicable laws.

8. **Governing Law**  
   This Agreement shall be governed by the laws of {{jurisdiction}}.

IN WITNESS WHEREOF, the parties have executed this Lease Agreement on the date first above written.

**Lessor:**  
Name: {{lessorName}}  
Signature: ______________________  
Date: ___________________________

**Lessee:**  
Name: {{lesseeName}}  
Signature: ______________________  
Date: ___________________________
`;

export default leaseAgreement;