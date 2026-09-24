export interface CaseDocumentItem {
  id: string;
  fileName: string;
  documentUrl: string;
  documentType?: string | null;
  description?: string | null;
  createdAt?: string;
  factsOnly?: boolean;
}

// Facts uploaded in the create form are stored on the case, not in CaseDocument.
// Include that existing attachment without creating a duplicate database record.
export function getCaseDocuments(
  caseData: { id: string; facts?: string | null; documents?: CaseDocumentItem[] },
  resolveUrl: (url: string) => string = (url) => url,
): CaseDocumentItem[] {
  const documents = caseData.documents || [];
  const facts = caseData.facts?.trim();
  if (!facts || !/^(\/uploads\/|https?:\/\/)/i.test(facts)) return documents;
  if (documents.some((document) => resolveUrl(document.documentUrl) === resolveUrl(facts))) {
    return documents;
  }

  let pathname: string;
  try { pathname = new URL(facts, "http://localhost").pathname; }
  catch { return documents; }
  let fileName = pathname.split("/").pop() || "Facts document";
  try { fileName = decodeURIComponent(fileName); } catch { /* Keep the stored name. */ }
  return [...documents, {
    id: `facts:${caseData.id}`,
    fileName,
    documentUrl: facts,
    documentType: "Facts",
    factsOnly: true,
  }];
}
