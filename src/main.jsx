import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { marked } from 'marked';
import ExcelLearning from './ExcelLearning.jsx';
import DOMPurify from 'dompurify';
import { ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Bookmark, BriefcaseBusiness, Calculator, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, ClipboardList, FileSpreadsheet, Globe2, GraduationCap, Layers3, LayoutDashboard, Lightbulb, Menu, MessageSquareText, Paintbrush, Search, Sparkles, Target, Trophy, X } from 'lucide-react';
import plan from '../STUDY-PLAN.md?raw';
import salesOrders from '../data/sales_orders.csv?url';
import dealers from '../data/dealers.csv?url';
import targets from '../data/targets.csv?url';
import './styles.css';

const PracticalExam = React.lazy(() => import('./practice/PracticalExam.jsx'));
const docs = import.meta.glob('../0*/**/*.md', { query: '?raw', import: 'default', eager: true });
const topics = [
  { id: '01', dir: '01-excel', title: 'Excel essentials', short: 'Excel', desc: 'Formulas, lookups, pivot tables and dashboards.', icon: FileSpreadsheet, color: 'mint', tag: 'THE ESSENTIALS', time: '30 min' },
  { id: '02', dir: '02-order-to-cash', title: 'Order-to-cash', short: 'Order-to-cash', desc: 'Follow an order from the first request to payment.', icon: Layers3, color: 'peach', tag: 'THE WORKFLOW', time: '25 min' },
  { id: '03', dir: '03-sales-reporting-kpis', title: 'Sales reporting & KPIs', short: 'Sales reporting', desc: 'Make sense of targets, trends and performance.', icon: Target, color: 'lavender', tag: 'THE NUMBERS', time: '25 min' },
  { id: '04', dir: '04-aptitude', title: 'Aptitude & logic', short: 'Aptitude', desc: 'Build speed and confidence with everyday maths.', icon: Calculator, color: 'yellow', tag: 'THE PRACTICE', time: '20 min' },
  { id: '05', dir: '05-english', title: 'Business English', short: 'Business English', desc: 'Write clear, thoughtful and professional messages.', icon: MessageSquareText, color: 'blue', tag: 'THE COMMUNICATION', time: '20 min' },
  { id: '06', dir: '06-erp-sap-basics', title: 'ERP & SAP basics', short: 'ERP & SAP', desc: 'Get comfortable with the systems behind sales.', icon: ClipboardList, color: 'mint', tag: 'THE SYSTEMS', time: '20 min' },
  { id: '07', dir: '07-company-and-paint-industry', title: 'Company & paint industry', short: 'The industry', desc: 'Know the company, its products and its market.', icon: Paintbrush, color: 'peach', tag: 'THE INDUSTRY', time: '25 min' },
  { id: '08', dir: '08-gk-and-logic', title: 'General knowledge & logic', short: 'GK & logic', desc: 'Stay sharp with current affairs and puzzles.', icon: Globe2, color: 'lavender', tag: 'THE BIG PICTURE', time: '20 min' },
  { id: '09', dir: '09-interview-and-mock-exam', title: 'Interview & mock exam', short: 'The final prep', desc: 'Bring it all together and get ready for exam day.', icon: Trophy, color: 'yellow', tag: 'THE FINAL STEP', time: '30 min' },
];
const workbooks = {
  '01': { name: 'Excel practice workbook', description: 'Eight guided steps, exam questions and fictional data', type: 'XLSX', url: '/workbooks/excel-practice.xlsx', filename: 'excel-practice.xlsx' },
  '03': { name: 'Sales reporting workbook', description: 'KPI exercises, sales data and summary templates', type: 'XLSX', url: '/workbooks/sales-reporting-practice.xlsx', filename: 'sales-reporting-practice.xlsx' },
  '04': { name: 'Aptitude practice workbook', description: 'Timed calculations with answers and explanations', type: 'XLSX', url: '/workbooks/aptitude-practice.xlsx', filename: 'aptitude-practice.xlsx' },
};
const files = [
  ...Object.values(workbooks),
  { name: 'Sales orders', description: '300 fictional orders for Excel practice', type: 'CSV', url: salesOrders, filename: 'sales_orders.csv' },
  { name: 'Dealer accounts', description: 'Credit limits, balances and overdue days', type: 'CSV', url: dealers, filename: 'dealers.csv' },
  { name: 'Regional targets', description: 'Sales targets by region', type: 'CSV', url: targets, filename: 'targets.csv' },
];
const repo = 'https://github.com/nuruzzamannahid57-cyber/exam-for-sales';

function getRoute() {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/');
  if (parts[0] === 'topic' && topics.some((topic) => topic.id === parts[1])) return { page: 'topic', id: parts[1], tab: parts[2] || 'learn' };
  if (parts[0] === 'plan' || parts[0] === 'resources') return { page: parts[0] };
  return { page: 'home' };
}
function navigate(path) {
  const next = path ? `#/${path}` : '#/';
  if (window.location.hash === next) window.scrollTo({ top: 0, behavior: 'smooth' });
  else window.location.hash = next;
}
function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem('sales-prep-completed-v1') || '[]');
    return Array.isArray(stored) ? stored.filter((id) => topics.some((topic) => topic.id === id)) : [];
  } catch { return []; }
}
function Markdown({ text }) {
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(text || '')), [text]);
  return <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />;
}
function Brand() {
  return <button className="brand" onClick={() => navigate('')} aria-label="Sales Prep home"><span className="brand-mark"><GraduationCap size={20} strokeWidth={2.2} /></span><span><strong>sales<span>prep</span></strong><small>YOUR STUDY COMPANION</small></span></button>;
}
function Sidebar({ route, completed, open, setOpen }) {
  const go = (path) => { navigate(path); setOpen(false); };
  return <>
    {open && <button className="sidebar-overlay" aria-label="Close menu" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><Brand /><button className="close-menu" onClick={() => setOpen(false)} aria-label="Close menu"><X size={19}/></button></div>
      <div className="side-label">YOUR WORKSPACE</div>
      <nav className="main-nav" aria-label="Main navigation">
        <button className={route.page === 'home' ? 'active' : ''} onClick={() => go('')}><LayoutDashboard size={17} /> Dashboard <ChevronRight className="nav-chevron" size={15}/></button>
        <button className={route.page === 'plan' ? 'active' : ''} onClick={() => go('plan')}><CalendarDays size={17} /> Study plan</button>
        <button className={route.page === 'resources' ? 'active' : ''} onClick={() => go('resources')}><Bookmark size={17} /> Resources</button>
      </nav>
      <div className="side-label lessons-label">THE LEARNING PATH <span>09</span></div>
      <nav className="lesson-nav" aria-label="Study topics">
        {topics.map((topic) => <button key={topic.id} className={route.page === 'topic' && route.id === topic.id ? 'active' : ''} onClick={() => go(`topic/${topic.id}/learn`)}><span className="lesson-num">{topic.id}</span><span className="lesson-title">{topic.short}</span>{completed.includes(topic.id) && <Check size={14} className="lesson-check"/>}</button>)}
      </nav>
      <div className="sidebar-bottom"><div className="side-bulb"><Lightbulb size={17}/></div><div><strong>One step at a time.</strong><p>Progress over perfection.</p></div></div>
    </aside>
  </>;
}
function Topbar({ route, query, setQuery, setOpen }) {
  const label = route.page === 'home' ? 'Dashboard' : route.page === 'plan' ? 'Study plan' : route.page === 'resources' ? 'Resources' : 'Learning path';
  return <header className="topbar"><div className="top-left"><button className="menu-button" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={21}/></button><span className="crumb-muted">YOUR WORKSPACE</span><ChevronRight size={14}/><span className="crumb-current">{label}</span></div><div className="top-right"><label className="searchbox"><Search size={16}/><input value={query} onChange={(e) => {setQuery(e.target.value); if (route.page !== 'home') navigate('');}} placeholder="Search topics..." aria-label="Search topics"/><span className="search-key">⌕</span></label><span className="top-divider"/><span className="avatar">S</span><span className="learner">Learner<small>Ready to grow</small></span><ChevronDown size={15} className="avatar-chevron"/></div></header>;
}
function Progress({ completed }) {
  const percent = Math.round(completed.length / topics.length * 100);
  return <div className="progress-card"><div className="section-kicker"><span>YOUR PROGRESS</span><span className="tiny-circle"><ArrowUpRight size={15}/></span></div><div className="progress-heading"><strong>Little wins add up.</strong><span>Saved in this browser, on this device.</span></div><div className="progress-number">{percent}<span>%</span><small> complete</small></div><div className="progress-track" role="progressbar" aria-label="Topics completed" aria-valuenow={completed.length} aria-valuemin="0" aria-valuemax="9"><span style={{ width: `${percent}%` }}/></div><div className="progress-caption"><span>{completed.length} of 9 topics completed</span><span><Sparkles size={13}/> YOU GOT THIS</span></div></div>;
}
function TopicCard({ topic, completed, featured = false }) {
  const Icon = topic.icon;
  return <button className={`topic-card ${featured ? 'featured-card' : ''}`} onClick={() => navigate(`topic/${topic.id}/learn`)}><div className="card-top"><span className={`topic-icon ${topic.color}`}><Icon size={21} strokeWidth={1.7}/></span><span className="card-number">{completed ? <span className="done-indicator"><Check size={12}/> DONE</span> : `TOPIC ${topic.id}`}</span></div><div className="topic-info"><div className="card-tag">{topic.tag}</div><h3>{topic.title}</h3><p>{topic.desc}</p></div><div className="card-bottom"><span><BookOpen size={14}/> {topic.time} read</span><span className="card-arrow"><ArrowUpRight size={17}/></span></div></button>;
}
function Home({ completed, query }) {
  const filtered = topics.filter((topic) => `${topic.title} ${topic.desc} ${topic.short}`.toLowerCase().includes(query.toLowerCase().trim()));
  const next = topics.find((topic) => !completed.includes(topic.id)) || topics[0];
  return <>
    <div className="page-intro"><div><div className="eyebrow"><span className="eyebrow-dot"/> YOUR PERSONAL STUDY SPACE</div><h1>Hey there, future <em>pro.</em> <span className="wave">✳</span></h1><p>Everything you need to feel ready, all in one place.</p></div><div className="intro-date"><Sparkles size={15}/><span>LET'S MAKE TODAY COUNT</span></div></div>
    <div className="hero-layout"><div className="hero"><div className="hero-copy"><span className="hero-pill"><span/> YOUR NEXT CHAPTER STARTS HERE</span><h2>Big goals.<br/><em>Small steps.</em></h2><p>A little practice today brings you one step closer to exam day confidence.</p><button className="hero-button" onClick={() => navigate(`topic/${next.id}/learn`)}>{completed.length === 0 ? 'Start learning' : completed.length === 9 ? 'Review your topics' : 'Continue learning'} <ArrowRight size={17}/></button></div><img src="/learning-illustration.png" alt="" className="hero-image"/><span className="hero-index">YOUR STUDY JOURNEY / 01—09</span></div><Progress completed={completed}/></div>
    <div className="section-heading"><div><div className="eyebrow dark-eyebrow"><span className="eyebrow-dot"/> THE LEARNING PATH</div><h2>Let's get you ready <span>✳</span></h2><p>Nine topics. One goal. Take them at your own pace.</p></div><span className="topic-count">{filtered.length} {filtered.length === 1 ? 'TOPIC' : 'TOPICS'} <ArrowRight size={15}/></span></div>
    {filtered.length ? <div className="topic-grid">{filtered.map((topic) => <TopicCard key={topic.id} topic={topic} completed={completed.includes(topic.id)}/>)}</div> : <div className="empty-state"><Search size={21}/><h3>No topics found</h3><p>Try a different search term.</p></div>}
    <div className="bottom-banner"><div className="banner-icon"><CalendarDays size={20}/></div><div><span>NEED A LITTLE STRUCTURE?</span><strong>Make a plan that works for you.</strong><p>Choose a 7-day sprint or take the scenic 14-day route.</p></div><button onClick={() => navigate('plan')}>View study plan <ArrowRight size={16}/></button></div>
  </>;
}
function WorkbookBanner({ workbook }) {
  return <div className="workbook-banner"><span className="workbook-banner-icon"><FileSpreadsheet size={20}/></span><div><strong>Practice with a real Excel workbook</strong><p>{workbook.description}. Download and open in Excel or Google Sheets.</p></div><a href={workbook.url} download={workbook.filename}><ArrowDownToLine size={16}/> Download workbook</a></div>;
}
function TopicPage({ route, completed, toggle }) {
  const topic = topics.find((item) => item.id === route.id);
  const isFinal = topic.id === '09';
  const tabs = isFinal ? [{ id: 'learn', label: 'Interview prep', file: 'README.md' }, { id: 'tasks', label: 'Mock exam', file: 'mock-exam.md' }, { id: 'solutions', label: 'Exam answers', file: 'mock-exam-answers.md' }] : [{ id: 'learn', label: 'Learn', file: 'README.md' }, { id: 'tasks', label: 'Practice tasks', file: 'tasks.md' }, { id: 'solutions', label: 'Solutions', file: 'solutions.md' }];
  if (workbooks[topic.id]) tabs.splice(1, 0, { id: 'practical', label: 'Practical exam' });
  const tab = tabs.find((item) => item.id === route.tab) || tabs[0];
  const content = docs[`../${topic.dir}/${tab.file}`];
  const Icon = topic.icon;
  const isDone = completed.includes(topic.id);
  const next = topics[Number(topic.id)];
  return <div className="inner-page"><button className="back-link" onClick={() => navigate('')}><ArrowLeft size={16}/> All topics</button><div className="topic-header"><div className={`topic-icon big ${topic.color}`}><Icon size={28}/></div><div className="topic-heading-copy"><div className="eyebrow dark-eyebrow"><span className="eyebrow-dot"/> TOPIC {topic.id} / 09</div><h1>{topic.title}</h1><p>{topic.desc}</p></div><button className={`mark-button ${isDone ? 'is-done' : ''}`} onClick={() => toggle(topic.id)}><CheckCircle2 size={17}/>{isDone ? 'Completed' : 'Mark complete'}</button></div><div className="content-layout"><div className="reading-card"><div className="tabs" role="tablist" aria-label="Topic sections">{tabs.map((item) => <button key={item.id} role="tab" aria-selected={item.id === tab.id} className={item.id === tab.id ? 'selected' : ''} onClick={() => navigate(`topic/${topic.id}/${item.id}`)}>{item.label}</button>)}</div>{workbooks[topic.id] && <WorkbookBanner workbook={workbooks[topic.id]}/>}{tab.id === 'solutions' && <div className="answer-note"><Lightbulb size={17}/><span>Try the questions first, then come back to check your work.</span></div>}{topic.id === '01' && tab.id === 'tasks' && <div className="answer-note"><Lightbulb size={17}/><span>The Python checker runs on your computer, not in this website. <a href={`${repo}#setup`} target="_blank" rel="noreferrer">See setup instructions</a>.</span></div>}{tab.id === 'practical' && workbooks[topic.id] ? <React.Suspense fallback={<div className="empty-state"><p>Loading the practice sheet…</p></div>}><PracticalExam key={topic.id} topicId={topic.id}/></React.Suspense> : topic.id === '01' && tab.id === 'learn' ? <><ExcelLearning Markdown={Markdown} salesOrders={salesOrders}/><details className="original-overview"><summary>View the original Excel overview & shortcuts</summary><Markdown text={content}/></details></> : content ? <Markdown text={content} /> : <div className="empty-state"><p>We couldn't find this section. Please try another tab.</p></div>}<div className="reading-footer"><span>END OF {tab.label.toUpperCase()}</span>{next && <button onClick={() => navigate(`topic/${next.id}/learn`)}>Next topic <ArrowRight size={16}/></button>}</div></div><aside className="reading-aside"><div className="aside-card"><div className="aside-icon"><Sparkles size={19}/></div><span className="aside-kicker">A NOTE FOR YOU</span><h3>You've got this.</h3><p>Focus on progress, not perfection. Take a break, come back, and keep going.</p></div><div className="aside-card resource-aside"><span className="aside-kicker">PRACTICE MAKES PROGRESS</span><h3>Need the data?</h3><p>Download the fictional datasets to work through the Excel exercises.</p><button onClick={() => navigate('resources')}>Explore resources <ArrowRight size={15}/></button></div></aside></div></div>;
}
function PlanPage() {
  return <div className="inner-page"><button className="back-link" onClick={() => navigate('')}><ArrowLeft size={16}/> Back to dashboard</button><div className="simple-heading"><div className="eyebrow dark-eyebrow"><span className="eyebrow-dot"/> MAKE IT HAPPEN</div><h1>A plan for <em>your pace.</em></h1><p>A little structure goes a long way. Pick a schedule, show up, and make it yours.</p></div><div className="reading-card standalone"><div className="standalone-heading"><CalendarDays size={19}/><span>YOUR STUDY PLAN</span></div><Markdown text={plan}/></div></div>;
}
function ResourcesPage() {
  return <div className="inner-page"><button className="back-link" onClick={() => navigate('')}><ArrowLeft size={16}/> Back to dashboard</button><div className="simple-heading"><div className="eyebrow dark-eyebrow"><span className="eyebrow-dot"/> YOUR TOOLKIT</div><h1>Practice <em>makes progress.</em></h1><p>Everything you need to put what you've learned into practice.</p></div><div className="resource-grid">{files.map((file) => <a className="resource-card" href={file.url} download={file.filename} key={file.name}><span className="topic-icon mint"><FileSpreadsheet size={22}/></span><span className="file-type">{file.type} FILE</span><h3>{file.name}</h3><p>{file.description}</p><span className="download-link">Download file <ArrowDownToLine size={16}/></span></a>)}</div><div className="resource-note"><Lightbulb size={18}/><p>All names and numbers in these datasets are fictional. The Excel answer checker is a Python script in the repository; it doesn't run in this website. <a href={`${repo}#setup`} target="_blank" rel="noreferrer">View setup instructions <ArrowUpRight size={14}/></a></p></div></div>;
}
function App() {
  const [route, setRoute] = useState(getRoute);
  const [completed, setCompleted] = useState(loadProgress);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { const handler = () => { setRoute(getRoute()); window.scrollTo(0, 0); }; window.addEventListener('hashchange', handler); return () => window.removeEventListener('hashchange', handler); }, []);
  function toggle(id) {
    setCompleted((current) => { const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]; try { localStorage.setItem('sales-prep-completed-v1', JSON.stringify(next)); } catch { /* Progress remains available for this session. */ } return next; });
  }
  return <div className="app-shell"><Sidebar route={route} completed={completed} open={menuOpen} setOpen={setMenuOpen}/><main className="main"><Topbar route={route} query={query} setQuery={setQuery} setOpen={setMenuOpen}/><div className="main-content">{route.page === 'home' ? <Home completed={completed} query={query}/> : route.page === 'topic' ? <TopicPage route={route} completed={completed} toggle={toggle}/> : route.page === 'plan' ? <PlanPage/> : <ResourcesPage/>}<footer><span>Made for your next big thing. <span className="footer-star">✳</span></span><span>SALES ADMIN EXAM PREP <span className="footer-dot">·</span> <a href={repo} target="_blank" rel="noreferrer">GITHUB <ArrowUpRight size={12}/></a></span></footer></div></main></div>;
}

createRoot(document.getElementById('root')).render(<App />);
