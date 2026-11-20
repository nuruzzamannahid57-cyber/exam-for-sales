# 06 · ERP & SAP Basics 🖥️

An **ERP** keeps sales, stock, finance and purchasing in *one* system, so one entry updates everywhere.
(The company publicly announced a SAP implementation in 2023 — know the basics, not the buttons.)

## SAP Sales & Distribution (SD) flow
```
Inquiry → Quotation → Sales Order → Delivery → Picking → Goods Issue → Billing → Payment (FI)
            (VA01)               (VL01N)                         (VF01)
```
## Useful transaction codes (bonus knowledge)
| Code | Use |
|---|---|
| VA01 / VA02 / VA03 | Create / change / display sales order |
| VL01N | Create outbound delivery |
| VF01 | Create billing document (invoice) |
| FD32 | Change customer credit limit |
| VKM1 | Release sales documents blocked for credit |
| MMBE | Stock overview |
| MIGO | Goods movement (receipt/issue) |
| XD01 / XD02 | Create / change customer master (central) |

## Core ideas
**Master data** (customers, materials, prices — rarely changes) vs **transaction data** (orders, invoices — changes daily) · **Document flow** (every document links to the previous) · **Credit block** · **Pricing conditions** (price, discount, tax) · **Plant / storage location**.
> Codes can differ by company configuration — the concept matters more than the code.
