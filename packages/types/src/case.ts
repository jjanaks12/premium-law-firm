export interface CaseData {
  id: string;
  caseNumber: string;
  caseName: string;
  natureId: string;
  nature?: { id: string; name: string };
  registrationDate: string | null;
  facts: string | null;
  status: string;
  parties?: { id?: string; partyName: string; roleId: string; citizenshipNo?: string; permanentAddress?: string; temporaryAddress?: string; contactNo?: string; waris?: any }[];
  referredThrough?: string | null;
  lawyers?: any[];
  sectionCourtRoom?: string | null;
  // Omitting relations for brevity in the list view
}
