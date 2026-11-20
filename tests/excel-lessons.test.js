import test from 'node:test';
import assert from 'node:assert/strict';
import { excelLessons, gradeQuiz } from '../src/excelLessons.js';

test('the eight Excel steps have lessons and complete, unique quizzes', () => {
  assert.equal(excelLessons.length, 8);
  assert.equal(new Set(excelLessons.map((lesson) => lesson.id)).size, 8);
  for (const lesson of excelLessons) {
    assert.ok(lesson.title && lesson.subtitle && lesson.lesson.includes('Step by step'));
    assert.equal(lesson.questions.length, 3, lesson.id);
    for (const question of lesson.questions) {
      assert.ok(question.prompt && question.explanation, lesson.id);
      assert.ok(question.options.length >= 2, lesson.id);
      assert.equal(new Set(question.options).size, question.options.length, lesson.id);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length, lesson.id);
    }
  }
});

test('grading returns the correct score and rejects incomplete or invalid answers', () => {
  for (const lesson of excelLessons) {
    const correct = lesson.questions.map((question) => question.answer);
    assert.equal(gradeQuiz(lesson.questions, correct), lesson.questions.length);
    const wrong = lesson.questions.map((question) => (question.answer + 1) % question.options.length);
    assert.equal(gradeQuiz(lesson.questions, wrong), 0);
    assert.throws(() => gradeQuiz(lesson.questions, correct.slice(0, -1)), /Answer every question/);
    assert.throws(() => gradeQuiz(lesson.questions, [undefined, ...correct.slice(1)]), /Answer every question/);
    assert.throws(() => gradeQuiz(lesson.questions, [-1, ...correct.slice(1)]), /Answer every question/);
    assert.throws(() => gradeQuiz(lesson.questions, [lesson.questions[0].options.length, ...correct.slice(1)]), /Answer every question/);
  }
});
