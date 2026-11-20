# 01 · Excel tasks (easy → hard)

Add an **Amount** column first: `=qty*unit_price*(1-discount_pct/100)`.
Answers go in `my_answers.json` (copy `my_answers_template.json`). Use plain numbers, no commas; leave unanswered fields as `null`. Counts, the average discount rounded to two decimals, and other exact numbers must match exactly. Revenue answers allow a 0.01 BDT rounding difference; H1's percentage allows 0.1 percentage points. Text is case-insensitive. The checker reports invalid values next to the affected question.

## 🟢 Easy (10 XP each)
- **E1** How many orders are in the file?
- **E2** Total quantity ordered?
- **E3** Total revenue (sum of Amount), 2 decimals?
- **E4** Average discount %, 2 decimals?
- **E5** How many orders came from **Dhaka**?

## 🟡 Medium (20 XP each)
- **M1** Revenue from **Chattogram** (use `SUMIFS`)?
- **M2** Revenue of **Exterior Emulsion** in **Dhaka** (`SUMIFS` with 2 conditions)?
- **M3** Which dealer has the highest total revenue? (pivot table or `SUMIF` + `MAX`)
- **M4** How many orders have discount **above 10%**?
- **M5** Using `INDEX/MATCH` or `VLOOKUP` on `dealers.csv`: credit limit of **Mia & Sons**?

## 🔴 Hard (40 XP each)
- **H1** Achievement % = region revenue ÷ target × 100 (`targets.csv`). Which region is **lowest**, and what is its % (1 decimal)? Fill `H1` (name) and `H1_pct`.
- **H2** How many dealers have outstanding **> 80% of credit limit**?
- **H3** Which month has the highest revenue? (answer like `2026-03`)
- **H4** Total outstanding of dealers whose `days_overdue` is **> 30**?

## 🏆 Boss level (100 XP, self-checked)
Build a one-sheet **Sales Dashboard** with: total revenue, revenue by region vs target (achievement %), top 5 dealers, monthly trend chart, and a red highlight on dealers over 80% credit use. Time yourself — **under 25 minutes** = boss defeated.
