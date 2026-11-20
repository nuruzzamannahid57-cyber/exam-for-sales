"""Check that downloadable workbooks remain usable and match the practice data."""
import csv
from collections import defaultdict
from decimal import Decimal
import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HAS_OPENPYXL = importlib.util.find_spec('openpyxl') is not None


@unittest.skipUnless(HAS_OPENPYXL, 'openpyxl is optional; install it to inspect workbooks')
class PracticeWorkbooksTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from openpyxl import load_workbook
        cls.load_workbook = staticmethod(load_workbook)

    def open_book(self, name):
        return self.load_workbook(ROOT / 'public' / 'workbooks' / name, data_only=False)

    def test_excel_workbook_has_fictional_data_and_blank_amounts(self):
        book = self.open_book('excel-practice.xlsx')
        self.assertEqual(book.sheetnames, ['Start Here', 'Step Practice', 'Exam Practice', 'Orders', 'Dealers', 'Targets', 'Answer Key'])
        orders = book['Orders']
        self.assertEqual(orders.max_row, 301)
        self.assertEqual(orders['I1'].value, 'amount')
        self.assertIsNone(orders['I2'].value)
        self.assertEqual(book['Step Practice']['E5'].data_type, 'f')
        self.assertIn("'Answer Key'!B5", book['Step Practice']['E5'].value)
        self.assertEqual(book['Answer Key']['B5'].value, 18930)
        self.assertEqual(book['Answer Key']['B12'].value, '2026-05')

    def test_reporting_workbook_contains_formulas_and_summary_templates(self):
        book = self.open_book('sales-reporting-practice.xlsx')
        self.assertEqual(book['Orders'].max_row, 301)
        self.assertEqual(book['Orders']['I2'].value, '=F2*G2*(1-H2/100)')
        self.assertEqual(book['Orders']['I301'].value, '=F301*G301*(1-H301/100)')
        self.assertEqual(book['Regional Summary']['A5'].value, 'Dhaka')
        self.assertIsNone(book['Regional Summary']['C5'].value)
        self.assertIsNone(book['Monthly Summary']['B5'].value)
        self.assertEqual(book['KPI Practice']['E5'].data_type, 'f')

    def test_aptitude_exercises_and_key_are_complete(self):
        book = self.open_book('aptitude-practice.xlsx')
        self.assertEqual(book.sheetnames, ['Start Here', 'Aptitude Practice', 'Answer Key'])
        self.assertEqual(book['Aptitude Practice'].max_row, 23)
        self.assertEqual(book['Answer Key']['B5'].value, 90)
        self.assertEqual(book['Answer Key']['B23'].value, 135)
        for row in range(5, 24):
            self.assertIsNone(book['Aptitude Practice'].cell(row, 4).value)
            self.assertEqual(book['Aptitude Practice'].cell(row, 5).data_type, 'f')

    def test_excel_answer_key_matches_calculated_source_data(self):
        with (ROOT / 'data' / 'sales_orders.csv').open(newline='', encoding='utf-8') as handle:
            orders = list(csv.DictReader(handle))
        with (ROOT / 'data' / 'dealers.csv').open(newline='', encoding='utf-8') as handle:
            dealers = list(csv.DictReader(handle))
        with (ROOT / 'data' / 'targets.csv').open(newline='', encoding='utf-8') as handle:
            targets = list(csv.DictReader(handle))
        def amount(order):
            return Decimal(order['qty']) * Decimal(order['unit_price']) * (1 - Decimal(order['discount_pct']) / 100)
        by_region, by_dealer, by_month = defaultdict(Decimal), defaultdict(Decimal), defaultdict(Decimal)
        for order in orders:
            by_region[order['region']] += amount(order)
            by_dealer[order['dealer']] += amount(order)
            by_month[order['date'][:7]] += amount(order)
        lowest = min(targets, key=lambda t: by_region[t['region']] / Decimal(t['target']))
        expected = [
            sum(int(o['qty']) for o in orders), amount(orders[0]), by_region['Chattogram'],
            sum(int(o['discount_pct']) > 10 for o in orders),
            int(next(d['credit_limit'] for d in dealers if d['dealer'] == 'Mia & Sons')),
            max(by_dealer, key=by_dealer.get), sum(int(d['days_overdue']) > 30 for d in dealers),
            max(by_month, key=by_month.get), len(orders), sum(int(o['qty']) for o in orders),
            sum(map(amount, orders)), round(sum(int(o['discount_pct']) for o in orders) / len(orders), 2),
            sum(o['region'] == 'Dhaka' for o in orders), by_region['Chattogram'],
            sum(amount(o) for o in orders if o['region'] == 'Dhaka' and o['product'] == 'Exterior Emulsion'),
            max(by_dealer, key=by_dealer.get), sum(int(o['discount_pct']) > 10 for o in orders),
            int(next(d['credit_limit'] for d in dealers if d['dealer'] == 'Mia & Sons')),
            lowest['region'], round(float(by_region[lowest['region']] / Decimal(lowest['target']) * 100), 1),
            sum(Decimal(d['outstanding']) > Decimal(d['credit_limit']) * Decimal('.8') for d in dealers),
            max(by_month, key=by_month.get), sum(int(d['outstanding']) for d in dealers if int(d['days_overdue']) > 30),
        ]
        key = self.open_book('excel-practice.xlsx')['Answer Key']
        for row, value in enumerate(expected, 5):
            actual = key.cell(row, 2).value
            if isinstance(value, Decimal):
                self.assertAlmostEqual(actual, float(value), places=2, msg=f'Answer Key row {row}')
            else:
                self.assertEqual(actual, value, f'Answer Key row {row}')

    def test_workbooks_use_the_same_fictional_source_data(self):
        with (ROOT / 'data' / 'sales_orders.csv').open(newline='', encoding='utf-8') as handle:
            source = list(csv.DictReader(handle))
        for name in ['excel-practice.xlsx', 'sales-reporting-practice.xlsx']:
            book = self.open_book(name)
            for index in [0, len(source) - 1]:
                row = book['Orders'][index + 2]
                self.assertEqual(row[0].value, source[index]['order_id'])
                self.assertEqual(row[5].value, int(source[index]['qty']))
                self.assertEqual(row[7].value, int(source[index]['discount_pct']))


if __name__ == '__main__':
    unittest.main()
