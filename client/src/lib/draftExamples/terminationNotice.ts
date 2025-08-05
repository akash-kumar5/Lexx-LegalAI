const terminationNotice = `
Date: {{date}}

To:
{{toEmployee}}
[Employee's Address]
[Employee's Contact Information]

From:
{{fromCompany}}
[Company's Address]
[Company's Contact Information]

Subject: Termination of Employment

Dear {{toEmployee}},

This letter serves as a formal notice of termination of your employment with {{fromCompany}}, effective from {{date}}.

The reason for termination is as follows:
{{reason}}

Despite prior discussions and warnings, there has been no satisfactory improvement/resolution. As a result, the management has decided to terminate your employment as per the terms and conditions outlined in your employment contract.

Final settlements, including dues, salary, and any other benefits, will be processed as per company policy and applicable labor laws. You are requested to return any company property in your possession, including identification cards, electronic devices, documents, etc., on or before your last working day.

Please acknowledge the receipt of this termination letter and contact the HR department for any clarifications regarding your final settlements.

We wish you the best for your future endeavors.

Sincerely,

(Signature)

[Authorized Signatory Name]
[Designation]
{{fromCompany}}
`;

export default terminationNotice;