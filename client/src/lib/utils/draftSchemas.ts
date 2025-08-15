import employmentOfferLetter from "../draftExamples/employeeOfferLetter";
import invoiceForServices from "../draftExamples/invoiceForService";
import leaseAgreement from "../draftExamples/leaseAgreement";
import legalDemandNotice from "../draftExamples/legalDemandNotice";
import loanAgreement from "../draftExamples/loanAgreement";
import nonDisclosureAgreement from "../draftExamples/nonDisclosureAgreement";
import paymentReminderExample from "../draftExamples/paymentReminder";
import serviceAgreement from "../draftExamples/serviceAgreement";
import terminationNotice from "../draftExamples/terminationNotice";

  export const fieldSchema: { [key: string]: { label: string; key: string }[] } = {
    "payment-reminder": [
      { label: "Date", key: "date" },
      { label: "Reference Number", key: "refNo" },
      { label: "Lawyer Name", key: "lawyerName" },
      { label: "Lawyer Address", key: "lawyerAddress" },
      { label: "Lawyer Phone", key: "lawyerPhone" },
      { label: "Lawyer Email", key: "lawyerEmail" },
      { label: "Recipient Name", key: "recipientName" },
      { label: "Recipient Address", key: "recipientAddress" },
      { label: "Outstanding Amount", key: "amount" },
      { label: "Your Company Name", key: "companyName" },
      { label: "Business Description", key: "businessDescription" },
      { label: "Agreement Date", key: "agreementDate" },
      { label: "Invoice Details", key: "invoiceDetails" },
      { label: "Your Address", key: "yourAddress" },
      { label: "Bank Name", key: "bankName" },
      { label: "Account Holder", key: "accountHolder" },
      { label: "Account Number", key: "accountNumber" },
      { label: "IFSC Code", key: "ifscCode" },
      { label: "Days to Comply", key: "days" },
    ],
    "termination-notice": [
      { label: "To Employee", key: "toEmployee" },
      { label: "From Company", key: "fromCompanpay" },
      { label: "Reason", key: "reason" },
      { label: "Termination Date", key: "date" },
    ],
    "legal-demand-notice": [
      { label: "To Party", key: "toParty" },
      { label: "From Lawyer", key: "fromLawyer" },
      { label: "Claim Details", key: "claimDetails" },
    ],
    "non-disclosure-agreement":[
      { label: "Effective Date", key: "effectiveDate" },
  { label: "Disclosing Party Name", key: "disclosingPartyName" },
  { label: "Disclosing Party Address", key: "disclosingPartyAddress" },
  { label: "Disclosing Party Title", key: "disclosingPartyTitle" },
  { label: "Receiving Party Name", key: "receivingPartyName" },
  { label: "Receiving Party Address", key: "receivingPartyAddress" },
  { label: "Receiving Party Title", key: "receivingPartyTitle" },
  { label: "Purpose", key: "purpose" },
  { label: "Duration", key: "duration" },
  { label: "Jurisdiction", key: "jurisdiction" }
    ],
    "employee-offer-letter":[
  { label: "Date", key: "date" },
  { label: "Candidate Name", key: "candidateName" },
  { label: "Candidate Address", key: "candidateAddress" },
  { label: "Job Title", key: "jobTitle" },
  { label: "Company Name", key: "companyName" },
  { label: "Reporting Manager", key: "reportingManager" },
  { label: "Start Date", key: "startDate" },
  { label: "Annual Salary", key: "annualSalary" },
  { label: "Salary in Words", key: "salaryInWords" },
  { label: "Probation Period", key: "probationPeriod" },
  { label: "Benefits Details", key: "benefitsDetails" },
  { label: "Work Location", key: "workLocation" },
  { label: "Notice Period", key: "noticePeriod" },
  { label: "Authorized Signatory Name", key: "authorizedSignatoryName" },
  { label: "Authorized Signatory Title", key: "authorizedSignatoryTitle" }
],
"lease-agreement":[
  { label: "Agreement Date", key: "agreementDate" },
  { label: "Lessor Name", key: "lessorName" },
  { label: "Lessor Address", key: "lessorAddress" },
  { label: "Lessee Name", key: "lesseeName" },
  { label: "Lessee Address", key: "lesseeAddress" },
  { label: "Property Address", key: "propertyAddress" },
  { label: "Lease Start Date", key: "leaseStartDate" },
  { label: "Lease End Date", key: "leaseEndDate" },
  { label: "Monthly Rent", key: "monthlyRent" },
  { label: "Rent Due Date", key: "rentDueDate" },
  { label: "Rent Payment Address", key: "rentPaymentAddress" },
  { label: "Security Deposit Amount", key: "securityDepositAmount" },
  { label: "Utilities Provided by Lessor", key: "utilitiesProvidedByLessor" },
  { label: "Termination Notice Period", key: "terminationNoticePeriod" },
  { label: "Jurisdiction", key: "jurisdiction" }
],
  "service-agreement":[
  { label: "Agreement Date", key: "agreementDate" },
  { label: "Client Name", key: "clientName" },
  { label: "Client Address", key: "clientAddress" },
  { label: "Service Provider Name", key: "serviceProviderName" },
  { label: "Service Provider Address", key: "serviceProviderAddress" },
  { label: "Service Description", key: "serviceDescription" },
  { label: "Start Date", key: "startDate" },
  { label: "End Date", key: "endDate" },
  { label: "Service Fee Amount", key: "serviceFeeAmount" },
  { label: "Service Fee in Words", key: "serviceFeeInWords" },
  { label: "Payment Schedule", key: "paymentSchedule" },
  { label: "Reimbursable Expenses", key: "reimbursableExpenses" },
  { label: "Ownership Clause", key: "ownershipClause" },
  { label: "Termination Notice Period", key: "terminationNoticePeriod" },
  { label: "Jurisdiction", key: "jurisdiction" }
],
"invoice-for-service":[
  { label: "Invoice Number", key: "invoiceNumber" },
  { label: "Invoice Date", key: "invoiceDate" },
  { label: "Service Provider Name", key: "serviceProviderName" },
  { label: "Service Provider Address", key: "serviceProviderAddress" },
  { label: "Service Provider Contact", key: "serviceProviderContact" },
  { label: "Client Name", key: "clientName" },
  { label: "Client Address", key: "clientAddress" },
  { label: "Client Contact", key: "clientContact" },
  { label: "Service Description", key: "serviceDescription" },
  { label: "Service Start Date", key: "serviceStartDate" },
  { label: "Service End Date", key: "serviceEndDate" },
  { label: "Service Fee Amount", key: "serviceFeeAmount" },
  { label: "Tax Amount", key: "taxAmount" },
  { label: "Other Charges", key: "otherCharges" },
  { label: "Total Amount", key: "totalAmount" },
  { label: "Payment Terms", key: "paymentTerms" },
  { label: "Payment Due Date", key: "paymentDueDate" },
  { label: "Payment Methods", key: "paymentMethods" },
  { label: "Account Name", key: "accountName" },
  { label: "Bank Name", key: "bankName" },
  { label: "Account Number", key: "accountNumber" },
  { label: "IFSC or SWIFT Code", key: "ifscOrSwiftCode" }
],
"loan-agreement": [
  { label: "Agreement Date", key: "agreementDate" },
  { label: "Lender Name", key: "lenderName" },
  { label: "Lender Address", key: "lenderAddress" },
  { label: "Borrower Name", key: "borrowerName" },
  { label: "Borrower Address", key: "borrowerAddress" },
  { label: "Loan Amount", key: "loanAmount" },
  { label: "Loan Amount in Words", key: "loanAmountInWords" },
  { label: "Disbursement Date", key: "disbursementDate" },
  { label: "Loan Purpose", key: "loanPurpose" },
  { label: "Interest Rate (%)", key: "interestRate" },
  { label: "Number of Installments", key: "numberOfInstallments" },
  { label: "Installment Amount", key: "installmentAmount" },
  { label: "First Repayment Date", key: "firstRepaymentDate" },
  { label: "Repayment Frequency", key: "repaymentFrequency" },
  { label: "Prepayment Notice Period", key: "prepaymentNoticePeriod" },
  { label: "Collateral Details", key: "collateralDetails" },
  { label: "Jurisdiction", key: "jurisdiction" }
]

  };

  export const exampleDrafts: { [key: string]: string } = {
    "payment-reminder": paymentReminderExample,
    "termination-notice": terminationNotice,
    "legal-demand-notice": legalDemandNotice,
    "non-disclosure-agreement" : nonDisclosureAgreement,
    "employee-offer-letter": employmentOfferLetter,
    "lease-agreement": leaseAgreement,
    "service-agreement": serviceAgreement,
    "invoice-for-service": invoiceForServices,
    "loan-agreement": loanAgreement

  };

  