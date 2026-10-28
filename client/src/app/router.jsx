import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AppLayout from '../layouts/AppLayout.jsx';
import { SessionGate } from '../routes/SessionGate.jsx';
import { VerifyEmailPage, ForgotPasswordPage, ResetPasswordPage } from '../features/auth/pages/AccountRecoveryPages.jsx';
const LandingPage = lazy(() => import('../features/landing/pages/LandingPage.jsx'));
const AuthPage = lazy(() => import('../features/auth/pages/AuthPage.jsx'));
const HomePage = lazy(() => import('../features/home/pages/HomePage.jsx'));
const PlanPage = lazy(() => import('../features/dailyPlan/PlanPage.jsx'));
const HabitsPage = lazy(() => import('../features/habit/HabitsPage.jsx'));
const IdentityPage = lazy(() => import('../features/identity/IdentityPage.jsx'));
const ReviewPage = lazy(() => import('../features/review/ReviewPage.jsx'));
const ReviewDonePage = lazy(() => import('../features/review/ReviewDonePage.jsx'));
const SettingsPage = lazy(() => import('../features/user/pages/SettingsPage.jsx'));
const JourneyPage = lazy(() => import('../features/journey/JourneyPage.jsx'));
const InsightsPage = lazy(() => import('../features/insights/InsightsPage.jsx'));
const FinancePage = lazy(() => import('../features/finance/FinancePage.jsx'));
const JournalPage = lazy(() => import('../features/journal/JournalPage.jsx'));
const OnboardingPage = lazy(() => import('../features/OnboardingPage.jsx'));
const page = (element) => <Suspense fallback={<div className="route-loading" aria-label="Loading"><span /></div>}>{element}</Suspense>;

export const router = createBrowserRouter([
  { element: <PublicLayout />, children: [{ path: '/', element: page(<LandingPage />) }, { path: '/login', element: <SessionGate publicOnly>{page(<AuthPage mode="login" />)}</SessionGate> }, { path: '/signup', element: <SessionGate publicOnly>{page(<AuthPage mode="signup" />)}</SessionGate> }, { path: '/verify-email', element: page(<VerifyEmailPage />) }, { path: '/forgot-password', element: page(<ForgotPasswordPage />) }, { path: '/reset-password', element: page(<ResetPasswordPage />) }] },
  { path: '/onboarding', element: <SessionGate>{page(<OnboardingPage />)}</SessionGate> },
  { path: '/app', element: <SessionGate><AppLayout /></SessionGate>, children: [
    { index: true, element: page(<HomePage />) },
    { path: 'plan', element: page(<PlanPage />) }, { path: 'habits', element: page(<HabitsPage />) },
    { path: 'identities', element: page(<IdentityPage />) }, { path: 'review', element: page(<ReviewPage />) },
    { path: 'review/done', element: page(<ReviewDonePage />) }, { path: 'settings', element: page(<SettingsPage />) },
    { path: 'journey', element: page(<JourneyPage />) }, { path: 'insights', element: page(<InsightsPage />) },
    { path: 'finance', element: page(<FinancePage />) }, { path: 'journal', element: page(<JournalPage />) },
  ] },
  { path: '*', element: <Navigate to="/" replace /> },
]);
