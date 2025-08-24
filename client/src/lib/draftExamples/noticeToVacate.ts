const noticeToVacate = `
Date: {{date}}

To:
{{tenantName}}
{{tenantAddress}}
[Tenant's Contact Information]

From:
{{landlordName}}
{{landlordAddress}}
[Landlord's Contact Information]

Subject: Notice to Vacate / Eviction Notice

Dear {{tenantName}},

This notice is to formally inform you that you are required to vacate the premises located at {{propertyAddress}} on or before {{vacateDate}}.  

The reasons for this notice are as follows:
- {{reasonForEviction}}

You are hereby given {{noticePeriod}} days' notice in accordance with the applicable tenancy laws and the terms of your rental/lease agreement.  

Failure to vacate the premises within the stipulated time may compel us to initiate appropriate legal proceedings to recover possession, along with any dues or damages, at your risk and cost.  

We sincerely hope you will comply with this notice and vacate the premises peacefully within the given time.

Sincerely,

(Signature)

[Authorized Representative / Landlord Name]  
{{landlordName}}
`;

export default noticeToVacate;

