"""Check your Excel answers.  Usage (from repo root):
    cp 01-excel/my_answers_template.json 01-excel/my_answers.json   # fill in your answers
    python scripts/check_excel.py
Numbers: tolerance 0.5 (percentages 0.1). Text: case-insensitive."""
import json, sys, os
key = json.load(open("scripts/answer_key.json"))
path = "01-excel/my_answers.json"
if not os.path.exists(path):
    sys.exit("Create 01-excel/my_answers.json first (copy my_answers_template.json).")
mine = json.load(open(path))
XP = {"E": 10, "M": 20, "H": 40}
LEVELS = {"E": "🟢 EASY", "M": "🟡 MEDIUM", "H": "🔴 HARD"}
total = 0
for lv in "EMH":
    print(f"\n{LEVELS[lv]}")
    for k in [k for k in key if k.startswith(lv) and not k.endswith("_pct")]:
        a, ok = mine.get(k), False
        if a is not None:
            if isinstance(key[k], str):
                ok = str(a).strip().lower() == key[k].lower()
            else:
                ok = abs(float(a) - key[k]) <= 0.5
            if k == "H1":  # need name AND percentage
                ok = ok and mine.get("H1_pct") is not None and abs(float(mine["H1_pct"]) - key["H1_pct"]) <= 0.1
        print(f"  {k}: {'✅ correct' if ok else '❌ not yet'}")
        total += XP[lv] if ok else 0
print(f"\nXP from Excel tasks: {total} / {sum(XP[k[0]] for k in key if k[0] in XP and not k.endswith('_pct') and not k.startswith('_'))}")
print("Stuck? Read 01-excel/solutions.md AFTER trying for 10 minutes.")
