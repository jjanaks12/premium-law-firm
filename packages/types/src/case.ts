export interface CaseData {
  id: string;
  natureId: string;
  nature?: { id: string; name: string; nepaliName?: string | null };
  facts: string | null;
  status: string;
  parties?: { id?: string; partyName: string; roleId: string; citizenshipNo?: string; permanentAddress?: string; temporaryAddress?: string; contactNo?: string; waris?: any }[];
  relatedLaw?: any;
  relatedPrecedents?: CasePrecedentData[] | any;
  referredThrough?: string | null;
  lawyers?: any[];
  courtDetails?: CaseCourtDetailData[];
  // Omitting relations for brevity in the list view
}

export interface CasePrecedentData {
  decisionNumber: string;
  parties: string;
  year?: string;
  sequenceNo?: string;
}

export interface CaseCourtDetailData {
  id?: string;
  caseName: string;
  caseNumber: string;
  registrationDate: string | null;
  judgeName?: string | null;
  courtType?: string | null;
  courtName?: string | null;
  sectionCourtRoom: string | null;
  parentId?: string | null;
  isActive?: boolean;
}

export interface PartyRole {
  id: string;
  name: string;
  nepaliName: string | null;
}
