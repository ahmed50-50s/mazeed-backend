import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import multer from 'multer';

import adminAuth from '../middlewares/adminAuth.js';
import ApiError from '../utils/ApiError.js';
import { publicUrl, uploadDir } from '../config/env.js';

// Allowed media types → file extension. The extension comes from the MIME type, never the client's file name.
const TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'audio/mpeg': '.mp3',
  'audio/mp4': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/ogg': '.ogg',
  'audio/wav': '.wav',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};
const MAX_MB = { image: 10, audio: 30, video: 100 };

export const uploadPath = path.resolve(uploadDir);
fs.mkdirSync(uploadPath, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadPath,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${TYPES[file.mimetype]}`),
  }),
  limits: { fileSize: MAX_MB.video * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    TYPES[file.mimetype]
      ? cb(null, true)
      : cb(new ApiError(400, 'Unsupported file type (allowed: JPG, PNG, WEBP, GIF, MP3, M4A, OGG, WAV, MP4, WEBM)')),
});

const router = express.Router();

// POST /api/v1/uploads  (multipart/form-data, field "file") → { url }
router.post('/', adminAuth, upload.single('file'), (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'No file uploaded (form field "file")'));

  const kind = req.file.mimetype.split('/')[0];
  if (req.file.size > MAX_MB[kind] * 1024 * 1024) {
    fs.unlink(req.file.path, () => {});
    return next(new ApiError(400, `File too large (max ${MAX_MB[kind]} MB for ${kind})`));
  }

  const base = publicUrl || `${req.protocol}://${req.get('host')}`;
  return res.status(201).json({ success: true, data: { url: `${base}/uploads/${req.file.filename}` } });
});

export default router;
