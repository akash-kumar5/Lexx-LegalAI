// employmentContract.ts
const employmentContract = `
Date: {{agreementDate}}

This Employment Contract ("Contract") is entered into on {{agreementDate}} between:

Employer: {{employerName}}  
Address: {{employerAddress}}  

Employee: {{employeeName}}  
Address: {{employeeAddress}}  

1. Position and Duties:  
The Employee is employed as {{jobTitle}} and shall report to {{reportingManager}}. The Employee agrees to perform all duties and responsibilities reasonably assigned and to comply with company policies and procedures.

2. Commencement:  
The employment will commence on {{startDate}} and shall continue until terminated in accordance with this Contract.

3. Compensation:  
The Employee shall receive an annual salary of {{salaryAmount}}, payable {{paymentFrequency}}. Salary will be subject to statutory deductions and taxes.  

4. Benefits:  
The Employee shall be entitled to the following benefits:  
- {{benefitsDetails}}  
The Employer may modify these benefits as per company policy.  

5. Probation Period:  
The Employee will be on a probation period of {{probationPeriod}}. During this time, either party may terminate this Contract by giving {{probationNoticePeriod}} written notice.  

6. Working Hours and Leave:  
The Employee shall work {{workingHours}} per week. The Employee shall be entitled to {{leaveDays}} paid leave days per year, in accordance with company leave policy.  

7. Confidentiality:  
The Employee agrees to maintain confidentiality of all company information, trade secrets, client lists, intellectual property, and any other proprietary information both during and after employment.  

8. Intellectual Property:  
Any intellectual property, inventions, or work created by the Employee during the course of employment shall be the sole property of the Employer.  

9. Non-Compete and Non-Solicitation:  
For a period of {{nonCompeteDuration}} after termination, the Employee shall not directly compete with the Employer or solicit its clients, customers, or employees.  

10. Termination:  
Employment may be terminated by:  
- The Employer, by giving {{employerNoticePeriod}} notice in writing.  
- The Employee, by giving {{employeeNoticePeriod}} notice in writing.  
The Employer reserves the right to terminate immediately for gross misconduct or breach of this Contract.  

11. Severance:  
Upon termination (other than for cause), the Employee shall receive final dues, including salary, benefits, and any applicable severance as per company policy.  

12. Governing Law and Dispute Resolution:  
This Contract shall be governed by the laws of {{jurisdiction}}. Any disputes shall be resolved by arbitration/mediation in accordance with applicable laws.  

Signed:  

Employer: ___________________  
Name: {{authorizedSignatoryName}}  
Designation: {{authorizedSignatoryTitle}}  

Employee: ___________________  
Name: {{employeeName}}  
`;

export default employmentContract;


