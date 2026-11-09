import Busboy from 'busboy';
import mongoose from 'mongoose';
import { pipeline } from 'node:stream/promises';
import { maxUploadMb } from '../config/env.js';
import { mediaBucket } from '../services/mediaStorage.js';
import ApiError from '../utils/ApiError.js';

const ALLOWED_TYPES = /^(image|audio|video)\/|^application\/pdf$/;

const publicUrl = (req, id) => `${req.protocol}://${req.get('host')}/api/v1/media/${id}`;

// POST /api/v1/media  multipart/form-data with one field named "file".
// The file is streamed straight into GridFS, never held in memory.
export function uploadMedia(req, res, next) {
  if (!req.is('multipart/form-data')) {
    return next(new ApiError(400, 'Send the file as multipart/form-data in a field named "file"'));
  }

  let busboy;
  try {
    busboy = Busboy({ headers: req.headers, limits: { files: 1, fileSize: maxUploadMb * 1024 * 1024 } });
  } catch (err) {
    return next(new ApiError(400, err.message));
  }

  let upload = null;
  let rejected = null;

  busboy.on('file', (field, file, { filename, mimeType }) => {
    if (field !== 'file' || !ALLOWED_TYPES.test(mimeType)) {
      rejected = new ApiError(415, `Unsupported file type: ${mimeType} (images, audio, video and PDF only)`);
      file.resume();
      return;
    }

    const stream = mediaBucket().openUploadStream(filename, { metadata: { contentType: mimeType } });
    upload = pipeline(file, stream).then(async () => {
      if (file.truncated) {
        await mediaBucket().delete(stream.id);
        throw new ApiError(413, `File is larger than ${maxUploadMb}MB`);
      }
      return { id: String(stream.id), filename, contentType: mimeType, size: stream.length };
    });
    // Handled when busboy closes; this only stops an early failure from counting as unhandled
    upload.catch(() => {});
  });

  busboy.on('close', async () => {
    try {
      if (rejected) throw rejected;
      if (!upload) throw new ApiError(400, 'No file sent in field "file"');
      const media = await upload;
      res.status(201).json({ success: true, data: { ...media, url: publicUrl(req, media.id) } });
    } catch (err) {
      next(err);
    }
  });
  busboy.on('error', (err) => next(new ApiError(400, err.message)));

  req.pipe(busboy);
}

// GET /api/v1/media/:id  Public. Supports Range requests so audio and video can seek.
export async function streamMedia(req, res) {
  const id = new mongoose.Types.ObjectId(req.params.id);
  const [file] = await mediaBucket().find({ _id: id }).limit(1).toArray();
  if (!file) throw new ApiError(404, 'Media not found');

  res.set({
    'Content-Type': file.metadata?.contentType || 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    // A file never changes under the same id
    'Cache-Control': 'public, max-age=31536000, immutable',
    ETag: `"${file._id}"`,
    // The site (mazeed-academy.com) is a different origin from the API; helmet would block it otherwise
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  if (req.fresh) return res.status(304).end();

  let start = 0;
  let end = file.length - 1;
  const range = req.range(file.length);
  if (range === -1) {
    res.set('Content-Range', `bytes */${file.length}`);
    return res.status(416).end();
  }
  if (Array.isArray(range) && range.type === 'bytes' && range.length === 1) {
    ({ start, end } = range[0]);
    res.status(206).set('Content-Range', `bytes ${start}-${end}/${file.length}`);
  }
  res.set('Content-Length', String(end - start + 1));
  if (req.method === 'HEAD') return res.end();

  try {
    // GridFS `end` is exclusive
    await pipeline(mediaBucket().openDownloadStream(id, { start, end: end + 1 }), res);
  } catch (err) {
    // The viewer closed the page or skipped ahead mid-stream; nothing left to answer
    if (!res.headersSent) throw err;
  }
}

// DELETE /api/v1/media/:id
export async function deleteMedia(req, res) {
  try {
    await mediaBucket().delete(new mongoose.Types.ObjectId(req.params.id));
  } catch (err) {
    if (/File not found/i.test(err.message)) throw new ApiError(404, 'Media not found');
    throw err;
  }
  res.json({ success: true, message: 'Media deleted', data: { id: req.params.id } });
}
