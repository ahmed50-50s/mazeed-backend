import 'dotenv/config';

const required = ['MONGO_URI', 'ADMIN_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

if (process.env.ADMIN_SECRET.length < 16) {
  console.error('ADMIN_SECRET must be at least 16 characters long');
  process.exit(1);
}

export const nodeEnv = process.env.NODE_ENV || 'development';
export const port = Number(process.env.PORT) || 5000;
export const mongoUri = process.env.MONGO_URI;
export const adminSecret = process.env.ADMIN_SECRET;
export const maxUploadMb = Number(process.env.MAX_UPLOAD_MB) || 50;
export const corsOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Where uploaded media is stored on disk. Point it outside the app folder in production
// (e.g. /home/<user>/mazeed-uploads) so a redeploy does not wipe the files.
export const uploadDir = process.env.UPLOAD_DIR || 'uploads';
// Public base URL of this API, used to build absolute links to uploaded files
// (e.g. https://back.mazeed-academy.com). Defaults to the request's own host.
export const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/+$/, '');
