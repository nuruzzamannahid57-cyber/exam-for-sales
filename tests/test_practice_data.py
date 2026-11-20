"""Independently verify the Excel key against the practice CSVs."""

import csv
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from collections import defaultdict
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read_rows(path):
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def calculate_key(root):
    orders = read_rows(root / "data" / "sales_orders.csv")
    dealers = read_rows(root / "data" / "dealers.csv")
    targets = {row["region"]: Decimal(row["target"]) for row in read_rows(root / "data" / "targets.csv")}
    by_region = defaultdict(Decimal)
    by_dealer = defaultdict(Decimal)
    by_month = defaultdict(Decimal)
    dhaka_exterior = Decimal(0)
    for row in orders:
        amount = Decimal(row["qty"]) * Decimal(row["unit_price"]) * (1 - Decimal(row["discount_pct"]) / 100)
        by_region[row["region"]] += amount
        by_dealer[row["dealer"]] += amount
        by_month[row["date"][:7]] += amount
        if row["region"] == "Dhaka" and row["product"] == "Exterior Emulsion":
            dhaka_exterior += amount
    achievements = {region: amount / targets[region] * 100 for region, amount in by_region.items()}
    lowest_region = min(achievements, key=achievements.get)
    return {
        "E1": len(orders),
        "E2": sum(int(row["qty"]) for row in orders),
        "E3": sum(by_region.values()),
        "E4": (sum(Decimal(row["discount_pct"]) for row in orders) / len(orders)).quantize(Decimal("0.01")),
        "E5": sum(row["region"] == "Dhaka" for row in orders),
        "M1": by_region["Chattogram"],
        "M2": dhaka_exterior,
        "M3": max(by_dealer, key=by_dealer.get),
        "M4": sum(Decimal(row["discount_pct"]) > 10 for row in orders),
        "M5": int(next(row["credit_limit"] for row in dealers if row["dealer"] == "Mia & Sons")),
        "H1": lowest_region,
        "H1_pct": achievements[lowest_region].quantize(Decimal("0.1")),
        "H2": sum(Decimal(row["outstanding"]) > Decimal("0.8") * Decimal(row["credit_limit"]) for row in dealers),
        "H3": max(by_month, key=by_month.get),
        "H4": sum(int(row["outstanding"]) for row in dealers if int(row["days_overdue"]) > 30),
    }


def read_key(root):
    with (root / "scripts" / "answer_key.json").open(encoding="utf-8") as handle:
        return json.load(handle, parse_float=Decimal)


class PracticeDataTests(unittest.TestCase):
    def test_shipped_key_matches_data_and_template(self):
        key = read_key(ROOT)
        expected = calculate_key(ROOT)
        self.assertEqual({name: value for name, value in key.items() if not name.startswith("_")}, expected)
        template = json.loads((ROOT / "01-excel" / "my_answers_template.json").read_text(encoding="utf-8"))
        self.assertEqual(set(template), set(expected))
        self.assertTrue(all(value is None for value in template.values()))

    @unittest.skipUnless(importlib.util.find_spec("pandas"), "pandas is optional; install it to test generation")
    def test_generator_in_isolated_directory(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            for directory in ("scripts", "data", "01-excel"):
                (root / directory).mkdir()
            shutil.copy(ROOT / "scripts" / "generate_data.py", root / "scripts" / "generate_data.py")
            result = subprocess.run([sys.executable, "scripts/generate_data.py"], cwd=root, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            generated = read_key(root)
            self.assertEqual({k: v for k, v in generated.items() if not k.startswith("_")}, calculate_key(root))
            # The published worked solutions assume the fixed seed still produces this key.
            self.assertEqual(generated, read_key(ROOT))


if __name__ == "__main__":
    unittest.main()
