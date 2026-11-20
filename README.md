# 🎯 Sales Admin Exam Prep — learn fast, learn fun

A step-by-step, game-style study repo for **Sr. Executive / Executive – Sales Admin** written tests and interviews (paints / FMCG / dealer-based sales).

## How the game works
1. Open the topics **in order** (01 → 09). Topics 01–08 have a `README.md` (learn, 15–30 min), `tasks.md` (🟢 Easy → 🟡 Medium → 🔴 Hard → 🏆 Boss), and `solutions.md` (peek **after** trying). Topic 09 contains interview preparation and a mock exam.
2. **Unlock rule:** beat the 🏆 Boss of a topic before starting the next one.
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
