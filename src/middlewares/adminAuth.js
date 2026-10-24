import crypto from 'node:crypto';
import { adminSecret } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const expected = crypto.createHash('sha256').update(adminSecret).digest();

// Protects write endpoints. The client must send:  x-admin-secret: <ADMIN_SECRET>
// Both values are hashed first so timingSafeEqual always compares equal-length buffers
// and the secret's length is not leaked through timing.
function adminAuth(req, res, next) {
  const provided = req.get('x-admin-secret');
  if (!provided) {
    return next(new ApiError(401, 'Missing x-admin-secret header'));
  }

  const providedHash = crypto.createHash('sha256').update(provided).digest();
  if (!crypto.timingSafeEqual(providedHash, expected)) {
    return next(new ApiError(403, 'Invalid admin secret'));
  }

  return next();
}

export default adminAuth;
