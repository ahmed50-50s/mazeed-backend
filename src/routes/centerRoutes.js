import express from 'express';
import * as controller from '../controllers/centerController.js';
import adminAuth from '../middlewares/adminAuth.js';
import validateObjectId from '../middlewares/validateObjectId.js';
import { clickLimiter } from '../middlewares/rateLimiters.js';

const router = express.Router();

// Public
router.get('/', controller.getCenters);
router.get('/regions', controller.getRegions);
router.get('/:id', validateObjectId, controller.getCenterById);

// Public analytics
router.post('/:id/card-click', clickLimiter, validateObjectId, controller.trackCardClick);
router.post('/:id/whatsapp-click', clickLimiter, validateObjectId, controller.trackWhatsappClick);

// Admin only
router.post('/', adminAuth, controller.createCenter);
router.patch('/:id', adminAuth, validateObjectId, controller.updateCenter);
router.delete('/:id', adminAuth, validateObjectId, controller.deleteCenter);

export default router;
