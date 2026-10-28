import { GrowthMark } from './GrowthMark.jsx';

export function PageLoader() {
  return (
    <main className="loader-screen" aria-label="Loading GrowthOS">
      <GrowthMark />
      <span className="loader-line" />
    </main>
  );
}
