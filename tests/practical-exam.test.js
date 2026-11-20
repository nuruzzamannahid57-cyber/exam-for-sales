import test from 'node:test';
import assert from 'node:assert/strict';
import { courses, makeQuestions } from '../src/practice/questions.js';
import { answerIsCorrect, calculateFormula } from '../src/practice/formulaEngine.js';

test('every step has three answerable formula questions across varied sets', () => {
  for (const [topicId, course] of Object.entries(courses)) {
    for (let step = 0; step < course.steps.length; step++) {
      const first = makeQuestions(topicId, step, 3);
      const second = makeQuestions(topicId, step, 4);
      assert.equal(first.length, 3);
      assert.notDeepEqual(first, second, `${topicId} step ${step + 1} should vary on retry`);
      for (const seed of [0, 1, 4, 8, 14, 28, 29, 31, 100]) {
        for (const question of makeQuestions(topicId, step, seed)) {
          assert.equal(question.grid.length, 5);
          assert.ok(question.grid.every(row => row.length === 4));
          const result = calculateFormula(question.solution, question.grid);
          assert.equal(result.error, undefined, `${topicId}/${step}: ${question.solution}: ${result.error}`);
          assert.ok(answerIsCorrect(result.value, question.expected), `${topicId}/${step}: ${question.prompt}: ${result.value} != ${question.expected}`);
        }
      }
    }
  }
});

test('formulas accept ranges, absolute references and case-insensitive functions', () => {
  const grid = [['Region','Amount','',''],['Dhaka',10,'',''],['Khulna',20,'',''],['Dhaka',30,'',''],['Sylhet',40,'','']];
  assert.equal(calculateFormula('=sum($B$2:B5)', grid).value, 100);
  assert.equal(calculateFormula('=SUMIF(A2:A5,"Dhaka",B2:B5)', grid).value, 40);
  assert.equal(calculateFormula('=COUNTIF(B2:B5,">20")', grid).value, 2);
  assert.equal(calculateFormula('=VLOOKUP("Khulna",A2:B5,2,FALSE)', grid).value, 20);
  assert.equal(calculateFormula('=IF(B2>5,"Yes","No")', grid).value, 'Yes');
});

test('invalid or unsupported inputs are rejected without unlocking a step', () => {
  const grid = [['Value','','',''],[4,'','',''],['','','',''],['','','',''],['','','','']];
  for (const formula of ['4', '=4', '=SUM(A2:A9999999)', '=A2/0', '=UNKNOWN(A2)', '=Sheet1!A2', '=A2+', '=VLOOKUP("x",A1:B2,2,TRUE)']) {
    assert.ok(calculateFormula(formula, grid).error, formula);
  }
  assert.equal(answerIsCorrect(99, 100), false);
  assert.equal(answerIsCorrect(100.005, 100), true);
  assert.equal(answerIsCorrect('review', 'Review'), true);
});
