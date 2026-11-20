# 01 · Excel solutions (try first! 🙈)

| Task | Answer | One way to do it |
|---|---|---|
| E1 | 300 | `=COUNTA(A2:A301)` |
| E2 | 18930 | `=SUM(F2:F301)` |
| E3 | 23,872,485.80 | `=SUM(I2:I301)` (Amount in col I) |
| E4 | 7.59 | `=AVERAGE(H2:H301)` |
| E5 | 47 | `=COUNTIF(D2:D301,"Dhaka")` |
| M1 | 4,496,111.80 | `=SUMIFS(I:I,D:D,"Chattogram")` |
| M2 | 766,362.50 | `=SUMIFS(I:I,D:D,"Dhaka",E:E,"Exterior Emulsion")` |
| M3 | Paul Color House | Pivot: Rows = dealer, Values = sum of Amount, sort desc |
| M4 | 87 | `=COUNTIF(H:H,">10")` |
| M5 | 300000 | `=INDEX(dealers!C:C,MATCH("Mia & Sons",dealers!A:A,0))` |
| H1 | Rajshahi (86.4%) | Pivot revenue by region, then `=revenue/target*100` for each |
| H2 | 8 | helper col `=D2/C2>0.8`, then `COUNTIF(...,TRUE)` |
| H3 | 2026-05 | helper col `=TEXT(B2,"yyyy-mm")`, then pivot |
| H4 | 4558000 | `=SUMIFS(D:D,E:E,">30")` on dealers sheet |

**Common mistakes:** forgetting `,0` in `MATCH`; text dates (use Data → Text to Columns); not locking ranges with `F4`; summing a column that includes the header.
