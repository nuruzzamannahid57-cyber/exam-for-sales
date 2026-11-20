# 01 · Excel — your most likely practical test 🧮

**Goal:** be fast and accurate with the functions a Sales Admin uses every day.
**Rule:** finish the 🏆 Boss of this topic before opening topic 02.

## Learn it (30 min)
Open `../data/sales_orders.csv` in Excel / Google Sheets, then learn these in order:

| Step | Skill | Try it on the data |
|---|---|---|
| 1 | `SUM`, `AVERAGE`, `COUNT`, `MAX`, `MIN` | total qty |
| 2 | Formulas with `$` (absolute refs) | `=F2*G2*(1-H2/100)` then fill down |
| 3 | `COUNTIF(S)`, `SUMIF(S)` | revenue by region |
| 4 | `IF`, `IFS`, `AND`, `OR` | flag discount > 10% |
| 5 | `VLOOKUP` and `INDEX`+`MATCH` | pull credit limit from `dealers.csv` |
| 6 | Pivot table | revenue by dealer / month |
| 7 | Conditional formatting, filters, sort | highlight overdue dealers |
| 8 | Dates: `MONTH`, `TEXT(date,"yyyy-mm")` | monthly trend |

> 💡 Exam machines may have older Excel. Know `VLOOKUP` and `INDEX/MATCH` even if you love `XLOOKUP`.
> ⌨️ Shortcuts to master: `Ctrl+Shift+L` (filter), `Ctrl+T` (table), `Alt+=` (autosum), `F4` (lock refs), `Ctrl+D` (fill down), `Alt+N+V` (pivot).

## Data files
- `data/sales_orders.csv` — 300 orders (Jan–Jun 2026). **Amount = qty × unit_price × (1 − discount_pct/100)** (you add this column).
- `data/dealers.csv` — credit limit, outstanding, days overdue.
- `data/targets.csv` — H1 target per region (BDT).
*(All names and numbers are fictional.)*

## Tasks → see `tasks.md`
Fill your answers in `my_answers.json` and run `python scripts/check_excel.py` to see ✅ / ❌ and your XP.
