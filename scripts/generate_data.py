"""Generates the fictional practice data + answer key used by 01-excel.
Run from repo root:  python scripts/generate_data.py
All dealer names and numbers are FICTIONAL practice data."""
import random, json, datetime as dt
import pandas as pd

random.seed(2026)
regions = ["Dhaka", "Chattogram", "Khulna", "Rajshahi", "Sylhet", "Barishal"]
names = ["Rahman Traders", "Alam Paints House", "Karim Enterprise", "Hossain Color Center",
         "Islam Hardware", "Mia & Sons", "Noor Trading", "Sultana Paints", "Uddin Brothers",
         "Chowdhury Color Point", "Biswas Store", "Das Paints Corner", "Roy Enterprise",
         "Ahmed Decor", "Khan Traders", "Sarker Hardware", "Paul Color House", "Haque Paints",
         "Mondol Enterprise", "Akter Trading", "Majumder Store", "Bhuiyan Paints",
         "Talukder Color Mart", "Saha Traders"]
dealers = []
for i, n in enumerate(names):
    limit = random.choice([300000, 500000, 800000, 1000000, 1500000])
    dealers.append({"dealer": n, "region": regions[i // 4], "credit_limit": limit,
                    "outstanding": int(limit * random.uniform(0.2, 1.05) // 1000 * 1000),
                    "days_overdue": random.choice([0, 0, 0, 10, 25, 35, 45, 70])})
dd = pd.DataFrame(dealers)

products = {"Exterior Emulsion": 1850, "Interior Emulsion": 1450, "Primer": 980,
            "Wall Putty": 1100, "Enamel": 1350, "Wood Polish": 1600}
rows = []
start = dt.date(2026, 1, 1)
for k in range(300):
    d = dd.iloc[random.randrange(len(dd))]
    p = random.choice(list(products))
    rows.append({"date": (start + dt.timedelta(days=random.randint(0, 180))).isoformat(),
                 "dealer": d.dealer, "region": d.region, "product": p,
                 "qty": random.randint(5, 120), "unit_price": products[p],
                 "discount_pct": random.choice([0, 2, 5, 8, 10, 12, 15])})
so = pd.DataFrame(rows).sort_values("date").reset_index(drop=True)
so.insert(0, "order_id", [f"SO-{1001+i}" for i in range(len(so))])

so["amount"] = so.qty * so.unit_price * (1 - so.discount_pct / 100)
rev_region = so.groupby("region").amount.sum()
tg = pd.DataFrame({"region": regions,
                   "target": [int(round(rev_region[r] * random.uniform(0.9, 1.25) / 100000) * 100000) for r in regions]})

so.drop(columns="amount").to_csv("data/sales_orders.csv", index=False)
dd.to_csv("data/dealers.csv", index=False)
tg.to_csv("data/targets.csv", index=False)

ach = (rev_region / tg.set_index("region").target * 100)
so["month"] = so.date.str[:7]
dealer_pick = dd.dealer[5]
key = {
 "E1": int(len(so)),
 "E2": int(so.qty.sum()),
 "E3": round(float(so.amount.sum()), 2),
 "E4": round(float(so.discount_pct.mean()), 2),
 "E5": int((so.region == "Dhaka").sum()),
 "M1": round(float(so[so.region == "Chattogram"].amount.sum()), 2),
 "M2": round(float(so[(so.region == "Dhaka") & (so["product"] == "Exterior Emulsion")].amount.sum()), 2),
 "M3": so.groupby("dealer").amount.sum().idxmax(),
 "M4": int((so.discount_pct > 10).sum()),
 "M5": int(dd.set_index("dealer").loc[dealer_pick, "credit_limit"]),
 "H1": ach.idxmin(),
 "H1_pct": round(float(ach.min()), 1),
 "H2": int((dd.outstanding > 0.8 * dd.credit_limit).sum()),
 "H3": so.groupby("month").amount.sum().idxmax(),
 "H4": int(dd[dd.days_overdue > 30].outstanding.sum()),
 "_M5_dealer": dealer_pick,
}
json.dump(key, open("scripts/answer_key.json", "w"), indent=1)
json.dump({k: None for k in key if not k.startswith("_")}, open("01-excel/my_answers_template.json", "w"), indent=1)
print(json.dumps(key, indent=1)); print(tg)
