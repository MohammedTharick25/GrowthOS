import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Compass, Heart, Sparkles } from 'lucide-react';
import { usePracticeData, useSavePlan } from '../practice/hooks.js';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';

const startingPriorities = [
  { identityKey: 'career', label: 'Career & skills', question: 'What specific skill or project will I work on?', icon: Compass },
  { identityKey: 'health', label: 'Health & fitness', question: 'What will I do to take care of my body?', icon: Heart },
  { identityKey: 'confidence', label: 'Self-respect & growth', question: 'What action will help me practise confidence, communication, or discipline?', icon: Sparkles },
];
const qualities = ['Patience', 'Consistency', 'Curiosity', 'Self-respect', 'Courage', 'Responsibility'];
const intentions = [
  { if: 'I feel unmotivated', then: 'I’ll start with one small task.' },
  { if: 'I make a mistake', then: 'I’ll understand it without insulting myself.' },
  { if: 'I’m afraid to express myself', then: 'I’ll take one manageable step.' },
  { if: 'I miss a commitment', then: 'I’ll adjust the plan and begin again.' },
];

export default function PlanPage() {
  const { plan } = usePracticeData();
  const savePlan = useSavePlan();
  const [priorities, setPriorities] = useState(startingPriorities.map((item) => ({ identityKey: item.identityKey, text: '' })));
  const [selected, setSelected] = useState([]);
  const [ifThen, setIfThen] = useState(intentions);
  useEffect(() => {
    if (!plan.data) return;
    setPriorities(startingPriorities.map((item, index) => ({ ...item, ...(plan.data.priorities?.[index] || {}) })));
    setSelected(plan.data.qualitiesToday || []);
    if (plan.data.ifThen?.length) setIfThen(plan.data.ifThen);
  }, [plan.data]);
  const toggleQuality = (quality) => setSelected((items) => items.includes(quality) ? items.filter((item) => item !== quality) : [...items, quality]);
  const submit = (event) => { event.preventDefault(); savePlan.mutate({ priorities: priorities.map(({ identityKey, text, done }) => ({ identityKey, text, ...(done !== undefined ? { done } : {}) })), qualitiesToday: selected, ifThen, morningDoneAt: new Date().toISOString() }); };

  return <main className="flow-page">
    <Link className="back-link" to="/app"><ArrowLeft size={16} /> Back to today</Link>
    <header className="flow-heading"><span className="section-kicker">MORNING PRACTICE · 5 MIN</span><h1>Plan a day that fits.</h1><p>Choose three priorities. Keep the plan gentle enough for real life.</p><div className="flow-dots" aria-label="Step 1 of 3"><i className="active" /><i /><i /></div></header>
    <form onSubmit={submit}>
      <section className="flow-section"><div className="flow-section-heading"><span>01</span><div><h2>What matters today?</h2><p>A small, specific action makes it easier to begin.</p></div></div>
        <div className="priority-form-list">{startingPriorities.map(({ identityKey, label, question, icon: Icon }, index) => <Card className="priority-form-card" key={identityKey}><span className="priority-form-icon"><Icon size={19} /></span><label><strong>{label}</strong><small>{question}</small><input maxLength={240} placeholder="Write a simple next step…" value={priorities[index]?.text || ''} onChange={(event) => setPriorities((items) => items.map((item, i) => i === index ? { ...item, text: event.target.value } : item))} /></label></Card>)}</div>
      </section>
      <section className="flow-section"><div className="flow-section-heading"><span>02</span><div><h2>Qualities to practise</h2><p>Pick the qualities you want to bring into your actions.</p></div></div><div className="quality-options">{qualities.map((quality) => <button type="button" className={`quality-chip ${selected.includes(quality) ? 'selected' : ''}`} key={quality} aria-pressed={selected.includes(quality)} onClick={() => toggleQuality(quality)}>{selected.includes(quality) && <Check size={14} />}{quality}</button>)}</div></section>
      <section className="flow-section"><div className="flow-section-heading"><span>03</span><div><h2>Make room for real life</h2><p>A kind if–then plan can help when the day shifts.</p></div></div><Card className="if-then-card">{ifThen.map((item, index) => <div className="if-then-row" key={index}><label>If<input value={item.if} onChange={(event) => setIfThen((rows) => rows.map((row, i) => i === index ? { ...row, if: event.target.value } : row))} /></label><label>then<input value={item.then} onChange={(event) => setIfThen((rows) => rows.map((row, i) => i === index ? { ...row, then: event.target.value } : row))} /></label></div>)}</Card></section>
      {savePlan.isError && <p className="form-error" role="alert">We couldn’t save your plan. Your draft is still here; please try again.</p>}
      {savePlan.isSuccess && <p className="text-sm text-[var(--green)]" role="status" aria-live="polite">Your priorities and if-then plan are saved for today.</p>}
      <div className="flow-actions"><Link className="quiet-link" to="/app">Maybe later</Link><Button type="submit" disabled={savePlan.isPending}>{savePlan.isPending ? 'Saving…' : savePlan.isSuccess ? 'Plan saved' : 'Save today’s plan'} {!savePlan.isPending && <ArrowRight size={16} />}</Button></div>
    </form>
  </main>;
}
