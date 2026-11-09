import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

import { nodeEnv, corsOrigins } from './config/env.js';
import centerRoutes from './routes/centerRoutes.js';
import landingRoutes from './routes/landingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import contentRouter from './routes/contentRouter.js';
import mediaRoutes from './routes/mediaRoutes.js';
import {
  pricingPlanController,
  serviceController,
  showcaseController,
  testimonialController,
} from './controllers/contentControllers.js';
import { apiLimiter } from './middlewares/rateLimiters.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Needed for correct client IPs in rate limiting when deployed behind a proxy (Render, Railway, Nginx...)
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: corsOrigins.includes('*') ? '*' : corsOrigins,
    allowedHeaders: ['Content-Type', 'x-admin-secret'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '50kb' }));
if (nodeEnv !== 'test') app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1', apiLimiter);
app.use('/api/v1', landingRoutes);
app.use('/api/v1/centers', centerRoutes);
app.use('/api/v1/services', contentRouter(serviceController));
app.use('/api/v1/pricing-plans', contentRouter(pricingPlanController));
app.use('/api/v1/showcase', contentRouter(showcaseController));
app.use('/api/v1/testimonials', contentRouter(testimonialController));
app.use('/api/v1/analytics', analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
