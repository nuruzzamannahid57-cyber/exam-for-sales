"""Check the Excel answers saved in 01-excel/my_answers.json.

Counts and other exact values must match exactly. Revenue answers allow a
0.01 BDT rounding difference; H1_pct allows 0.1 percentage points. Text
answers are case-insensitive. Run with: python scripts/check_excel.py
"""

import json
import sys
from decimal import Decimal, DecimalException
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KEY_PATH = ROOT / "scripts" / "answer_key.json"
ANSWERS_PATH = ROOT / "01-excel" / "my_answers.json"
XP = {"E": 10, "M": 20, "H": 40}
LEVELS = {"E": "🟢 EASY", "M": "🟡 MEDIUM", "H": "🔴 HARD"}
TOLERANCES = {
    "E3": Decimal("0.01"),
    "M1": Decimal("0.01"),
    "M2": Decimal("0.01"),
    "H1_pct": Decimal("0.1"),
}


def read_json_object(path):
    """Load a JSON object while preserving decimal values exactly."""
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle, parse_float=Decimal)
    if not isinstance(data, dict):
        raise ValueError("the top-level JSON value must be an object")
    return data


def compare(answer, expected, question):
    """Return (correct, invalid) for one answer; null means unanswered."""
    if answer is None:
        return False, False
    if isinstance(expected, str):
        if not isinstance(answer, str):
            return False, True
        return answer.strip().casefold() == expected.strip().casefold(), False
    if isinstance(answer, bool) or not isinstance(answer, (str, int, float, Decimal)):
        return False, True
    try:
        value = Decimal(str(answer).strip())
        expected_value = Decimal(str(expected))
        if not value.is_finite():
            return False, True
        return abs(value - expected_value) <= TOLERANCES.get(question, Decimal(0)), False
    except (DecimalException, ValueError):
        return False, True


def main():
    if not ANSWERS_PATH.exists():
        print("Create 01-excel/my_answers.json first (copy my_answers_template.json).", file=sys.stderr)
        return 1
    try:
        key = read_json_object(KEY_PATH)
        answers = read_json_object(ANSWERS_PATH)
    except (OSError, UnicodeError, ValueError) as exc:
        print(f"Could not read answer files: {exc}", file=sys.stderr)
        return 1

    total = 0
    maximum = 0
    for level in "EMH":
        print(f"\n{LEVELS[level]}")
        for question in (k for k in key if k.startswith(level) and not k.endswith("_pct")):
            correct, invalid = compare(answers.get(question), key[question], question)
            invalid_fields = [question] if invalid else []
            if question == "H1":
                pct_correct, pct_invalid = compare(answers.get("H1_pct"), key["H1_pct"], "H1_pct")
                correct = correct and pct_correct
                if pct_invalid:
                    invalid_fields.append("H1_pct")
            status = "✅ correct" if correct else "❌ not yet"
            if invalid_fields:
                status += f" (invalid value: {', '.join(invalid_fields)})"
            print(f"  {question}: {status}")
            total += XP[level] if correct else 0
            maximum += XP[level]
    print(f"\nXP from Excel tasks: {total} / {maximum}")
    print("Stuck? Read 01-excel/solutions.md AFTER trying for 10 minutes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
