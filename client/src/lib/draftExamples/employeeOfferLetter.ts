const employmentOfferLetter = `
[Company Letterhead]

Date: {{date}}

To:
{{candidateName}}
{{candidateAddress}}

Subject: Employment Offer

Dear {{candidateName}},

We are pleased to offer you the position of {{jobTitle}} at {{companyName}}. Your skills and experience are an excellent match for our team, and we are excited to have you on board.

Your employment with us will be subject to the following terms and conditions:

1. **Position & Reporting**  
   You will serve as {{jobTitle}}, reporting to {{reportingManager}} or such other person as the Company may designate.

2. **Start Date**  
   Your employment will commence on {{startDate}}.

3. **Compensation**  
   Your annual compensation will be {{annualSalary}} ({{salaryInWords}}) payable in accordance with the Company's standard payroll practices.

4. **Probation Period**  
   You will be on probation for a period of {{probationPeriod}} from your start date. Upon satisfactory completion, your employment will be confirmed in writing.

5. **Benefits**  
   You will be entitled to benefits as per Company policy, including {{benefitsDetails}}.

6. **Work Location**  
   Your primary place of work will be {{workLocation}}. You may be required to travel or relocate as per Company requirements.

7. **Termination**  
   Either party may terminate this agreement by providing {{noticePeriod}} written notice or payment in lieu thereof, subject to applicable laws.

8. **Confidentiality**  
   You shall maintain strict confidentiality of all proprietary and confidential information of the Company during and after your employment.

Please sign and return a copy of this letter as a token of your acceptance of the terms and conditions.

We look forward to working with you.

Sincerely,

For {{companyName}},

(Signature)  
{{authorizedSignatoryName}}  
{{authorizedSignatoryTitle}}

Acknowledged and Accepted by:  
(Signature)  
{{candidateName}}  
Date: ______________________
`;

export default employmentOfferLetter;