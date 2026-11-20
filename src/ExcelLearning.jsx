import React, { useState } from 'react';
import { ArrowDownToLine, ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ClipboardList, RotateCcw } from 'lucide-react';
import { excelLessons, gradeQuiz } from './excelLessons.js';

const STORAGE_KEY = 'sales-prep-excel-quiz-best-v1';

function loadBestScores() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
    return Object.fromEntries(excelLessons.flatMap((lesson) => {
      const score = saved[lesson.id];
      return Number.isInteger(score) && score >= 0 && score <= lesson.questions.length ? [[lesson.id, score]] : [];
    }));
  } catch {
    return {};
  }
}

export default function ExcelLearning({ Markdown, salesOrders }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [bestScores, setBestScores] = useState(loadBestScores);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [submittedScore, setSubmittedScore] = useState(null);
  const [error, setError] = useState('');
  const lesson = excelLessons[activeIndex];
  const finished = Object.keys(bestScores).length;

  function openLesson(index) {
    setActiveIndex(index);
    setShowQuiz(false);
    setAnswers([]);
    setSubmittedScore(null);
    setError('');
  }

  function submitQuiz(event) {
    event.preventDefault();
    let score;
    try {
      score = gradeQuiz(lesson.questions, answers);
    } catch (err) {
      setError(err.message);
      return;
    }
    setError('');
    setSubmittedScore(score);
    setBestScores((current) => {
      const updated = { ...current, [lesson.id]: Math.max(current[lesson.id] ?? 0, score) };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* Keep progress for this session. */ }
      return updated;
    });
  }

  function retry() {
    setAnswers([]);
    setSubmittedScore(null);
    setError('');
  }

  return <section className="excel-learning" aria-label="Excel step-by-step lessons">
    <div className="excel-intro">
      <div><span className="excel-kicker"><span/> YOUR GUIDED LEARNING PATH</span><h2>Learn a little. <em>Practice a lot.</em></h2><p>Eight bite-sized lessons, each followed by a short exam. Take them in order or revisit any step.</p></div>
      <a className="excel-download" href={salesOrders} download="sales_orders.csv"><ArrowDownToLine size={16}/> Download practice data</a>
    </div>
    <div className="excel-progress"><div><span>YOUR STEP PROGRESS</span><strong>{finished} <small>/ {excelLessons.length} exams attempted</small></strong></div><div className="excel-progress-track" role="progressbar" aria-label="Excel exams attempted" aria-valuemin="0" aria-valuemax={excelLessons.length} aria-valuenow={finished}><span style={{ width: `${finished / excelLessons.length * 100}%` }}/></div><p>Your best scores are saved in this browser on this device.</p></div>
    <div className="excel-layout">
      <nav className="excel-steps" aria-label="Excel lesson steps">
        <div className="excel-steps-heading">THE 8 STEPS <span>LESSON + EXAM</span></div>
        {excelLessons.map((item, index) => <button key={item.id} className={`excel-step ${activeIndex === index ? 'selected' : ''}`} onClick={() => openLesson(index)} aria-current={activeIndex === index ? 'step' : undefined}><span className="excel-step-number">{Object.hasOwn(bestScores, item.id) ? <Check size={14}/> : String(index + 1).padStart(2, '0')}</span><span className="excel-step-copy"><strong>{item.title}</strong><small>{Object.hasOwn(bestScores, item.id) ? `Best: ${bestScores[item.id]}/${item.questions.length}` : 'Lesson & quick exam'}</small></span><ArrowRight size={14} className="excel-step-arrow"/></button>)}
      </nav>
      <div className="excel-stage" key={lesson.id}>
        <div className="lesson-heading"><span className="lesson-step-pill">STEP {String(activeIndex + 1).padStart(2, '0')} OF 08</span><h3>{lesson.title}</h3><p>{lesson.subtitle}</p></div>
        <div className="excel-section-label"><BookOpen size={15}/> FIRST, THE LESSON</div>
        <Markdown text={lesson.lesson}/>
        {!showQuiz ? <div className="quiz-callout"><div className="quiz-callout-icon"><ClipboardList size={20}/></div><div><strong>Ready to check your understanding?</strong><p>Take a quick {lesson.questions.length}-question exam on this step.</p></div><button type="button" onClick={() => setShowQuiz(true)}>Start exam <ArrowRight size={15}/></button></div> : <form className="step-quiz" onSubmit={submitQuiz}>
          <div className="quiz-heading"><div><span className="excel-section-label"><ClipboardList size={15}/> NEXT, THE STEP EXAM</span><h4>Let's see what you've learned.</h4><p>Choose one answer for each question. You can retry as often as you like.</p></div><span className="question-count">{lesson.questions.length} QUESTIONS</span></div>
          {lesson.questions.map((question, questionIndex) => <fieldset key={question.prompt} className={`quiz-question ${submittedScore !== null ? (answers[questionIndex] === question.answer ? 'question-correct' : 'question-incorrect') : ''}`}><legend><span>{String(questionIndex + 1).padStart(2, '0')}</span>{question.prompt}</legend><div className="quiz-options">{question.options.map((option, optionIndex) => <label key={option} className={`quiz-option ${answers[questionIndex] === optionIndex ? 'chosen' : ''}`}><input type="radio" name={`question-${lesson.id}-${questionIndex}`} value={optionIndex} checked={answers[questionIndex] === optionIndex} disabled={submittedScore !== null} onChange={() => { setAnswers((current) => { const next = [...current]; next[questionIndex] = optionIndex; return next; }); setError(''); }}/><span>{option}</span></label>)}</div>{submittedScore !== null && <div className="quiz-feedback"><strong>{answers[questionIndex] === question.answer ? 'Correct!' : `Not quite. Correct answer: ${question.options[question.answer]}`}</strong> {question.explanation}</div>}</fieldset>)}
          {error && <p className="quiz-error" role="alert">{error}</p>}
          {submittedScore === null ? <button className="quiz-primary" type="submit">Check my answers <ArrowRight size={16}/></button> : <div className="quiz-result" role="status"><div className="result-icon"><CheckCircle2 size={22}/></div><div><span>EXAM COMPLETE</span><strong>You scored {submittedScore} / {lesson.questions.length}</strong><p>{submittedScore === lesson.questions.length ? 'Excellent work! You got them all.' : 'Review the explanations above, then give it another try.'}</p></div><button type="button" onClick={retry}><RotateCcw size={15}/> Retry exam</button></div>}
        </form>}
        <div className="excel-stage-footer"><button type="button" disabled={activeIndex === 0} onClick={() => openLesson(activeIndex - 1)}><ArrowLeft size={15}/> Previous step</button>{activeIndex < excelLessons.length - 1 ? <button type="button" onClick={() => openLesson(activeIndex + 1)}>Next step <ArrowRight size={15}/></button> : <span>YOU'VE REACHED THE LAST STEP <Check size={14}/></span>}</div>
      </div>
    </div>
  </section>;
}
