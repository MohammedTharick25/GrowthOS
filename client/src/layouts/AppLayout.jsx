import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Activity, BookOpen, CalendarDays, ChartNoAxesCombined, Compass, CreditCard, Heart, House, Menu, Settings, Sparkles, X } from 'lucide-react';

const links = [
  ['Today', '/app', House], ['Plan', '/app/plan', CalendarDays], ['Habits', '/app/habits', Activity], ['Identities', '/app/identities', Heart],
  ['Journey', '/app/journey', Compass], ['Insights', '/app/insights', ChartNoAxesCombined], ['Finance', '/app/finance', CreditCard], ['Journal', '/app/journal', BookOpen], ['Settings', '/app/settings', Settings],
];
const mobileLinks = [links[0], links[7], links[4], links[5], links[6]];
const moreLinks = [links[1], links[2], links[3], links[8]];

export default function AppLayout() {
  const [moreOpen, setMoreOpen] = useState(false);
  return <div className="app-shell">
    <aside className="sidebar"><Link className="brand" to="/app"><span className="brand-mark"><Sparkles size={18} /></span> growth<span>OS</span></Link><p className="side-label">YOUR PRACTICE</p><nav>{links.map(([label, to, Icon]) => <NavLink key={to} to={to} end={to === '/app'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{label}</span></NavLink>)}</nav><div className="sidebar-note"><span>✦</span><p>Small steps count.<br />Rest is part of growth.</p></div></aside>
    <div className="app-main">
      <header className="mobile-top"><Link className="brand" to="/app"><span className="brand-mark"><Sparkles size={17} /></span> growth<span>OS</span></Link><button className="icon-button" aria-label="More sections" aria-expanded={moreOpen} onClick={() => setMoreOpen(true)}><Menu size={20} /></button></header>
      <main className="page-content"><Outlet /></main>
      <nav className="bottom-nav" aria-label="Main navigation">{mobileLinks.map(([label, to, Icon]) => <NavLink key={to} to={to} end={to === '/app'} aria-label={label} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={20} /><small>{label}</small></NavLink>)}</nav>
      {moreOpen && <div className="mobile-menu-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setMoreOpen(false); }}><section className="mobile-menu-sheet" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title"><div><span id="mobile-menu-title">More of your practice</span><button onClick={() => setMoreOpen(false)} aria-label="Close menu"><X size={18} /></button></div><nav>{moreLinks.map(([label, to, Icon]) => <NavLink key={to} to={to} onClick={() => setMoreOpen(false)}><Icon size={18} />{label}</NavLink>)}</nav></section></div>}
    </div>
  </div>;
}
