import express from 'express';
import { getSummary, recordEvent } from '../controllers/analyticsController.js';
import adminAuth from '../middlewares/adminAuth.js';
import validate from '../middlewares/validate.js';
import { clickLimiter } from '../middlewares/rateLimiters.js';
import { analyticsEventSchema } from '../validators/analyticsValidator.js';

const router = express.Router();

// Public. The site sends events with navigator.sendBeacon, which posts JSON as text/plain
// (a "simple" request, so no CORS preflight and it survives the page opening WhatsApp).
router.post(
  '/events',
  clickLimiter,
  express.json({ type: 'text/plain', limit: '2kb' }),
  validate(analyticsEventSchema),
  recordEvent
);

// Admin only
router.get('/summary', adminAuth, getSummary);

export default router;
