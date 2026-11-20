// Questions use small fictional tables. Each retry changes the values and order.
const sheet = (rows) => {
  const grid = rows.map((row) => [...row, ...Array(4 - row.length).fill('')]);
  while (grid.length < 5) grid.push(['', '', '', '']);
  return grid;
};
const q = (prompt, rows, expected, hint, solution) => ({ prompt, grid: sheet(rows), expected, hint, solution });
const amount = (n) => {
  const qty = n + 2, price = 100 + n * 10, discount = (n % 3 + 1) * 5;
  return q('Calculate the amount after the discount.', [['Quantity','Unit price','Discount %'],[qty,price,discount]], qty * price * (1 - discount / 100), 'Multiply quantity by price, then apply the percentage discount.', '=A2*B2*(1-C2/100)');
};
const gross = (n) => {
  const qty = n + 4, price = 120 + n * 10;
  return q('Calculate the gross order value before any discount.', [['Quantity','Unit price'],[qty,price]], qty*price, 'Multiply quantity by unit price.', '=A2*B2');
};
const discountValue = (n) => {
  const qty = n + 3, price = 100 + n * 10, discount = (n % 3 + 1) * 5;
  return q('Calculate the discount amount, not the final order value.', [['Quantity','Unit price','Discount %'],[qty,price,discount]], qty*price*discount/100, 'Multiply the gross amount by the discount percentage.', '=A2*B2*C2/100');
};
const aggregate = (n, operation) => {
  const values = [n + 3, n + 7, n + 11];
  const answers = { SUM: values.reduce((a,b) => a+b,0), AVERAGE: values.reduce((a,b)=>a+b,0)/3, MAX: Math.max(...values), MIN: Math.min(...values) };
  const labels = { SUM:'total', AVERAGE:'average', MAX:'largest value', MIN:'smallest value' };
  return q(`Calculate the ${labels[operation]} of the three quantities.`, [['Quantity'], ...values.map((x) => [x])], answers[operation], `Use ${operation} on the range A2:A4.`, `=${operation}(A2:A4)`);
};
const conditions = (n, mode) => {
  const amounts = [n*10+20,n*10+30,n*10+40,n*10+50];
  const rows = [['Region','Revenue'],['Dhaka',amounts[0]],['Khulna',amounts[1]],['Dhaka',amounts[2]],['Sylhet',amounts[3]]];
  if (mode === 'sum') return q('Calculate total revenue for Dhaka only.', rows, amounts[0]+amounts[2], 'SUMIF can add B2:B5 when A2:A5 matches "Dhaka".', '=SUMIF(A2:A5,"Dhaka",B2:B5)');
  if (mode === 'count') return q('Count how many rows are for Dhaka.', rows, 2, 'Use COUNTIF with the region range and "Dhaka".', '=COUNTIF(A2:A5,"Dhaka")');
  return q('Calculate total revenue for Khulna only.', rows, amounts[1], 'Use SUMIF with "Khulna" as the criterion.', '=SUMIF(A2:A5,"Khulna",B2:B5)');
};
const threshold = (n, type) => {
  const value=n+10, limit=20, label=value>limit?'Review':'OK';
  if (type === 'and') return q('Return "Review" if the amount is above the limit AND the order is in Dhaka; otherwise return "OK".', [['Amount','Limit','Region'],[value,limit,'Dhaka']], label, 'Combine IF with AND.', '=IF(AND(A2>B2,C2="Dhaka"),"Review","OK")');
  if (type === 'or') return q('Return "Review" if the amount is above the limit OR the order is in Dhaka; otherwise return "OK".', [['Amount','Limit','Region'],[value,limit,'Khulna']], label, 'Combine IF with OR.', '=IF(OR(A2>B2,C2="Dhaka"),"Review","OK")');
  return q('Return "Review" if the amount is strictly above the limit; otherwise return "OK".', [['Amount','Limit'],[value,limit]], label, 'Use IF with a > comparison.', '=IF(A2>B2,"Review","OK")');
};
const lookup = (n, index) => {
  const names=['Alam','Mia','Noor'], values=[(n+1)*1000,(n+3)*1000,(n+5)*1000], field=['credit limit','outstanding balance','sales target'][index];
  return q(`Find ${names[index]}'s ${field} using an exact lookup.`, [['Dealer',field],...names.map((x,i)=>[x,values[i]])], values[index], 'Use VLOOKUP with A2:B4, column 2 and FALSE for an exact match.', `=VLOOKUP("${names[index]}",A2:B4,2,FALSE)`);
};
const overdue = (n, limit) => {
  const vals=[n, n+10, n+20, n+30];
  return q(`Count dealers with overdue days strictly greater than ${limit}.`, [['Days overdue'],...vals.map(x=>[x])], vals.filter(x=>x>limit).length, `Use COUNTIF with the criterion ">${limit}".`, `=COUNTIF(A2:A5,">${limit}")`);
};
const overdueFlag = (n) => {
  const days=n+10, limit=30;
  return q('Flag the dealer as "Overdue" when days are greater than the limit; otherwise return "OK".', [['Days overdue','Limit'],[days,limit]], days>limit?'Overdue':'OK', 'Use IF with a greater-than comparison.', '=IF(A2>B2,"Overdue","OK")');
};
const overdueMax = (n) => {
  const values=[n,n+10,n+20,n+30];
  return q('Find the highest number of overdue days in the list.', [['Days overdue'],...values.map(x=>[x])], Math.max(...values), 'Use MAX on A2:A5.', '=MAX(A2:A5)');
};
const dateQuestion = (n, offset) => {
  const month=(n+offset)%12+1, date=`2026-${String(month).padStart(2,'0')}-15`;
  return q('Find the month number of the date in A2.', [['Order date'],[date]], month, 'Use MONTH on A2.', '=MONTH(A2)');
};
const dateHalf = (n) => {
  const month=n%12+1, date=`2026-${String(month).padStart(2,'0')}-15`;
  return q('Return "H1" for January–June and "H2" for July–December.', [['Order date'],[date]], month<=6?'H1':'H2', 'Use IF with MONTH(A2) <= 6.', '=IF(MONTH(A2)<=6,"H1","H2")');
};
const dateCount = (n) => {
  const month=n%12+1, date=`2026-${String(month).padStart(2,'0')}-15`, other=`2026-${String(month%12+1).padStart(2,'0')}-15`;
  return q('Count how many orders have the same date as the date in B2.', [['Order date','Date to find'],[date,date],[other,''],[date,'']], 2, 'Use COUNTIF(A2:A4,B2).', '=COUNTIF(A2:A4,B2)');
};
const ratio = (n, kind) => {
  if(kind==='achievement') {const actual=(n+10)*1000,target=(n+20)*1000;return q('Calculate achievement as percentage points: actual / target × 100.',[['Actual','Target'],[actual,target]],actual/target*100,'Divide actual by target and multiply by 100.','=A2/B2*100');}
  if(kind==='contribution') {const part=(n+5)*1000,total=(n+20)*1000;return q('Calculate the region’s contribution as percentage points: region / total × 100.',[['Region sales','Total sales'],[part,total]],part/total*100,'Divide regional sales by total sales and multiply by 100.','=A2/B2*100');}
  if(kind==='targetvariance') {const actual=(n+10)*1000,target=(n+20)*1000;return q('Calculate the sales gap to target (target minus actual).',[['Actual','Target'],[actual,target]],target-actual,'Subtract actual from target.','=B2-A2');}
  if(kind==='growth') {const prev=(n+10)*1000,current=(n+15)*1000;return q('Calculate growth as percentage points: (current − previous) / previous × 100.',[['Previous','Current'],[prev,current]],(current-prev)/prev*100,'Subtract previous from current; divide by previous.','=(B2-A2)/A2*100');}
  if(kind==='collection') {const due=(n+20)*1000,paid=(n+10)*1000;return q('Calculate collection efficiency as percentage points: collected / due × 100.',[['Collected','Due'],[paid,due]],paid/due*100,'Divide collected by due, then multiply by 100.','=A2/B2*100');}
  const delivered=n+10,ordered=n+20;return q('Calculate fill rate as percentage points: delivered / ordered × 100.',[['Delivered','Ordered'],[delivered,ordered]],delivered/ordered*100,'Divide delivered by ordered, then multiply by 100.','=A2/B2*100');
};
const growthDifference=(n)=>{const prev=(n+10)*1000,current=(n+15)*1000;return q('Find the absolute sales increase, not the growth percentage.',[['Previous','Current'],[prev,current]],current-prev,'Subtract previous sales from current sales.','=B2-A2');};
const growthProjection=(n)=>{const prev=(n+10)*1000,rate=10;return q('Calculate sales after the given percentage growth.',[['Previous','Growth %'],[prev,rate]],prev*(1+rate/100),'Multiply previous sales by (1 + growth / 100).','=A2*(1+B2/100)');};
const forecast=(n,mode)=>{const sales=(n+10)*1000,passed=10,total=30,target=(n+30)*1000;
  if(mode==='required')return q('Calculate the daily sales required to reach the target in the remaining days.',[['Sales so far','Target','Days remaining'],[sales,target,total-passed]],(target-sales)/(total-passed),'Subtract sales from target and divide by remaining days.','=(B2-A2)/C2');
  if(mode==='projected')return q('Project month-end sales using the current daily run rate.',[['Sales so far','Days passed','Total days'],[sales,passed,total]],sales/passed*total,'Divide sales by days passed, then multiply by total days.','=A2/B2*C2');
  return q('Calculate the current sales run rate per day.',[['Sales so far','Days passed'],[sales,passed]],sales/passed,'Divide sales by the days passed.','=A2/B2');};
const aptitude=(n,kind)=>{
  if(kind==='percent'){const amount=(n+10)*100, pct=(n%4+1)*5;return q('Calculate the given percentage of the amount.',[['Amount','Percent'],[amount,pct]],amount*pct/100,'Multiply the amount by the percentage, then divide by 100.','=A2*B2/100');}
  if(kind==='discount'){const price=(n+10)*100,pct=(n%4+1)*5;return q('Calculate the price after the discount.',[['Price','Discount %'],[price,pct]],price*(1-pct/100),'Multiply price by (1 − discount / 100).','=A2*(1-B2/100)');}
  if(kind==='ratio' || kind==='ratio-second'){const total=(n+10)*10,a=2,b=3,second=kind==='ratio-second';return q(`Divide the total in the given ratio. Calculate the ${second?'second':'first'} part.`,[['Total','First part','Second part'],[total,a,b]],total*(second?b:a)/(a+b),'Multiply total by the chosen part / (first part + second part).',second?'=A2*C2/(B2+C2)':'=A2*B2/(B2+C2)');}
  if(kind==='ratio-percent'){const a=2,b=3;return q('Calculate the first share as a percentage of both ratio parts combined.',[['First part','Second part'],[a,b]],a/(a+b)*100,'Divide the first part by both parts combined and multiply by 100.','=A2/(A2+B2)*100');}
  if(kind==='average')return aggregate(n,'AVERAGE');
  if(kind==='portion'){const part=(n+5)*100,total=(n+15)*100;return q('What percentage of the total is the part? Enter percentage points.',[['Part','Total'],[part,total]],part/total*100,'Divide the part by total and multiply by 100.','=A2/B2*100');}
  if(kind==='discount-amount'){const price=(n+10)*100,pct=10;return q('Calculate only the discount amount.',[['Price','Discount %'],[price,pct]],price*pct/100,'Multiply price by discount percentage / 100.','=A2*B2/100');}
  if(kind==='two-discounts'){const price=(n+10)*100;return q('Calculate the final price after two successive discounts.',[['Price','First discount %','Second discount %'],[price,10,5]],price*.9*.95,'Apply each discount to the result of the previous one.','=A2*(1-B2/100)*(1-C2/100)');}
  if(kind==='average-two'){const a=n+8,b=n+14;return q('Calculate the average of the two sales values.',[['Sales 1','Sales 2'],[a,b]],(a+b)/2,'Use AVERAGE on A2:B2.','=AVERAGE(A2:B2)');}
  if(kind==='average-four'){const a=n+1,b=n+3,c=n+5,d=n+7;return q('Calculate the average of the four order amounts.',[['Order amounts'],[a],[b],[c],[d]],(a+b+c+d)/4,'Use AVERAGE on A2:A5.','=AVERAGE(A2:A5)');}
  const initial=(n+10)*100,increase=10;return q('Calculate the amount after the percentage increase.',[['Initial amount','Increase %'],[initial,increase]],initial*(1+increase/100),'Multiply the initial amount by (1 + increase / 100).','=A2*(1+B2/100)');
};

export const courses = {
  '01': { title: 'Excel practical exam', description: 'Apply each Excel lesson in a small spreadsheet. Pivot tables and formatting are not simulated; related steps use formulas instead.', steps: [
    { title:'Essential functions', build:n=>[aggregate(n,'SUM'),aggregate(n+1,'AVERAGE'),aggregate(n+2,'MAX')] },
    { title:'Formulas & references', build:n=>[amount(n),gross(n+1),discountValue(n+2)] },
    { title:'Conditional sums & counts', build:n=>[conditions(n,'sum'),conditions(n+1,'count'),conditions(n+2,'other')] },
    { title:'Logical formulas', build:n=>[threshold(n,'if'),threshold(n+1,'and'),threshold(n+2,'or')] },
    { title:'Dealer lookups', build:n=>[lookup(n,0),lookup(n+1,1),lookup(n+2,2)] },
    { title:'Summarize sales', build:n=>[conditions(n,'sum'),aggregate(n+1,'SUM'),conditions(n+2,'other')] },
    { title:'Identify overdue dealers', build:n=>[overdue(n,30),overdueFlag(n+1),overdueMax(n+2)] },
    { title:'Work with dates', build:n=>[dateQuestion(n,0),dateHalf(n+1),dateCount(n+2)] },
  ]},
  '03': { title:'Sales reporting practical exam', description:'Use formulas to calculate reporting KPIs from the figures in the practice sheet.', steps:[
    { title:'Achievement & contribution', build:n=>[ratio(n,'achievement'),ratio(n+1,'contribution'),ratio(n+2,'targetvariance')] },
    { title:'Growth rates', build:n=>[ratio(n,'growth'),growthDifference(n+1),growthProjection(n+2)] },
    { title:'Run rates & forecasts', build:n=>[forecast(n,'current'),forecast(n+1,'projected'),forecast(n+2,'required')] },
    { title:'Collections & fill rate', build:n=>[ratio(n,'collection'),ratio(n+1,'fill'),ratio(n+2,'collection')] },
  ]},
  '04': { title:'Aptitude practical exam', description:'Use spreadsheet formulas to solve numerical aptitude questions.', steps:[
    { title:'Percentages', build:n=>[aptitude(n,'percent'),aptitude(n+1,'increase'),aptitude(n+2,'portion')] },
    { title:'Discounts', build:n=>[aptitude(n,'discount'),aptitude(n+1,'discount-amount'),aptitude(n+2,'two-discounts')] },
    { title:'Ratios', build:n=>[aptitude(n,'ratio'),aptitude(n+1,'ratio-second'),aptitude(n+2,'ratio-percent')] },
    { title:'Averages', build:n=>[aptitude(n,'average'),aptitude(n+1,'average-two'),aptitude(n+2,'average-four')] },
  ]},
};

export function makeQuestions(topicId, stepIndex, seed) {
  const course = courses[topicId];
  if (!course || !course.steps[stepIndex] || !Number.isInteger(seed)) throw new Error('Unknown practice step');
  const n = 3 + ((seed % 29 + 29) % 29);
  const questions = course.steps[stepIndex].build(n);
  // Rotate the three concepts as well as changing the underlying values.
  const offset = ((seed % questions.length) + questions.length) % questions.length;
  return [...questions.slice(offset), ...questions.slice(0, offset)];
}
