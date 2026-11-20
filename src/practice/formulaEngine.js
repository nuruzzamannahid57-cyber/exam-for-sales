import { Parser } from 'hot-formula-parser';

// Deliberately small, local-only subset: this practice grid is not a full Excel app.
const FUNCTIONS = new Set(['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN', 'COUNTIF', 'SUMIF', 'IF', 'AND', 'OR', 'VLOOKUP', 'MONTH', 'ROUND']);
const flatten = (value) => Array.isArray(value) ? value.flat(Infinity) : [value];

function matches(value, criterion) {
  if (typeof criterion !== 'string') return value === criterion;
  const comparison = criterion.match(/^(>=|<=|<>|>|<|=)(.*)$/);
  if (comparison) {
    const [, operator, operand] = comparison;
    const left = Number(value);
    const right = Number(operand);
    if (!Number.isFinite(left) || !Number.isFinite(right)) {
      if (operator === '=') return String(value).toLowerCase() === operand.toLowerCase();
      if (operator === '<>') return String(value).toLowerCase() !== operand.toLowerCase();
      return false;
    }
    return { '>': left > right, '<': left < right, '>=': left >= right, '<=': left <= right, '=': left === right, '<>': left !== right }[operator];
  }
  return String(value).toLowerCase() === criterion.toLowerCase();
}

export function calculateFormula(input, grid) {
  const text = String(input ?? '').trim();
  if (!text.startsWith('=')) return { error: 'Start your answer with = and use a cell reference.' };
  if (text.length > 200) return { error: 'Keep your formula under 200 characters.' };
  // Mask quoted strings so text like "A1" cannot count as a cell reference.
  const unquoted = text.replace(/"(?:[^"]|"")*"/g, '""');
  if (!/\$?[A-Z]{1,2}\$?[1-9]\d*/i.test(unquoted)) return { error: 'Use at least one cell reference, such as A2.' };
  if (/[^\w\s$.,:()+\-*/^%<>=!"&]/.test(unquoted) || /!/.test(unquoted)) return { error: 'Sheet references and external links are not supported here.' };
  for (const match of unquoted.matchAll(/\b([A-Z][A-Z0-9.]*)\s*\(/gi)) {
    if (!FUNCTIONS.has(match[1].toUpperCase())) return { error: `The ${match[1].toUpperCase()} function is not available in this practice sheet.` };
  }

  const parser = new Parser();
  let outOfBounds = false;
  const getCell = (row, column) => {
    if (row < 0 || row >= grid.length || column < 0 || column >= grid[0].length) { outOfBounds = true; return null; }
    return grid[row][column] ?? null;
  };
  parser.on('callCellValue', (cell, done) => done(getCell(cell.row.index, cell.column.index)));
  parser.on('callRangeValue', (start, end, done) => {
    if (start.row.index < 0 || start.column.index < 0 || end.row.index >= grid.length || end.column.index >= grid[0].length || start.row.index > end.row.index || start.column.index > end.column.index) {
      outOfBounds = true; done([]); return;
    }
    const rows = [];
    for (let row = start.row.index; row <= end.row.index; row++) {
      const values = [];
      for (let col = start.column.index; col <= end.column.index; col++) values.push(getCell(row, col));
      rows.push(values);
    }
    done(rows);
  });
  parser.setFunction('COUNTIF', ([range, condition]) => flatten(range).filter((value) => matches(value, condition)).length);
  parser.setFunction('SUMIF', ([range, condition, sumRange]) => {
    const criteria = flatten(range);
    const values = flatten(sumRange ?? range);
    if (criteria.length !== values.length) throw new Error('Range sizes must match');
    return criteria.reduce((total, value, i) => total + (matches(value, condition) ? Number(values[i]) || 0 : 0), 0);
  });
  parser.setFunction('VLOOKUP', ([needle, table, column, approximate]) => {
    if (!Array.isArray(table) || !Number.isInteger(column) || column < 1 || approximate !== false && approximate !== 0) throw new Error('Use an exact match with FALSE');
    const row = table.find((item) => Array.isArray(item) && String(item[0]).toLowerCase() === String(needle).toLowerCase());
    if (!row || column > row.length) throw new Error('Lookup not found');
    return row[column - 1];
  });
  try {
    const { error, result } = parser.parse(text.slice(1));
    if (outOfBounds) return { error: 'Use only cells shown in the practice sheet.' };
    if (error || result === null || result === undefined || typeof result === 'number' && !Number.isFinite(result)) return { error: `Could not calculate that formula${error ? ` (${error})` : ''}. Check the syntax and cell references.` };
    return { value: result };
  } catch {
    return { error: 'Could not calculate that formula. Check the syntax and cell references.' };
  }
}

export function answerIsCorrect(actual, expected) {
  if (typeof expected === 'number') return typeof actual === 'number' && Number.isFinite(actual) && Math.abs(actual - expected) <= 0.01;
  return String(actual).trim().toLowerCase() === String(expected).trim().toLowerCase();
}
