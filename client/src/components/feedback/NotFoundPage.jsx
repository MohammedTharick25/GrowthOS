import { Link } from 'react-router-dom';
import { GrowthMark } from '../ui/GrowthMark.jsx';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main className="not-found"><GrowthMark /><span className="section-kicker">A SMALL DETOUR</span><h1>This page isn’t here.</h1><p>No worries. Let’s find your way back.</p><Link className="button button-primary" to="/"><ArrowLeft size={17} /> Back to home</Link></main>
  );
}
