import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, BookOpen, HeartHandshake, Sparkles } from 'lucide-react';
import { practiceApi } from './api.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';

export function QuickActions() {
  const client = useQueryClient();
  const [study, setStudy] = useState({ minutes: '', topic: '', learned: '', explainedAloud: false });
  const [moment, setMoment] = useState({ text: '', kind: 'courage' });
  const logStudy = useMutation({ mutationFn: practiceApi.studySession, onSuccess: () => { setStudy({ minutes: '', topic: '', learned: '', explainedAloud: false }); client.invalidateQueries({ queryKey: ['studySession'] }); client.invalidateQueries({ queryKey: ['analytics'] }); } });
  const logMoment = useMutation({ mutationFn: practiceApi.courageMoment, onSuccess: () => { setMoment({ text: '', kind: 'courage' }); client.invalidateQueries({ queryKey: ['courageMoment'] }); client.invalidateQueries({ queryKey: ['gamification', 'badges'] }); client.invalidateQueries({ queryKey: ['analytics'] }); } });
  return <section className="quick-actions">
    <div className="section-heading compact"><div><span className="section-kicker">CAPTURE THE MOMENT</span><h2>Small things worth remembering</h2></div></div>
    <div className="quick-action-grid">
      <Card className="quick-action-card"><div className="quick-action-title"><span><BookOpen size={17} /></span><div><strong>Study session</strong><small>Keep a note of what you learned.</small></div></div><form onSubmit={(event) => { event.preventDefault(); logStudy.mutate({ ...study, minutes: Number(study.minutes) }); }}><div className="quick-form-row"><input aria-label="Minutes studied" type="number" min="1" max="1440" required placeholder="Minutes" value={study.minutes} onChange={(event) => setStudy({ ...study, minutes: event.target.value })} /><input aria-label="Study topic" placeholder="Skill or topic" value={study.topic} onChange={(event) => setStudy({ ...study, topic: event.target.value })} /></div><textarea aria-label="What I learned" rows="2" placeholder="What did you learn?" value={study.learned} onChange={(event) => setStudy({ ...study, learned: event.target.value })} /><label className="check-line"><input type="checkbox" checked={study.explainedAloud} onChange={(event) => setStudy({ ...study, explainedAloud: event.target.checked })} /> I explained it aloud</label><Button type="submit" disabled={logStudy.isPending}>Save study note <ArrowUpRight size={15} /></Button></form></Card>
      <Card className="quick-action-card"><div className="quick-action-title"><span><HeartHandshake size={17} /></span><div><strong>A values moment</strong><small>Notice a time you acted with courage.</small></div></div><form onSubmit={(event) => { event.preventDefault(); logMoment.mutate(moment); }}><select aria-label="Moment type" value={moment.kind} onChange={(event) => setMoment({ ...moment, kind: event.target.value })}><option value="courage">Courage</option><option value="assertive">I spoke up</option><option value="boundary">I kept a boundary</option><option value="win">A small win</option></select><textarea aria-label="Describe the moment" rows="3" required maxLength="500" placeholder="What happened? One sentence is enough." value={moment.text} onChange={(event) => setMoment({ ...moment, text: event.target.value })} /><Button type="submit" disabled={logMoment.isPending}>Save this moment <ArrowUpRight size={15} /></Button></form></Card>
    </div>
    {(logStudy.isSuccess || logMoment.isSuccess) && <p className="quick-success" role="status">Saved. That moment counts.</p>}
    {logMoment.data?.badgesAwarded?.[0] && <div className="milestone-toast" role="status"><span className="milestone-particles" aria-hidden="true">{[0,1,2,3,4,5].map((particle)=><i key={particle}>✦</i>)}</span><Sparkles size={16} /><span><strong>A milestone to remember</strong><small>{logMoment.data.badgesAwarded[0].name}</small></span></div>}
    {(logStudy.isError || logMoment.isError) && <p className="form-error" role="alert">We couldn’t save that just now. Please try again.</p>}
  </section>;
}
