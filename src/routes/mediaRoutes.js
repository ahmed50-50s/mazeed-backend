import express from 'express';
import adminAuth from '../middlewares/adminAuth.js';
import validateObjectId from '../middlewares/validateObjectId.js';
import { apiLimiter } from '../middlewares/rateLimiters.js';
import { deleteMedia, streamMedia, uploadMedia } from '../controllers/mediaController.js';

const router = express.Router();

// Public. Not under the API rate limit: one page view can load many images.
router.get('/:id', validateObjectId, streamMedia);

// Admin only
router.post('/', apiLimiter, adminAuth, uploadMedia);
router.delete('/:id', apiLimiter, adminAuth, validateObjectId, deleteMedia);

export default router;
