"""Generate downloadable practice workbooks from the repository's fictional CSV data.

Install: python -m pip install openpyxl==3.1.5
Run from any directory: python scripts/generate_workbooks.py
Outputs are written to public/workbooks and are intended to be committed.
"""

import csv
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.workbook.properties import CalcProperties

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'public' / 'workbooks'
DARK = '294B3A'
GREEN = 'E8F1E6'
CREAM = 'FAF7ED'
INK = '314A3A'
MUTED = '6B8070'
YELLOW = 'FFF2CC'
WHITE = 'FFFFFF'


def read_csv(filename):
    with (ROOT / 'data' / filename).open(newline='', encoding='utf-8') as handle:
        return list(csv.DictReader(handle))


orders = read_csv('sales_orders.csv')
dealers = read_csv('dealers.csv')
targets = read_csv('targets.csv')


def workbook():
    book = Workbook()
    book.remove(book.active)
    book.calculation = CalcProperties(calcMode='auto', fullCalcOnLoad=True, forceFullCalc=True)
    book.properties.creator = 'Sales Prep'
    book.properties.description = 'Fictional data for exam practice.'
    return book


def title(sheet, headline, subtitle, end='E'):
    sheet.merge_cells(f'A1:{end}1')
    sheet['A1'] = headline
    sheet['A1'].font = Font(name='Calibri', size=19, bold=True, color=WHITE)
    sheet['A1'].fill = PatternFill('solid', fgColor=DARK)
    sheet['A1'].alignment = Alignment(vertical='center')
    sheet.row_dimensions[1].height = 36
    # Fill the entire merged range so the header is visually continuous.
    for cell in sheet[1][:ord(end) - ord('A') + 1]:
        cell.fill = PatternFill('solid', fgColor=DARK)
    sheet.merge_cells(f'A2:{end}2')
    sheet['A2'] = subtitle
    sheet['A2'].font = Font(name='Calibri', size=10, color=MUTED, italic=True)
    sheet['A2'].alignment = Alignment(wrap_text=True, vertical='center')
    sheet.row_dimensions[2].height = 31
    sheet.sheet_view.showGridLines = False


def intro(book, title_text, lines):
    sheet = book.create_sheet('Start Here')
    title(sheet, title_text, 'A hands-on workbook using fictional data. Open in Excel or upload to Google Sheets.')
    sheet.column_dimensions['A'].width = 8
    sheet.column_dimensions['B'].width = 29
    for col in 'CDE':
        sheet.column_dimensions[col].width = 22
    for row, (heading, description) in enumerate(lines, 4):
        sheet.cell(row, 2, heading).font = Font(name='Calibri', bold=True, color=INK, size=11)
        sheet.merge_cells(start_row=row, start_column=3, end_row=row, end_column=5)
        cell = sheet.cell(row, 3, description)
        cell.font = Font(name='Calibri', color=MUTED, size=11)
        cell.alignment = Alignment(wrap_text=True, vertical='center')
        sheet.row_dimensions[row].height = 44
    sheet.freeze_panes = 'A4'


def data_sheet(book, name, records, fieldnames, with_amount=False, blank_amount=False):
    sheet = book.create_sheet(name)
    columns = list(fieldnames) + (['amount'] if with_amount or blank_amount else [])
    sheet.append(columns)
    for cell in sheet[1]:
        cell.fill = PatternFill('solid', fgColor=DARK)
        cell.font = Font(name='Calibri', bold=True, color=WHITE)
        cell.alignment = Alignment(vertical='center')
    sheet.row_dimensions[1].height = 24
    for i, record in enumerate(records, 2):
        for j, field in enumerate(fieldnames, 1):
            value = record[field]
            if field == 'date':
                value = date.fromisoformat(value)
            elif field in {'qty', 'unit_price', 'discount_pct', 'credit_limit', 'outstanding', 'days_overdue', 'target'}:
                value = int(value)
            cell = sheet.cell(i, j, value)
            if field == 'date':
                cell.number_format = 'yyyy-mm-dd'
            if i % 2 == 0:
                cell.fill = PatternFill('solid', fgColor='F6F9F4')
        if with_amount:
            cell = sheet.cell(i, len(columns), f'=F{i}*G{i}*(1-H{i}/100)')
            cell.number_format = '#,##0.00'
        elif blank_amount:
            sheet.cell(i, len(columns)).fill = PatternFill('solid', fgColor=YELLOW)
    widths = {'order_id': 15, 'date': 15, 'dealer': 27, 'region': 16, 'product': 23, 'qty': 12, 'unit_price': 15, 'discount_pct': 16, 'credit_limit': 17, 'outstanding': 17, 'days_overdue': 17, 'target': 18, 'amount': 18}
    for index, field in enumerate(columns, 1):
        sheet.column_dimensions[get_column_letter(index)].width = widths.get(field, 17)
    sheet.auto_filter.ref = sheet.dimensions
    sheet.freeze_panes = 'A2'


def practice(book, name, description, questions, key_rows):
    sheet = book.create_sheet(name)
    title(sheet, name.upper(), description)
    for col, width in {'A': 11, 'B': 13, 'C': 89, 'D': 22, 'E': 17}.items():
        sheet.column_dimensions[col].width = width
    for col, value in enumerate(['Question', 'Level', 'What to do', 'Your answer', 'Check'], 1):
        cell = sheet.cell(4, col, value)
        cell.font = Font(name='Calibri', color=INK, bold=True)
        cell.fill = PatternFill('solid', fgColor=GREEN)
        cell.alignment = Alignment(vertical='center')
    sheet.row_dimensions[4].height = 26
    for row, (label, level, prompt, answer, kind, tolerance, explanation) in enumerate(questions, 5):
        key_row = len(key_rows) + 5
        key_rows.append((name, label, answer, explanation))
        sheet.cell(row, 1, label)
        sheet.cell(row, 2, level)
        sheet.cell(row, 3, prompt)
        user_cell = sheet.cell(row, 4)
        user_cell.fill = PatternFill('solid', fgColor=YELLOW)
        user_cell.number_format = 'General'
        if kind == 'text':
            test = f'UPPER(TRIM(D{row}&""))=UPPER(TRIM(\'Answer Key\'!B{key_row}&""))'
        else:
            test = f'IFERROR(ABS(D{row}-\'Answer Key\'!B{key_row})<={tolerance},FALSE)'
        sheet.cell(row, 5, f'=IF(D{row}="","",IF({test},"Correct","Try again"))')
        for cell in sheet[row]:
            cell.font = Font(name='Calibri', color=INK, size=10)
            cell.alignment = Alignment(vertical='center', wrap_text=True)
        sheet.row_dimensions[row].height = 45
    sheet.freeze_panes = 'D5'
    sheet.auto_filter.ref = f'A4:E{4 + len(questions)}'


def answer_key(book, rows):
    sheet = book.create_sheet('Answer Key')
    title(sheet, 'ANSWER KEY', 'Try the exercises first. Percentage answers are expressed in percentage points (86 means 86%).')
    for col, width in {'A': 30, 'B': 25, 'C': 85, 'D': 12, 'E': 12}.items():
        sheet.column_dimensions[col].width = width
    for col, value in enumerate(['Sheet / question', 'Expected answer', 'Explanation'], 1):
        sheet.cell(4, col, value).font = Font(name='Calibri', color=INK, bold=True)
        sheet.cell(4, col).fill = PatternFill('solid', fgColor=GREEN)
    for row, (source, question, answer, explanation) in enumerate(rows, 5):
        sheet.cell(row, 1, f'{source} / {question}')
        sheet.cell(row, 2, answer)
        sheet.cell(row, 3, explanation)
        for cell in sheet[row][:3]:
            cell.font = Font(name='Calibri', color=INK, size=10)
            cell.alignment = Alignment(vertical='center', wrap_text=True)
        sheet.row_dimensions[row].height = 32
    sheet.freeze_panes = 'A5'


def summary_sheet(book, name, headings, data, widths):
    sheet = book.create_sheet(name)
    title(sheet, name.upper(), 'Yellow cells are for your own formulas. Use the Orders and Targets tabs. Percentages: enter 86 for 86%.', end='D')
    for col, width in enumerate(widths, 1):
        sheet.column_dimensions[get_column_letter(col)].width = width
    for col, heading in enumerate(headings, 1):
        cell = sheet.cell(4, col, heading)
        cell.fill = PatternFill('solid', fgColor=GREEN)
        cell.font = Font(name='Calibri', color=INK, bold=True)
        cell.alignment = Alignment(wrap_text=True)
    for row_index, row_values in enumerate(data, 5):
        for col, value in enumerate(row_values, 1):
            cell = sheet.cell(row_index, col, value)
            cell.font = Font(name='Calibri', color=INK)
            if value is None:
                cell.fill = PatternFill('solid', fgColor=YELLOW)
        sheet.row_dimensions[row_index].height = 25
    sheet.freeze_panes = 'B5'


def q(label, level, prompt, answer, explanation, kind='number', tolerance=0):
    return (label, level, prompt, answer, kind, tolerance, explanation)


excel_steps = [
    q('Step 1', 'Functions', 'Orders: sum quantities in F2:F301. Enter total quantity.', 18930, 'Use SUM(Orders!F2:F301).'),
    q('Step 2', 'Formulas', 'Orders: fill Amount in I2:I301 using qty × price × (1 − discount/100). Enter the value of I2.', 53505, 'I2 = F2*G2*(1-H2/100) = 53,505.', tolerance=0.01),
    q('Step 3', 'SUMIFS', 'After filling Amount, sum revenue for Chattogram. Enter the result.', 4496111.8, 'SUMIF or SUMIFS on Orders region and Amount.', tolerance=0.01),
    q('Step 4', 'IF', 'Count orders whose discount is strictly above 10%.', 87, 'COUNTIF on discount_pct with the criterion >10.'),
    q('Step 5', 'Lookups', 'Look up Mia & Sons on the Dealers tab. Enter the credit limit.', 300000, 'Use VLOOKUP or INDEX/MATCH against Dealers.'),
    q('Step 6', 'Pivot', 'Build a dealer-by-Amount pivot. Enter the top dealer name.', 'Paul Color House', 'Sum Amount by dealer, then sort descending.', kind='text'),
    q('Step 7', 'Filtering', 'On Dealers, filter days_overdue > 30. How many dealers match?', 8, 'Count the dealer rows with days_overdue strictly above 30.'),
    q('Step 8', 'Dates', 'Group revenue by month. Enter the highest-revenue month as YYYY-MM.', '2026-05', 'Use a year-month helper and a pivot table.', kind='text'),
]
excel_exam = [
    q('E1', 'Easy', 'How many orders are in Orders?', 300, 'Count the order IDs.'),
    q('E2', 'Easy', 'Total quantity ordered?', 18930, 'Sum qty.'),
    q('E3', 'Easy', 'Total revenue after discounts? Fill Amount first.', 23872485.8, 'Sum the Amount column.', tolerance=0.01),
    q('E4', 'Easy', 'Average discount, as percentage points rounded to 2 decimals?', 7.59, 'Average discount_pct.'),
    q('E5', 'Easy', 'Number of Dhaka orders?', 47, 'COUNTIF region = Dhaka.'),
    q('M1', 'Medium', 'Revenue from Chattogram?', 4496111.8, 'Sum Amount for Chattogram.', tolerance=0.01),
    q('M2', 'Medium', 'Exterior Emulsion revenue in Dhaka?', 766362.5, 'SUMIFS on region and product.', tolerance=0.01),
    q('M3', 'Medium', 'Dealer with highest total revenue?', 'Paul Color House', 'Pivot Amount by dealer.', kind='text'),
    q('M4', 'Medium', 'Number of orders with discount above 10%?', 87, 'COUNTIF discount_pct > 10.'),
    q('M5', 'Medium', 'Mia & Sons credit limit?', 300000, 'Look up the dealer in Dealers.'),
    q('H1a', 'Hard', 'Which region has the lowest revenue achievement?', 'Rajshahi', 'Compare revenue with Targets.', kind='text'),
    q('H1b', 'Hard', 'What is its achievement? Enter percentage points, rounded to 1 decimal.', 86.4, 'Revenue / target × 100.', tolerance=0.1),
    q('H2', 'Hard', 'How many dealers have outstanding strictly above 80% of credit limit?', 8, 'Count Dealers where outstanding > 0.8 × limit.'),
    q('H3', 'Hard', 'Highest-revenue month, as YYYY-MM?', '2026-05', 'Pivot Amount by year-month.', kind='text'),
    q('H4', 'Hard', 'Total outstanding of dealers more than 30 days overdue?', 4558000, 'SUMIF days_overdue > 30.'),
]

kpi_questions = [
    q('1', 'Easy', 'Target 5,000,000; actual 4,300,000. Achievement %, as percentage points?', 86, 'Actual / target × 100.'),
    q('2', 'Easy', 'Last year 3,800,000; this year 4,500,000. Growth %, 2 decimals?', 18.42, '(Current − previous) / previous × 100.', tolerance=0.01),
    q('3', 'Easy', 'Region sold 1.2M of 6M total. Contribution %?', 20, 'Part / total × 100.'),
    q('4', 'Easy', '920 units delivered of 1,000 ordered. Fill rate %?', 92, 'Delivered / ordered × 100.'),
    q('5a', 'Medium', 'Day 15 of 30; sold 2.4M, target 6M. Current daily run rate?', 160000, '2,400,000 / 15.'),
    q('5b', 'Medium', 'Same case: projected month-end revenue?', 4800000, '160,000 × 30.'),
    q('5c', 'Medium', 'Same case: projected achievement %?', 80, '4,800,000 / 6,000,000 × 100.'),
    q('6', 'Medium', 'Same case: required daily rate for remaining 15 days?', 240000, '(6,000,000 − 2,400,000) / 15.'),
    q('7a', 'Medium', 'Collected 8.5M of 10M due. Collection efficiency %?', 85, '8.5M / 10M × 100.'),
    q('7b', 'Medium', 'Same case: amount pending?', 1500000, '10M − 8.5M.'),
    q('8', 'Medium', '40 orders worth 6,000,000 total. Average order value?', 150000, '6,000,000 / 40.'),
    q('9a', 'Hard', 'Use the Regional Summary and Orders tabs. Lowest-achievement region?', 'Rajshahi', 'Revenue / target, ranked ascending.', kind='text'),
    q('9b', 'Hard', 'Second-lowest-achievement region?', 'Chattogram', 'Revenue / target, ranked ascending.', kind='text'),
    q('10', 'Hard', 'How many dealers reach at least 80% of revenue, starting with highest revenue?', 17, 'Pivot by dealer, sort descending and compute cumulative percentage.'),
    q('11', 'Hard', 'Use the Monthly Summary tab. Which month has the largest month-over-month drop? Enter YYYY-MM.', '2026-06', 'Compare Feb–Jun growth rates.', kind='text'),
]

aptitude_questions = [
    q('1', 'Easy', '20% of 450?', 90, '450 × 0.2.'),
    q('2', 'Easy', '800 increased by 15%?', 920, '800 × 1.15.'),
    q('3a', 'Easy', 'Divide 640 in ratio 3:5. Smaller part?', 240, '640 × 3 / 8.'),
    q('3b', 'Easy', 'Divide 640 in ratio 3:5. Larger part?', 400, '640 × 5 / 8.'),
    q('4', 'Easy', 'Average of 12, 18, 24, 30, 36?', 24, 'Sum / 5.'),
    q('5', 'Easy', 'Simplify 48/72. Enter =2/3 or a decimal to 4 places.', 2 / 3, '48/72 = 2/3 ≈ 0.6667.', tolerance=0.001),
    q('6', 'Medium', 'Cost price 800, selling price 920. Profit %?', 15, '(920 − 800) / 800 × 100.'),
    q('7', 'Medium', 'Marked price 1,500, discount 12%. Selling price?', 1320, '1,500 × 0.88.'),
    q('8', 'Medium', 'Successive discounts 10% and 20%. Equivalent discount %?', 28, '(1 − 0.9 × 0.8) × 100.'),
    q('9', 'Medium', 'A takes 12 days, B 6 days. Together: how many days?', 4, '1 / (1/12 + 1/6).'),
    q('10', 'Medium', 'Sales rose from 250 to 300. Increase %?', 20, '(300 − 250) / 250 × 100.'),
    q('11', 'Hard', 'Sales fall 20%, then rise 25%. Net change %?', 0, '(0.8 × 1.25 − 1) × 100.'),
    q('12', 'Hard', '1,000,000 grows 10% annually for 2 years. Final amount?', 1210000, '1,000,000 × 1.1².'),
    q('13', 'Hard', '2,000,000 less 5% trade discount then 2% cash discount. Pay?', 1862000, '2,000,000 × 0.95 × 0.98.'),
    q('14', 'Hard', 'Next: 2, 6, 18, 54, ?', 162, 'Multiply by 3.'),
    q('15', 'Hard', 'Next: 3, 8, 15, 24, 35, ?', 48, 'Differences are 5, 7, 9, 11, 13.'),
    q('16a', 'Hard', 'Jan 120, Feb 150, Mar 135. February growth %?', 25, '(150 − 120) / 120 × 100.'),
    q('16b', 'Hard', 'Same case: March change %? Use a negative number for a decrease.', -10, '(135 − 150) / 150 × 100.'),
    q('16c', 'Hard', 'Same case: 3-month average?', 135, '(120 + 150 + 135) / 3.'),
]


def make_excel():
    book = workbook()
    intro(book, 'EXCEL PRACTICE WORKBOOK', [
        ('1 · Learn', 'Work through the eight guided steps on the website, then use the Step Practice tab.'),
        ('2 · Prepare', 'Orders contains 300 fictional records. In Orders!I2 enter =F2*G2*(1-H2/100), then fill down to I301.'),
        ('3 · Practice', 'Enter answers or formulas in yellow cells on Step Practice and Exam Practice. Use Dealers and Targets for lookups and achievement.'),
        ('4 · Check', 'The Check column evaluates answers when your spreadsheet recalculates. Enter percentages as numbers: 86.4 means 86.4%, not 0.864.'),
        ('5 · Review', 'The Answer Key is visible on a separate tab. Try the questions before looking; the workbook does not submit or save answers online.'),
    ])
    keys = []
    practice(book, 'Step Practice', 'Practice the 8 Excel lessons. Yellow = enter your answer; calculate Amount first.', excel_steps, keys)
    practice(book, 'Exam Practice', 'Dataset exercises E1–H4. Enter percentages as whole percentage points (86.4 means 86.4%).', excel_exam, keys)
    data_sheet(book, 'Orders', orders, ['order_id', 'date', 'dealer', 'region', 'product', 'qty', 'unit_price', 'discount_pct'], blank_amount=True)
    data_sheet(book, 'Dealers', dealers, ['dealer', 'region', 'credit_limit', 'outstanding', 'days_overdue'])
    data_sheet(book, 'Targets', targets, ['region', 'target'])
    answer_key(book, keys)
    book.save(OUTPUT / 'excel-practice.xlsx')


def make_reporting():
    book = workbook()
    intro(book, 'SALES REPORTING PRACTICE', [
        ('1 · Work the KPIs', 'Open KPI Practice and enter a number or spreadsheet formula in each yellow answer cell.'),
        ('2 · Use the data', 'Orders has 300 fictional records with an Amount formula already filled. Targets contains each regional goal.'),
        ('3 · Build summaries', 'Use the Regional Summary and Monthly Summary tabs to practice your own SUMIF or pivot calculations. Yellow cells are blank on purpose.'),
        ('4 · Check', 'The Check column evaluates answers when your spreadsheet recalculates. Enter percentages as numbers: 86 means 86%, not 0.86.'),
        ('5 · Review', 'Open Answer Key after trying. Finish with a short report: headline, 5 KPIs, 3 risks and 3 actions.'),
    ])
    keys = []
    practice(book, 'KPI Practice', 'Enter results or formulas in yellow. Percentages use percentage points: 86 means 86%.', kpi_questions, keys)
    summary_sheet(book, 'Regional Summary', ['Region', 'Target', 'Revenue (your formula)', 'Achievement % (your formula)'], [(r['region'], int(r['target']), None, None) for r in targets], [20, 20, 27, 33])
    summary_sheet(book, 'Monthly Summary', ['Month', 'Revenue (your formula)', 'MoM growth % (your formula)', 'Notes'], [(f'2026-{i:02d}', None, None if i > 1 else 'Baseline', None) for i in range(1, 7)], [18, 27, 30, 27])
    data_sheet(book, 'Orders', orders, ['order_id', 'date', 'dealer', 'region', 'product', 'qty', 'unit_price', 'discount_pct'], with_amount=True)
    data_sheet(book, 'Targets', targets, ['region', 'target'])
    answer_key(book, keys)
    book.save(OUTPUT / 'sales-reporting-practice.xlsx')


def make_aptitude():
    book = workbook()
    intro(book, 'APTITUDE PRACTICE WORKBOOK', [
        ('1 · Set a timer', 'Try the Easy, Medium and Hard questions on Aptitude Practice. The answers match the existing topic 04 tasks.'),
        ('2 · Work it out', 'Use the yellow cells for an answer or an Excel formula. Some multi-part questions have one row per answer.'),
        ('3 · Percentages', 'Enter the number of percentage points: 15 means 15%, not 0.15. For a negative change, enter a negative number.'),
        ('4 · Check', 'The Check column evaluates answers when your spreadsheet recalculates. Try the exercises before opening Answer Key.'),
        ('5 · Build speed', 'Retry the hard questions without formulas, then take the mock exam under timed conditions.'),
    ])
    keys = []
    practice(book, 'Aptitude Practice', 'Enter your answer or formula in yellow; enter percentages as numbers (15 means 15%).', aptitude_questions, keys)
    answer_key(book, keys)
    book.save(OUTPUT / 'aptitude-practice.xlsx')


if __name__ == '__main__':
    OUTPUT.mkdir(parents=True, exist_ok=True)
    make_excel()
    make_reporting()
    make_aptitude()
    print(f'Created three practice workbooks in {OUTPUT}')
