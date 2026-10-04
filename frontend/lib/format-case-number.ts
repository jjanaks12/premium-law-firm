const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function formatCaseNumber(
  caseNumber: string | null | undefined,
  locale: string,
) {
  if (!caseNumber) return "N/A";
  if (locale !== "np") return caseNumber;

  return caseNumber.replace(/\d/g, (digit) => NEPALI_DIGITS[Number(digit)]);
}
