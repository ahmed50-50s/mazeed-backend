import rateLimit from 'express-rate-limit';

const jsonHandler = (req, res, next, options) =>
  res.status(options.statusCode).json({ success: false, message: options.message });

// General protection for the whole API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many requests, please try again later',
  handler: jsonHandler,
});

// Click tracking is cheap to spam, so keep it tight per IP to protect the analytics
export const clickLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many click events, please slow down',
  handler: jsonHandler,
});
