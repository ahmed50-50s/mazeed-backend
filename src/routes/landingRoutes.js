import express from 'express';
import { getLandingData } from '../controllers/landingController.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import adminAuth from '../middlewares/adminAuth.js';

const router = express.Router();

// Public: one request for the whole home + about page content
router.get('/landing-data', getLandingData);

// Site-wide settings (contact details, WhatsApp messages, stats, page copy)
router.get('/settings', getSettings);
router.patch('/settings', adminAuth, updateSettings);

export default router;
