const nonDisclosureAgreement = `
NON-DISCLOSURE AGREEMENT (NDA)

This Non-Disclosure Agreement (“Agreement”) is entered into as of {{effectiveDate}} by and between:

Disclosing Party:
{{disclosingPartyName}}
{{disclosingPartyAddress}}

Receiving Party:
{{receivingPartyName}}
{{receivingPartyAddress}}

1. DEFINITIONS
For purposes of this Agreement, “Confidential Information” means all non-public, confidential, or proprietary information disclosed by the Disclosing Party to the Receiving Party, whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information.

2. PURPOSE
The Receiving Party agrees to use the Confidential Information solely for the purpose of {{purpose}} and for no other purpose without prior written consent of the Disclosing Party.

3. CONFIDENTIAL INFORMATION
Confidential Information may include, without limitation, business plans, strategies, financial information, trade secrets, technical data, designs, software, and other proprietary information.

4. EXCLUSIONS FROM CONFIDENTIAL INFORMATION
Confidential Information does not include information that:
a. Is or becomes publicly available without breach of this Agreement;
b. Was known to the Receiving Party prior to disclosure;
c. Is disclosed to the Receiving Party by a third party lawfully; or
d. Is independently developed by the Receiving Party without use of the Confidential Information.

5. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party shall:
a. Maintain the confidentiality of the Confidential Information;
b. Not disclose it to any third party without prior written consent of the Disclosing Party;
c. Use the same degree of care as it uses to protect its own confidential information, but in no event less than reasonable care.

6. TERM
This Agreement shall remain in effect for {{duration}} from the Effective Date unless terminated earlier by mutual written agreement of both parties.

7. RETURN OR DESTRUCTION OF MATERIALS
Upon termination of this Agreement or upon written request by the Disclosing Party, the Receiving Party shall promptly return or destroy all Confidential Information, including copies, in any form.

8. NO LICENSE
Nothing in this Agreement grants the Receiving Party any rights to or under the Confidential Information except as expressly set forth herein.

9. REMEDIES
The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party and that monetary damages may be inadequate. Accordingly, the Disclosing Party shall be entitled to seek injunctive relief in addition to other remedies available at law or equity.

10. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of {{jurisdiction}}, without regard to its conflict of law principles.

11. ENTIRE AGREEMENT
This Agreement constitutes the entire understanding between the parties with respect to the subject matter hereof and supersedes all prior agreements, understandings, and discussions.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the Effective Date.

Disclosing Party:
Name: {{disclosingPartyName}}
Title: {{disclosingPartyTitle}}
Signature: ______________________
Date: ___________________________

Receiving Party:
Name: {{receivingPartyName}}
Title: {{receivingPartyTitle}}
Signature: ______________________
Date: ___________________________
`;

export default nonDisclosureAgreement;