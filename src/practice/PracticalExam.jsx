import React, { useState } from 'react';
import { ArrowRight, Check, CheckCircle2, FileSpreadsheet, Lightbulb, LockKeyhole, RotateCcw } from 'lucide-react';
import { courses, makeQuestions } from './questions.js';
import { answerIsCorrect, calculateFormula } from './formulaEngine.js';

const STORAGE_KEY = 'sales-prep-practical-exams-v1';

function readCompleted(topicId, max) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const value = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved[topicId] : 0;
    return Number.isInteger(value) && value >= 0 && value <= max ? value : 0;
  } catch { return 0; }
}
function saveCompleted(topicId, count) {
  try {
    let saved = {};
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) saved = raw;
    } catch { /* Replace malformed saved data. */ }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, [topicId]: count }));
  } catch { /* Progress is kept in memory when storage is unavailable. */ }
}

export default function PracticalExam({ topicId }) {
  const course = courses[topicId];
  const [completed, setCompleted] = useState(() => readCompleted(topicId, course.steps.length));
  const [stepIndex, setStepIndex] = useState(() => Math.min(readCompleted(topicId, course.steps.length), course.steps.length - 1));
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1_000_000));
  const [position, setPosition] = useState(0);
  const [formula, setFormula] = useState('');
  const [status, setStatus] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const step = course.steps[stepIndex];
  const questions = makeQuestions(topicId, stepIndex, seed);
  const question = questions[position];

  function openStep(index) {
    if (index > completed) return;
    setStepIndex(index);
    setSeed((current) => current + 1);
    setPosition(0);
    setFormula('');
    setStatus(null);
    setShowHint(false);
    setFinished(false);
  }
  function check(event) {
    event.preventDefault();
    const result = calculateFormula(formula, question.grid);
    if (result.error) { setStatus({ ok: false, message: result.error }); return; }
    if (!answerIsCorrect(result.value, question.expected)) {
      setStatus({ ok: false, message: `Your formula returned ${result.value}. Not quite—check your calculation and try again.` });
      return;
    }
    setStatus({ ok: true, message: `Correct! Your formula returned ${typeof result.value === 'number' ? Number(result.value.toFixed(2)) : result.value}.` });
  }
  function nextQuestion() {
    if (!status?.ok) return;
    if (position === questions.length - 1) {
      const next = Math.max(completed, stepIndex + 1);
      setCompleted(next);
      saveCompleted(topicId, next);
      setFinished(true);
    } else {
      setPosition((current) => current + 1);
      setFormula(''); setStatus(null); setShowHint(false);
    }
  }
  function newSet() {
    setSeed((current) => current + 1);
    setPosition(0); setFormula(''); setStatus(null); setShowHint(false); setFinished(false);
  }

  return <section className="practical-exam" aria-label={course.title}>
    <div className="practical-intro"><div><span className="excel-kicker"><span/> PRACTICE, ONE FORMULA AT A TIME</span><h2>{course.title}</h2><p>{course.description}</p></div><span className="practical-badge"><FileSpreadsheet size={16}/> INTERACTIVE SHEET</span></div>
    <div className="practical-how"><strong>How it works</strong><span>Enter a formula in cell E2. Answer all 3 questions correctly to unlock the next step. Each new set changes the data and question order. Your unlocked steps are saved in this browser.</span></div>
    <div className="practical-layout"><nav className="practical-steps" aria-label="Practical exam steps"><div className="excel-steps-heading">YOUR STEPS <span>{completed} / {course.steps.length} PASSED</span></div>{course.steps.map((item,index)=><button key={item.title} type="button" className={`practical-step ${stepIndex === index ? 'selected' : ''}`} onClick={() => openStep(index)} disabled={index > completed} aria-current={stepIndex === index ? 'step' : undefined}><span className="excel-step-number">{index < completed ? <Check size={14}/> : index > completed ? <LockKeyhole size={13}/> : String(index+1).padStart(2,'0')}</span><span><strong>{item.title}</strong><small>{index < completed ? 'Passed' : index > completed ? 'Complete the previous step' : 'Ready to practice'}</small></span></button>)}</nav>
      <div className="practical-panel">{finished ? <div className="practical-complete" role="status"><span className="practical-complete-icon"><CheckCircle2 size={27}/></span><span className="excel-kicker">STEP COMPLETE</span><h3>Nicely done!</h3><p>You answered all three questions correctly.{stepIndex < course.steps.length - 1 ? ' Your next step is now unlocked.' : ' You have completed this practical exam.'}</p><div className="practical-actions">{stepIndex < course.steps.length - 1 && <button type="button" className="quiz-primary" onClick={() => openStep(stepIndex + 1)}>Go to next step <ArrowRight size={15}/></button>}<button type="button" className="practical-secondary" onClick={newSet}><RotateCcw size={14}/> Try a new set</button></div></div> : <><div className="practical-question-head"><span className="lesson-step-pill">STEP {String(stepIndex+1).padStart(2,'0')} OF {String(course.steps.length).padStart(2,'0')}</span><span className="question-count">QUESTION {position+1} / {questions.length}</span></div><h3>{step.title}</h3><p className="practical-prompt">{question.prompt}</p><div className="practical-caption">Read-only data in A1:D5 · Your formula goes in <strong>E2</strong></div><form onSubmit={check}>
        <div className="sheet-scroll"><table className="practice-sheet" aria-label="Practice spreadsheet"><thead><tr><th aria-label="Row number"></th>{['A','B','C','D','E'].map(col=><th key={col}>{col}</th>)}</tr></thead><tbody>{question.grid.map((row,rowIndex)=><tr key={rowIndex}><th scope="row">{rowIndex+1}</th>{row.map((value,colIndex)=><td key={colIndex} className={rowIndex===0 && value!==''?'sheet-heading':''}>{value}</td>)}<td className={rowIndex===1?'answer-cell':''}>{rowIndex===1 && <input aria-label="Formula in cell E2" placeholder="=..." value={formula} disabled={status?.ok} onChange={event=>{setFormula(event.target.value);setStatus(null);}} spellCheck="false" autoComplete="off"/>}</td></tr>)}</tbody></table></div>
        <p className="formula-support">Start with <code>=</code> and use a shown cell reference. Available: arithmetic, SUM, AVERAGE, COUNT, MIN, MAX, IF, AND, OR, COUNTIF, SUMIF, exact VLOOKUP, MONTH and ROUND. Percent answers use points (86 means 86%). This is a practice sheet, not full Excel.</p>
        {status && <div className={`practical-feedback ${status.ok?'success':'error'}`} role="status">{status.ok && <CheckCircle2 size={17}/>}<span>{status.message}</span></div>}
        <div className="practical-actions">{status?.ok ? <button type="button" className="quiz-primary" onClick={nextQuestion}>{position === questions.length-1 ? 'Finish step' : 'Next question'} <ArrowRight size={15}/></button> : <button type="submit" className="quiz-primary">Check formula <ArrowRight size={15}/></button>}<button type="button" className="practical-secondary" onClick={()=>setShowHint(!showHint)}><Lightbulb size={15}/> {showHint?'Hide hint':'Show hint'}</button><button type="button" className="practical-secondary" onClick={newSet}><RotateCcw size={14}/> New set</button></div>{showHint && <p className="practical-hint"><strong>Hint:</strong> {question.hint}</p>}
      </form></>}</div></div>
  </section>;
}
