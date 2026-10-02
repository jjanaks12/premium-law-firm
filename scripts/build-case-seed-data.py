from __future__ import annotations

import argparse
import hashlib
import json
import re
import unicodedata
import uuid
from pathlib import Path

import openpyxl


NEPALI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")
ZERO_WIDTH = re.compile(r"[\u200b-\u200f\u202a-\u202e\u2060\ufeff]")
SPACE = re.compile(r"\s+")
CASE_NUMBER_SEPARATOR = re.compile(r"\s*[,;।]+\s*")
NAMESPACE = uuid.UUID("8f486b80-f296-5d69-a8a9-99d37838e612")


def clean(value: object) -> str | None:
    if value is None:
        return None
    text = unicodedata.normalize("NFC", str(value))
    text = ZERO_WIDTH.sub("", text)
    text = SPACE.sub(" ", text).strip(" ,")
    return text or None


def ascii_digits(value: str | None) -> str | None:
    return value.translate(NEPALI_DIGITS) if value else None


def normalize_case_number(value: str | None) -> str | None:
    value = ascii_digits(clean(value))
    if not value:
        return None
    parts = []
    for part in CASE_NUMBER_SEPARATOR.split(value):
        normalized = re.sub(r"\s*-\s*", "-", part).upper()
        normalized = re.sub(r"\s+", "", normalized)
        if normalized:
            parts.append(normalized)
    return ", ".join(parts) or None


def normalize_date(value: str | None) -> str | None:
    value = ascii_digits(clean(value))
    if not value:
        return None
    match = re.fullmatch(r"(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})", value)
    if not match:
        return value
    year, month, day = (int(part) for part in match.groups())
    if not (2000 <= year <= 2199 and 1 <= month <= 12 and 1 <= day <= 32):
        return value
    return f"{year:04d}-{month:02d}-{day:02d}"


def comparable(value: str | None) -> str:
    value = ascii_digits(clean(value)) or ""
    return re.sub(r"[^\w\u0900-\u097f]+", "", value).lower()


def deterministic_id(key: str) -> str:
    return str(uuid.uuid5(NAMESPACE, key))


def nature_for(matter: str | None, case_number: str | None) -> str:
    haystack = f"{matter or ''} {case_number or ''}".lower()
    if re.search(r"(?:^|[-, ])(?:wo|wc|wp|writ)(?:[-, ]|$)", haystack) or any(
        word in haystack for word in ("उत्प्रेषण", "परमादेश", "निषेधाज्ञ", "बन्दीप्रत्यक्षीकरण")
    ):
        return "Writ"
    if re.search(r"(?:^|[-, ])(?:cr|c1)(?:[-, ]|$)", haystack) or any(
        word in haystack
        for word in ("ठगी", "जबरजस्ती", "मानव बेच", "लागु औषध", "चोरी", "किर्ते", "ज्यान", "फौजदारी")
    ):
        return "Criminal"
    if any(word in haystack for word in ("कम्पनी", "करार", "बैंक", "चेक अनादर", "व्यापार", "वाणिज्य")):
        return "Commercial"
    return "Civil"


def court_level_for(court: str | None) -> str | None:
    court = court or ""
    if "सर्वोच्च" in court:
        return "Supreme Court"
    if "उच्च" in court:
        return "High Court"
    if "जिल्ला" in court or "का.जि" in court:
        return "District Court"
    if "विशेष" in court:
        return "Special Court"
    return None


def extract_rows(workbook_path: Path) -> tuple[list[dict], dict]:
    workbook = openpyxl.load_workbook(workbook_path, data_only=True, read_only=True)
    expected = {"all cases", "running cases"}
    actual = set(workbook.sheetnames)
    if not expected.issubset(actual):
        raise ValueError(f"Expected sheets {sorted(expected)}, found {workbook.sheetnames}")

    rows: list[dict] = []
    skipped_blank = 0
    for sheet_name in ("all cases", "running cases"):
        sheet = workbook[sheet_name]
        for row_number, cells in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
            values = [clean(value) for value in cells[:8]]
            values.extend([None] * (8 - len(values)))
            if not any(values[1:8]):
                skipped_blank += 1
                continue
            serial, source_date, first_party, opposing_party, matter, court, case_number, remarks = values
            issues = []
            for label, value in (("first party", first_party), ("matter", matter), ("court", court)):
                if not value:
                    issues.append(f"Missing {label}")
            if not opposing_party:
                issues.append("Missing opposing party")
            normalized_number = normalize_case_number(case_number)
            if not normalized_number:
                issues.append("Missing case number")
            normalized_date = normalize_date(source_date)
            if not normalized_date:
                issues.append("Missing registration date")
            elif not re.fullmatch(r"\d{4}-\d{2}-\d{2}", normalized_date):
                issues.append("Unrecognized registration date")
            rows.append(
                {
                    "sheet": sheet_name,
                    "row": row_number,
                    "serial": ascii_digits(serial),
                    "registrationDateBs": normalized_date,
                    "firstParty": first_party,
                    "opposingParty": opposing_party,
                    "matter": matter,
                    "court": court,
                    "caseNumber": normalized_number,
                    "sourceCaseNumber": case_number,
                    "remarks": remarks,
                    "issues": issues,
                }
            )

    return rows, {"skippedBlankRows": skipped_blank, "sheetNames": workbook.sheetnames}


def merge_rows(rows: list[dict]) -> tuple[list[dict], dict]:
    all_rows = [row for row in rows if row["sheet"] == "all cases"]
    running_rows = [row for row in rows if row["sheet"] == "running cases"]

    by_number: dict[str, list[dict]] = {}
    by_composite: dict[str, list[dict]] = {}
    for row in all_rows:
        if row["caseNumber"]:
            for number in CASE_NUMBER_SEPARATOR.split(row["caseNumber"]):
                by_number.setdefault(number, []).append(row)
        composite = "|".join(comparable(row[field]) for field in ("firstParty", "opposingParty", "matter"))
        if composite.replace("|", ""):
            by_composite.setdefault(composite, []).append(row)

    matches: dict[int, dict] = {}
    ambiguous_matches = 0
    for running in running_rows:
        candidates: list[dict] = []
        if running["caseNumber"]:
            for number in CASE_NUMBER_SEPARATOR.split(running["caseNumber"]):
                candidates.extend(by_number.get(number, []))
        if not candidates:
            composite = "|".join(comparable(running[field]) for field in ("firstParty", "opposingParty", "matter"))
            candidates = by_composite.get(composite, [])
        unique_candidates = {candidate["row"]: candidate for candidate in candidates}
        if len(unique_candidates) == 1:
            matches[running["row"]] = next(iter(unique_candidates.values()))
        elif len(unique_candidates) > 1:
            ambiguous_matches += 1

    merged: list[dict] = []
    running_by_all_row: dict[int, list[dict]] = {}
    for running in running_rows:
        matched = matches.get(running["row"])
        if matched:
            running_by_all_row.setdefault(matched["row"], []).append(running)

    for row in all_rows:
        active_sources = running_by_all_row.get(row["row"], [])
        merged.append(build_case(row, active_sources, bool(active_sources)))

    matched_running_rows = set(matches)
    for row in running_rows:
        if row["row"] not in matched_running_rows:
            merged.append(build_case(row, [], True))

    duplicate_case_numbers = sum(len(group) - 1 for group in by_number.values() if len(group) > 1)
    report = {
        "sourceRows": len(rows),
        "allCaseRows": len(all_rows),
        "runningCaseRows": len(running_rows),
        "matchedRunningRows": len(matches),
        "unmatchedRunningRows": len(running_rows) - len(matches),
        "ambiguousRunningMatches": ambiguous_matches,
        "generatedCases": len(merged),
        "activeCases": sum(case["status"] == "Active" for case in merged),
        "closedCases": sum(case["status"] == "Closed" for case in merged),
        "duplicateCaseNumbersInAllCases": duplicate_case_numbers,
        "rowsWithIssues": sum(bool(row["issues"]) for row in rows),
        "issueCounts": issue_counts(rows),
    }
    return merged, report


def build_case(primary: dict, active_sources: list[dict], active: bool) -> dict:
    source_key = f"{primary['sheet']}:{primary['row']}"
    case_id = deterministic_id(f"case:{source_key}")
    first_party_role = "Petitioner" if nature_for(primary["matter"], primary["caseNumber"]) == "Writ" else "Plaintiff"
    second_party_role = "Respondent" if first_party_role == "Petitioner" else "Defendant"
    source_rows = [primary, *active_sources]
    return {
        "id": case_id,
        "nature": nature_for(primary["matter"], primary["caseNumber"]),
        "status": "Active" if active else "Closed",
        "facts": primary["matter"],
        "details": {
            "importSource": "Copy of CASES LIST.xlsx",
            "sourceRows": [
                {
                    "sheet": row["sheet"],
                    "row": row["row"],
                    "serial": row["serial"],
                    "registrationDateBs": row["registrationDateBs"],
                    "sourceCaseNumber": row["sourceCaseNumber"],
                    "remarks": row["remarks"],
                    "validationIssues": row["issues"],
                }
                for row in source_rows
            ],
        },
        "courtDetail": {
            "id": deterministic_id(f"court-detail:{source_key}"),
            "caseName": " विरुद्ध ".join(filter(None, (primary["firstParty"], primary["opposingParty"])))
            or primary["matter"]
            or f"Imported case {primary['row']}",
            "caseNumber": primary["caseNumber"] or "",
            "registrationDate": None,
            "courtLevel": court_level_for(primary["court"]),
            "courtName": primary["court"],
            "isActive": active,
        },
        "parties": [
            {
                "id": deterministic_id(f"party:first:{source_key}"),
                "name": primary["firstParty"] or "नाम उपलब्ध छैन",
                "role": first_party_role,
            },
            {
                "id": deterministic_id(f"party:opposing:{source_key}"),
                "name": primary["opposingParty"] or "नाम उपलब्ध छैन",
                "role": second_party_role,
            },
        ],
    }


def issue_counts(rows: list[dict]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for row in rows:
        for issue in row["issues"]:
            counts[issue] = counts.get(issue, 0) + 1
    return dict(sorted(counts.items()))


def render_typescript(cases: list[dict], metadata: dict) -> str:
    payload = json.dumps(cases, ensure_ascii=False, indent=2)
    meta = json.dumps(metadata, ensure_ascii=False, indent=2)
    return (
        "// Generated by scripts/build-case-seed-data.py. Do not edit by hand.\n"
        "// Bikram Sambat dates remain in details.sourceRows because the database field is Gregorian DateTime.\n\n"
        "export const importedCaseSeedMetadata = "
        + meta
        + " as const;\n\nexport const importedCaseSeedData = "
        + payload
        + " as const;\n"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate deterministic Prisma case seed data from the case workbook.")
    parser.add_argument("workbook", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    source_bytes = args.workbook.read_bytes()
    rows, extraction = extract_rows(args.workbook)
    cases, report = merge_rows(rows)
    metadata = {
        "sourceFile": args.workbook.name,
        "sourceSha256": hashlib.sha256(source_bytes).hexdigest(),
        **extraction,
        **report,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(render_typescript(cases, metadata), encoding="utf-8", newline="\n")
    print(json.dumps(metadata, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
