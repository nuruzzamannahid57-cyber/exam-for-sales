// The eight lessons follow the Excel learning path in 01-excel/README.md.
// Quiz answers are zero-based option indexes; explanations are shown after submission.
export const excelLessons = [
  {
    id: 'functions', title: 'Essential functions', subtitle: 'SUM, AVERAGE, COUNT, MAX & MIN',
    lesson: `### What you will learn
Functions summarize a range of cells. In **sales_orders.csv**, column F is quantity and rows 2–301 contain the 300 orders.

### Step by step
1. Open the sales orders CSV in Excel or Google Sheets.
2. In an empty cell, type \`=SUM(F2:F301)\` and press Enter to find the total quantity.
3. Try \`=AVERAGE(F2:F301)\`, \`=MAX(F2:F301)\` and \`=MIN(F2:F301)\` to understand a typical order and the extremes.
4. Use \`=COUNT(F2:F301)\` to count numeric quantities. **COUNT** ignores text and blank cells; use **COUNTA** when you want to count non-empty text or numbers.

**Try it:** Calculate the total quantity, then compare it with E2 in the existing Practice tasks. Select only the data rows, not the header.`,
    questions: [
      { prompt: 'Which formula adds the quantities in cells F2 through F301?', options: ['=SUM(F2:F301)', '=COUNT(F2:F301)', '=MAX(F2:F301)'], answer: 0, explanation: 'SUM adds the numbers in the specified range.' },
      { prompt: 'What does COUNT count in a range?', options: ['Only text values', 'Numeric values', 'All formatting'], answer: 1, explanation: 'COUNT counts cells containing numbers; COUNTA counts non-empty cells.' },
      { prompt: 'Which function finds the largest quantity?', options: ['MIN', 'AVERAGE', 'MAX'], answer: 2, explanation: 'MAX returns the largest numeric value in a range.' },
    ],
  },
  {
    id: 'references', title: 'Formulas & cell references', subtitle: 'Calculate revenue and lock a reference',
    lesson: `### What you will learn
A formula starts with \`=\`. A relative reference such as \`F2\` moves as you fill the formula down; an absolute reference such as \`$J$1\` stays fixed.

### Step by step
1. In the sales orders sheet, put **Amount** in I1. The CSV has quantity in F, unit price in G and discount percentage in H.
2. In I2, type \`=F2*G2*(1-H2/100)\`. The discount is stored as a number such as 10, so divide by 100.
3. Fill I2 down through I301. Relative references change to F3, G3 and H3 on the next row.
4. If you keep a shared tax rate in J1, use \`$J$1\` in a formula so that copying it down still points to J1. F4 cycles reference types in Excel while editing a reference.

**Try it:** For 10 units at 100 each with a 10% discount, the amount is 900 before tax. Check your formula with a small example before filling down.`,
    questions: [
      { prompt: 'Which reference stays fixed in both row and column when copied?', options: ['J1', '$J$1', 'J$1'], answer: 1, explanation: '$J$1 locks both the column and the row.' },
      { prompt: 'What happens to F2 when its formula is copied one row down?', options: ['It becomes F3', 'It remains F2', 'It becomes G2'], answer: 0, explanation: 'F2 is a relative reference, so its row moves down to 3.' },
      { prompt: 'What is the discounted amount for 10 units at 100 with a 10% discount?', options: ['1,000', '990', '900'], answer: 2, explanation: '10 × 100 × (1 − 10/100) = 900.' },
    ],
  },
  {
    id: 'conditional-sums', title: 'Conditional sums & counts', subtitle: 'COUNTIF, COUNTIFS, SUMIF & SUMIFS',
    lesson: `### What you will learn
Conditional functions answer questions about selected rows. **COUNTIF** counts with one condition; **COUNTIFS** accepts multiple conditions. **SUMIF** and **SUMIFS** add values that meet conditions.

### Step by step
1. After adding Amount in column I, count Dhaka orders with \`=COUNTIF(D2:D301,"Dhaka")\`.
2. Add Dhaka revenue with \`=SUMIF(D2:D301,"Dhaka",I2:I301)\`.
3. For Dhaka exterior emulsion revenue, use \`=SUMIFS(I2:I301,D2:D301,"Dhaka",E2:E301,"Exterior Emulsion")\`.
4. Check that the sum range and each criteria range cover the same rows. SUMIFS begins with the **sum range**, followed by criteria-range/criterion pairs.

**Try it:** Compare your Dhaka exterior revenue with M2 in Practice tasks. Spreadsheet locales may require semicolons instead of commas.`,
    questions: [
      { prompt: 'Which function counts rows matching more than one condition?', options: ['SUM', 'COUNTIFS', 'AVERAGE'], answer: 1, explanation: 'COUNTIFS can apply several criteria to corresponding ranges.' },
      { prompt: 'What is the first argument of SUMIFS?', options: ['The sum range', 'The first criterion', 'The workbook name'], answer: 0, explanation: 'SUMIFS starts with the range whose values will be added.' },
      { prompt: 'Which condition counts discounts strictly above 10?', options: ['"<10"', '"=10"', '">10"'], answer: 2, explanation: 'The > operator means strictly greater than, excluding 10 itself.' },
    ],
  },
  {
    id: 'logic', title: 'Logical formulas', subtitle: 'IF, IFS, AND & OR',
    lesson: `### What you will learn
Logical formulas test conditions and return results. **IF** chooses between two outcomes; **AND** requires every condition to be true, while **OR** requires at least one.

### Step by step
1. Add a new column called **Discount flag**.
2. In row 2, enter \`=IF(H2>10,"Review","OK")\`, then fill down. A discount of exactly 10 is OK because the test is strictly greater than 10.
3. Combine conditions with \`=IF(AND(D2="Dhaka",H2>10),"Review","OK")\`. Both conditions must be true.
4. Replace AND with OR when either condition should trigger the flag. IFS can test several conditions in order, returning the value for the first true condition.

**Try it:** Filter the Review flags and compare the number of discounts above 10 with M4 in Practice tasks.`,
    questions: [
      { prompt: 'What does =IF(H2>10,"Review","OK") return when H2 is 10?', options: ['Review', 'OK', '10'], answer: 1, explanation: '10 is not greater than 10, so the false result is OK.' },
      { prompt: 'When is AND(condition1, condition2) true?', options: ['When both conditions are true', 'When either condition is true', 'When neither is true'], answer: 0, explanation: 'AND requires every supplied condition to be true.' },
      { prompt: 'Which function is useful when either of two conditions should trigger a flag?', options: ['MIN', 'OR', 'COUNT'], answer: 1, explanation: 'OR is true if at least one condition is true.' },
    ],
  },
  {
    id: 'lookup', title: 'Look up dealer information', subtitle: 'VLOOKUP and INDEX + MATCH',
    lesson: `### What you will learn
Lookups find a matching key, such as a dealer name, and return a related value, such as its credit limit. In **dealers.csv**, column A is dealer and column C is credit limit.

### Step by step
1. Open the dealers CSV in a separate sheet named \`dealers\` in your workbook. Make sure the names match, including spaces.
2. Use \`=VLOOKUP("Mia & Sons",dealers!A2:C25,3,FALSE)\` to find the exact dealer name in the first column and return the third column.
3. Alternatively, use \`=INDEX(dealers!C2:C25,MATCH("Mia & Sons",dealers!A2:A25,0))\`. MATCH finds the position and INDEX returns the corresponding credit limit.
4. Lock a lookup range with dollar signs if you intend to copy the formula. If you see #N/A, check the spelling, spaces and the exact-match argument.

**Try it:** Look up Mia & Sons and compare the result with M5 in Practice tasks. VLOOKUP searches the first column of its table and returns values to its right.`,
    questions: [
      { prompt: 'Which VLOOKUP argument requests an exact match?', options: ['TRUE', 'FALSE', '3'], answer: 1, explanation: 'FALSE (or 0) requests an exact match.' },
      { prompt: 'What does MATCH return?', options: ['The position of a matching value', 'The total of a range', 'A cell color'], answer: 0, explanation: 'MATCH returns the position within the specified lookup range.' },
      { prompt: 'Why might a dealer lookup return #N/A?', options: ['The name or spacing does not match', 'The font is too small', 'The sheet has headings'], answer: 0, explanation: 'An exact lookup fails when the key is not found, including because of spelling or spacing differences.' },
    ],
  },
  {
    id: 'pivots', title: 'Build a pivot table', subtitle: 'Summarize revenue by dealer and month',
    lesson: `### What you will learn
A pivot table groups and summarizes a dataset without changing the original rows. You can arrange fields as rows, columns, filters or values.

### Step by step
1. Add and fill the Amount column from step 2. Select the complete orders table, including headings.
2. In Excel, choose **Insert → PivotTable**, then place it on a new worksheet. In Google Sheets, use **Insert → Pivot table**.
3. Drag **dealer** into Rows and **Amount** into Values. Make sure the value summary is **Sum**, not Count.
4. Sort the totals largest to smallest to find the top dealer. For a monthly view, group valid dates by month in Excel or create a month helper column with \`=TEXT(B2,"yyyy-mm")\` and pivot that field.
5. Refresh or recreate the pivot after changing the source data; check that its source includes any new rows.

**Try it:** Identify the top dealer and compare with M3 in Practice tasks.`,
    questions: [
      { prompt: 'Which pivot area should contain dealer names when listing revenue per dealer?', options: ['Rows', 'Values', 'A worksheet title'], answer: 0, explanation: 'Dealer in Rows groups the source rows by dealer.' },
      { prompt: 'How should the Amount field be summarized to calculate revenue?', options: ['Count', 'Sum', 'Text'], answer: 1, explanation: 'Sum adds the Amount values for each group.' },
      { prompt: 'What should you do after changing the pivot source data?', options: ['Assume the pivot always updates', 'Refresh the pivot and check its source range', 'Delete the original data'], answer: 1, explanation: 'Refresh the pivot and verify that the source range includes the relevant rows.' },
    ],
  },
  {
    id: 'visuals', title: 'Highlight, filter & sort', subtitle: 'Find overdue dealers quickly',
    lesson: `### What you will learn
**Conditional formatting** highlights cells that meet a rule. **Filters** temporarily show matching rows; **sorting** rearranges rows in a chosen order.

### Step by step
1. Open dealers.csv. Column E contains days overdue; select the data cells E2:E25.
2. Choose **Conditional Formatting → Highlight Cells Rules → Greater Than** and enter 30. Choose a visible format; 30 itself is not greater than 30.
3. Turn on a filter for the entire table. Filter days overdue to values greater than 30 to inspect the exceptions.
4. Sort the whole table by days overdue, largest to smallest. Keep the rows together so a dealer's name and balance stay matched.
5. Clear the filter when finished; filtering hides rows but does not delete them.

**Try it:** How many days overdue is Alam Paints House? Use the highlight and filter to find its row.`,
    questions: [
      { prompt: 'Which value matches a rule of days overdue > 30?', options: ['30', '31', '0'], answer: 1, explanation: '31 is greater than 30; 30 itself is excluded.' },
      { prompt: 'What does filtering a table do?', options: ['Deletes non-matching records', 'Temporarily hides non-matching rows', 'Changes the underlying amounts'], answer: 1, explanation: 'Filtering hides rows from view; it does not delete them.' },
      { prompt: 'Why sort the whole table rather than only the overdue column?', options: ['To keep each dealer and its values together', 'To erase duplicate dealers', 'To convert numbers to text'], answer: 0, explanation: 'Sorting the full table preserves the relationship between columns in each row.' },
    ],
  },
  {
    id: 'dates', title: 'Work with dates', subtitle: 'MONTH, TEXT and monthly trends',
    lesson: `### What you will learn
Real spreadsheet dates can be grouped by month. A month helper column makes a monthly sales trend easier to summarize in a pivot table.

### Step by step
1. Check that the order dates in column B are recognized as dates. Imported CSV dates may need conversion; a format change alone does not turn text into a date.
2. To extract the month number, use \`=MONTH(B2)\`. For January this returns 1.
3. To group different years separately, add a helper column with \`=TEXT(B2,"yyyy-mm")\` and fill it down. A valid date in March 2026 becomes \`2026-03\`.
4. Create a pivot with the helper column in Rows and Amount summed in Values. Sort the year-month labels in ascending order.
5. Insert a line chart from the monthly summary to see the trend. Check for missing months and verify any apparent spikes.

**Try it:** Find the highest-revenue month and compare it with H3 in Practice tasks.`,
    questions: [
      { prompt: 'What does MONTH return for a valid date in January?', options: ['1', '2026-01', 'January revenue'], answer: 0, explanation: 'MONTH returns a month number between 1 and 12.' },
      { prompt: 'Why use a year-month helper instead of only a month number?', options: ['It separates the same month in different years', 'It removes all missing data', 'It converts amounts into dates'], answer: 0, explanation: 'A label such as 2026-03 distinguishes March 2026 from March in another year.' },
      { prompt: 'What should you check if imported dates do not work in date formulas?', options: ['Whether they are real date values rather than text', 'Whether the column is colored green', 'Whether the sheet has a chart'], answer: 0, explanation: 'A date-looking text string may need conversion before date functions work correctly.' },
    ],
  },
];

export function gradeQuiz(questions, answers) {
  if (answers.length !== questions.length || questions.some((question, index) => !Number.isInteger(answers[index]) || answers[index] < 0 || answers[index] >= question.options.length)) {
    throw new Error('Answer every question before submitting.');
  }
  return questions.reduce((score, question, index) => score + (answers[index] === question.answer ? 1 : 0), 0);
}
