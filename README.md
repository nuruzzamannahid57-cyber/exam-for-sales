# 🎯 Sales Admin Exam Prep — learn fast, learn fun

A step-by-step, game-style study repo for **Sr. Executive / Executive – Sales Admin** written tests and interviews (paints / FMCG / dealer-based sales).

## How the game works
1. Open the topics **in order** (01 → 09). Topics 01–08 have a `README.md` (learn, 15–30 min), `tasks.md` (🟢 Easy → 🟡 Medium → 🔴 Hard → 🏆 Boss), and `solutions.md` (peek **after** trying). Topic 09 contains interview preparation and a mock exam.
2. **Unlock rule:** beat the 🏆 Boss of a topic before starting the next one. Exceptions: take the mock exam as a baseline on day 1 and begin the topic 08 news-summary streak on day 1 so it can finish before topic 09. Topic 04's boss may also use the mock's aptitude questions.
3. Earn XP, tick boxes in [`PROGRESS.md`](PROGRESS.md), level up.
4. For the Excel topic, copy `01-excel/my_answers_template.json` to `01-excel/my_answers.json`, fill in your answers, then run `python scripts/check_excel.py` from the repository root.

| # | Topic | Why |
|---|---|---|
| 01 | [Excel](01-excel) | Most likely practical test |
| 02 | [Order-to-Cash & dealer admin](02-order-to-cash) | The core of the job |
| 03 | [Sales reporting & KPIs](03-sales-reporting-kpis) | Reports, targets, run rates |
| 04 | [Aptitude](04-aptitude) | Speed + accuracy |
| 05 | [Business English](05-english) | Emails, grammar |
| 06 | [ERP / SAP basics](06-erp-sap-basics) | Systems knowledge |
| 07 | [Company & paint industry](07-company-and-paint-industry) | Show you did your homework |
| 08 | [GK & logic](08-gk-and-logic) | Common test section |
| 09 | [Interview + mock exam](09-interview-and-mock-exam) | Final boss |

See [`STUDY-PLAN.md`](STUDY-PLAN.md) for a 7-day and a 14-day schedule.

## Setup
Python 3 is needed for the Excel checker; it uses only the standard library. To optionally regenerate the fictional practice data, install pandas and run:

```bash
python -m pip install pandas
python scripts/generate_data.py
```

The generator overwrites the CSV files, Excel answer key, and answer template.
All dealer names and numbers are **fictional**. Company facts in topic 07 come from public sources — verify on the official website.

## Tests

Run `python -m unittest discover -s tests -v` from the repository root. The checker and data tests need only Python's standard library. The isolated data-generator test is skipped unless pandas is installed; CI runs it with pandas 2.2.3.

## Study website

The repository also includes a static website for browsing the lessons, practice tasks, solutions, study plan, and sample data. Excel's Learn tab has eight guided lessons, each followed by a three-question quiz. The **Practical exam** tab in topics 01 (Excel), 03 (sales reporting) and 04 (aptitude) presents spreadsheet-style formula questions: answer three correctly to unlock the next step, and choose a new set to vary the data and question order. The practice sheet supports a limited set of spreadsheet functions and is not a full Excel replacement. Practical exam unlocks, quiz best scores and manually marked topic completion are stored locally in the browser, not synced between devices. The original Excel dataset exercises and local Python checker remain available.

Download the three `.xlsx` workbooks from those topics or the Resources page. Each has practice questions, yellow answer cells, a check column and a separate answer key; the reporting and Excel files include the fictional sales data. Enter percentages as percentage points (86 means 86%), and open the workbook in Excel or upload it to Google Sheets so formulas recalculate. To regenerate the workbooks after changing the source data, install `openpyxl==3.1.5` and run `python scripts/generate_workbooks.py`.

To run the website locally (Node.js 20.19+ or 22.12+):

```bash
npm ci
npm run dev
```

Run `npm test` to check the step exam content and scoring. To create a production build, run `npm run build`. The output is in `dist/`. For Vercel, import this repository with the repository root as the project root. `vercel.json` specifies the build command and output directory. Changes on a non-production branch must be merged into the configured production branch (normally `main`) before they appear on the production domain; confirm that Vercel creates a new deployment after the merge.
