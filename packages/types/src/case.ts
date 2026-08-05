export interface CaseData {
  id: string;
  natureId: string;
  nature?: { id: string; name: string; nepaliName?: string | null };
  facts: string | null;
  status: string;
  parties?: { id?: string; partyName: string; roleId: string; citizenshipNo?: string; permanentAddress?: string; temporaryAddress?: string; contactNo?: string; waris?: any }[];
  referredThrough?: string | null;
  lawyers?: any[];
  courtDetails?: CaseCourtDetailData[];
  // Omitting relations for brevity in the list view
}

export interface CaseCourtDetailData {
  id?: string;
  caseName: string;
  caseNumber: string;
  registrationDate: string | null;
  sectionCourtRoom: string | null;
  parentId?: string | null;
  isActive?: boolean;
}
