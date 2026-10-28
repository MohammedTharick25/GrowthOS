import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { connectDatabase } from './src/config/dbConfig.js';
import authRoutes from './src/modules/auth/auth.routes.js';
import userRoutes from './src/modules/user/user.routes.js';
import identityRoutes from './src/modules/identity/identity.routes.js';
import habitRoutes from './src/modules/habit/habit.routes.js';
import checkinRoutes from './src/modules/checkin/checkin.routes.js';
import dailyPlanRoutes from './src/modules/dailyPlan/dailyPlan.routes.js';
import reviewRoutes from './src/modules/review/review.routes.js';
import studySessionRoutes from './src/modules/studySession/studySession.routes.js';
import courageMomentRoutes from './src/modules/courageMoment/courageMoment.routes.js';
import streakRoutes from './src/modules/streak/streak.routes.js';
import gamificationRoutes from './src/modules/gamification/gamification.routes.js';
import { seedBadges } from './src/modules/gamification/gamification.service.js';
import { startScheduler } from './src/utils/scheduler.js';
import financeRoutes from './src/modules/finance/finance.routes.js';
import journeyRoutes from './src/modules/journey/journey.routes.js';
import analyticsRoutes from './src/modules/analytics/analytics.routes.js';
import qualityRoutes from './src/modules/user/quality.routes.js';
import { errorHandler, notFound } from './src/utils/errorHandler.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable' } }));
app.use('/api', (_req, res, next) => mongoose.connection.readyState === 1 ? next() : res.status(503).json({ success: false, error: { message: 'The database is not connected yet. Please try again shortly.' } }));
app.use('/api/auth/v1', authRoutes);
app.use('/api/user/v1', userRoutes);
app.use('/api/identity/v1', identityRoutes);
app.use('/api/habit/v1', habitRoutes);
app.use('/api/checkin/v1', checkinRoutes);
app.use('/api/dailyPlan/v1', dailyPlanRoutes);
app.use('/api/review/v1', reviewRoutes);
app.use('/api/studySession/v1', studySessionRoutes);
app.use('/api/courageMoment/v1', courageMomentRoutes);
app.use('/api/streak/v1', streakRoutes);
app.use('/api/gamification/v1', gamificationRoutes);
app.use('/api/finance/v1', financeRoutes);
app.use('/api/journey/v1', journeyRoutes);
app.use('/api/analytics/v1', analyticsRoutes);
app.use('/api/quality/v1', qualityRoutes);
app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => console.log(`GrowthOS API listening on ${env.PORT}`));
  const connectWithRetry = async () => {
    try { await connectDatabase(); const { seedIdentities } = await import('./src/modules/identity/identity.service.js'); await seedIdentities(); await seedBadges(); startScheduler(); }
    catch (error) { console.warn(`MongoDB unavailable (${error.message}). Retrying in 5 seconds.`); setTimeout(connectWithRetry, 5000).unref(); }
  };
  connectWithRetry();
}

export default app;
