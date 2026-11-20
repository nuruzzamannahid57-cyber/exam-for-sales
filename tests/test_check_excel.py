"""Regression tests for the Excel answer checker (stdlib only)."""

import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("check_excel", ROOT / "scripts" / "check_excel.py")
checker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checker)


class ComparisonTests(unittest.TestCase):
    def test_exact_counts_reject_fractional_values(self):
        self.assertEqual(checker.compare(300, 300, "E1"), (True, False))
        self.assertEqual(checker.compare(299.5, 300, "E1"), (False, False))
        self.assertEqual(checker.compare("300.0", 300, "E1"), (True, False))

    def test_exact_average_percentage(self):
        self.assertEqual(checker.compare("7.59", Decimal("7.59"), "E4"), (True, False))
        self.assertEqual(checker.compare(8.0, Decimal("7.59"), "E4"), (False, False))

    def test_revenue_tolerance_is_inclusive(self):
        self.assertTrue(checker.compare("100.01", Decimal("100"), "E3")[0])
        self.assertFalse(checker.compare("100.011", Decimal("100"), "E3")[0])

    def test_percentage_tolerance_is_decimal_and_inclusive(self):
        self.assertTrue(checker.compare("86.3", Decimal("86.4"), "H1_pct")[0])
        self.assertTrue(checker.compare("86.5", Decimal("86.4"), "H1_pct")[0])
        self.assertFalse(checker.compare("86.29", Decimal("86.4"), "H1_pct")[0])

    def test_text_and_invalid_types(self):
        self.assertEqual(checker.compare(" rajshahi ", "Rajshahi", "H1"), (True, False))
        self.assertEqual(checker.compare(None, 300, "E1"), (False, False))
        for value in (True, [], {}, "abc", "", "NaN", "Infinity", "1e999999999"):
            with self.subTest(value=value):
                self.assertEqual(checker.compare(value, 300, "E1"), (False, True))
        self.assertEqual(checker.compare(123, "Rajshahi", "H1"), (False, True))


class CheckerCommandTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "scripts").mkdir()
        (self.root / "01-excel").mkdir()
        for name in ("check_excel.py", "answer_key.json"):
            shutil.copy(ROOT / "scripts" / name, self.root / "scripts" / name)
        self.answers = self.root / "01-excel" / "my_answers.json"

    def run_checker(self):
        return subprocess.run(
            [sys.executable, str(self.root / "scripts" / "check_excel.py")],
            cwd=self.root, capture_output=True, text=True, encoding="utf-8",
        )

    def test_complete_answer_key(self):
        key = json.loads((self.root / "scripts" / "answer_key.json").read_text(encoding="utf-8"))
        self.answers.write_text(json.dumps(key), encoding="utf-8")
        result = self.run_checker()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("310 / 310", result.stdout)
        self.assertNotIn("❌", result.stdout)

    def test_invalid_answer_does_not_abort_other_questions(self):
        self.answers.write_text(json.dumps({"E1": "abc", "E2": 18930, "H1": "Rajshahi", "H1_pct": "bad"}), encoding="utf-8")
        result = self.run_checker()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("E1: ❌ not yet (invalid value: E1)", result.stdout)
        self.assertIn("E2: ✅ correct", result.stdout)
        self.assertIn("H1: ❌ not yet (invalid value: H1_pct)", result.stdout)
        self.assertIn("XP from Excel tasks:", result.stdout)

    def test_h1_requires_name_and_percentage(self):
        self.answers.write_text(json.dumps({"H1": "Rajshahi"}), encoding="utf-8")
        self.assertIn("H1: ❌ not yet", self.run_checker().stdout)
        self.answers.write_text(json.dumps({"H1": "rajshahi", "H1_pct": 86.3}), encoding="utf-8")
        self.assertIn("H1: ✅ correct", self.run_checker().stdout)

    def test_missing_and_malformed_files_have_clear_errors(self):
        result = self.run_checker()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Create 01-excel/my_answers.json", result.stderr)
        for content in ("{", "[]"):
            with self.subTest(content=content):
                self.answers.write_text(content, encoding="utf-8")
                result = self.run_checker()
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("Could not read answer files", result.stderr)
                self.assertNotIn("Traceback", result.stderr)


if __name__ == "__main__":
    unittest.main()
