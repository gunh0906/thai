from __future__ import annotations

import argparse
import csv
import json
import re
from datetime import datetime
from pathlib import Path

THAI_REGEX = re.compile(r"[\u0E00-\u0E7F]")
HANGUL_REGEX = re.compile(r"[가-힣]")


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def normalize_key(thai: str, korean: str) -> str:
    return f"{clean_text(thai).casefold()}||{clean_text(korean).casefold()}"


def detect_delimiter(name: str) -> str:
    mapping = {
        "tsv": "\t",
        "csv": ",",
        "pipe": "|",
    }
    return mapping.get(name, name)


def parse_tags(raw: str) -> list[str]:
    return [item.strip() for item in str(raw or "").split(",") if item.strip()]


def looks_valid_pair(thai: str, korean: str) -> bool:
    if len(thai) < 2 or len(korean) < 2:
        return False
    if not THAI_REGEX.search(thai):
        return False
    if not HANGUL_REGEX.search(korean):
        return False
    return True


def build_entry(kind: str, thai: str, korean: str, tags: list[str], note: str) -> dict:
    return {
        "thai": clean_text(thai),
        "thaiScript": clean_text(thai),
        "korean": clean_text(korean),
        "tags": tags,
        "note": clean_text(note),
    }


def import_parallel_rows(
    input_path: Path,
    *,
    kind: str,
    thai_col: int,
    korean_col: int,
    delimiter: str,
    skip_header: bool,
    tags: list[str],
    note: str,
    limit: int | None,
) -> list[dict]:
    rows: list[dict] = []
    seen: set[str] = set()

    with input_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.reader(handle, delimiter=delimiter)
        for row_index, row in enumerate(reader):
            if skip_header and row_index == 0:
                continue
            if max(thai_col, korean_col) >= len(row):
                continue

            thai = clean_text(row[thai_col])
            korean = clean_text(row[korean_col])
            if not looks_valid_pair(thai, korean):
                continue

            key = normalize_key(thai, korean)
            if key in seen:
                continue

            seen.add(key)
            rows.append(build_entry(kind, thai, korean, tags, note))
            if limit and len(rows) >= limit:
                break

    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert a parallel corpus file into the app's external corpus JSON format.")
    parser.add_argument("--input", required=True, help="Input TSV/CSV file path.")
    parser.add_argument("--output", required=True, help="Output JSON file path.")
    parser.add_argument("--source", required=True, help="Corpus source name, for example Tatoeba or OPUS.")
    parser.add_argument("--kind", choices=["sentence", "vocab"], default="sentence")
    parser.add_argument("--thai-col", type=int, default=0, help="Zero-based Thai column index.")
    parser.add_argument("--korean-col", type=int, default=1, help="Zero-based Korean column index.")
    parser.add_argument("--delimiter", default="tsv", help="tsv, csv, pipe, or a literal delimiter character.")
    parser.add_argument("--skip-header", action="store_true", help="Skip the first row.")
    parser.add_argument("--tags", default="", help="Comma-separated tags to attach to imported rows.")
    parser.add_argument("--note", default="", help="Optional note attached to imported rows.")
    parser.add_argument("--limit", type=int, default=0, help="Optional row limit for sampling.")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    delimiter = detect_delimiter(args.delimiter)
    tags = parse_tags(args.tags)
    rows = import_parallel_rows(
        input_path,
        kind=args.kind,
        thai_col=args.thai_col,
        korean_col=args.korean_col,
        delimiter=delimiter,
        skip_header=args.skip_header,
        tags=tags,
        note=args.note,
        limit=args.limit or None,
    )

    payload = {
        "source": clean_text(args.source),
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "vocab": rows if args.kind == "vocab" else [],
        "sentences": rows if args.kind == "sentence" else [],
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "input": str(input_path),
                "output": str(output_path),
                "source": payload["source"],
                "kind": args.kind,
                "rows": len(rows),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
