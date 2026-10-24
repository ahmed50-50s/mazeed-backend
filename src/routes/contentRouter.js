import express from 'express';
import adminAuth from '../middlewares/adminAuth.js';
import validateObjectId from '../middlewares/validateObjectId.js';

// Listing inactive (hidden) items is an admin view
const adminWhenIncludingInactive = (req, res, next) =>
  req.query.includeInactive === 'true' ? adminAuth(req, res, next) : next();

// Standard routes for an ordered content collection built with createCrudController
function contentRouter(controller) {
  const router = express.Router();

  // Public
  router.get('/', adminWhenIncludingInactive, controller.list);

  // Admin only
  router.post('/', adminAuth, controller.create);
  router.patch('/:id', adminAuth, validateObjectId, controller.update);
  router.delete('/:id', adminAuth, validateObjectId, controller.remove);

  return router;
}

export default contentRouter;
