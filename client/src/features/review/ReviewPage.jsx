import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useSaveReview } from '../practice/hooks.js';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';

const prompts = [
  ['career', 'Career', 'What did I learn or build today?'], ['health', 'Health', 'How did I care for my body?'], ['selfRespect', 'Self-respect', 'Did I consider my needs or express myself honestly?'],
  ['relationships', 'Relationships', 'How did I show care and keep healthy boundaries?'], ['discipline', 'Follow-through', 'Did I follow through on my most important commitment?'], ['tomorrow', 'Learning', 'What would I like to do differently tomorrow?'],
];
export default function ReviewPage() {
  const [values, setValues] = useState({ answers: {} });
  const save = useSaveReview(); const navigate = useNavigate();
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const updateAnswer = (key, value) => setValues((current) => ({ ...current, answers: { ...current.answers, [key]: value } }));
  const submit = (event) => { event.preventDefault(); save.mutate(values, { onSuccess: (result) => navigate('/app/review/done', { state: { badge: result.badgesAwarded?.[0] || null, xpDelta: result.xpDelta || 0 } }) }); };
  return <main className="flow-page review-page">
    <Link className="back-link" to="/app"><ArrowLeft size={16} /> Back to today</Link>
    <header className="flow-heading"><span className="section-kicker">EVENING PRACTICE · 5 MIN</span><h1>Notice what today held.</h1><p>This is a space to learn, not to grade yourself.</p><div className="flow-dots" aria-label="Reflection"><i className="active" /><i className="active" /><i /></div></header>
    <form onSubmit={submit}>
      <section className="flow-section"><div className="flow-section-heading"><span>01</span><div><h2>A few things to notice</h2><p>Short answers are enough. Skip anything that doesn’t fit today.</p></div></div><div className="review-prompts">{prompts.map(([key, label, question]) => <label className="review-prompt" key={key}><strong>{label}</strong><span>{question}</span><textarea rows="2" maxLength="500" value={values.answers[key] || ''} onChange={(event) => updateAnswer(key, event.target.value)} /></label>)}</div></section>
      <section className="flow-section"><div className="flow-section-heading"><span>02</span><div><h2>Give yourself credit</h2><p>Notice what helped you show up.</p></div></div><div className="review-prompts">{[['didWell', 'What did I do well?'], ['learned', 'What did I learn?'], ['respectedSelf', 'When did I respect myself?'], ['challenge', 'What challenged me?'], ['improveTomorrow', 'One thing to improve tomorrow?'], ['valuesMoment', 'When did I act on my values instead of fear?']].map(([key, question]) => <label className="review-prompt" key={key}><span>{question}</span><textarea rows="2" maxLength="500" value={values[key] || ''} onChange={(event) => update(key, event.target.value)} /></label>)}</div></section>
      <section className="flow-section rating-section"><div className="flow-section-heading"><span>03</span><div><h2>How did you feel?</h2><p>There’s no right answer.</p></div></div>{[['mood', 'Mood'], ['energy', 'Energy']].map(([key, label]) => <fieldset className="rating-field" key={key}><legend>{label}</legend><div>{[1,2,3,4,5].map((score) => <button type="button" key={score} className={values[key] === score ? 'selected' : ''} aria-pressed={values[key] === score} onClick={() => update(key, score)}>{score}</button>)}</div><small>Low <span>High</span></small></fieldset>)}</section>
      {save.isError && <p className="form-error" role="alert">We couldn’t save this reflection. Please try again.</p>}
      <div className="flow-actions"><Link className="quiet-link" to="/app">Maybe later</Link><Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save reflection'} <ArrowRight size={16} /></Button></div>
    </form>
    <p className="review-signoff"><Check size={15} /> I can be a beginner and still be making progress.</p>
  </main>;
}
