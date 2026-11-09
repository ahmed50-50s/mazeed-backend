import mongoose from 'mongoose';

let bucket;

// Uploaded files live in MongoDB GridFS (media.files + media.chunks), which splits them into chunks
// so they are not limited by the 16MB document size.
export function mediaBucket() {
  bucket ??= new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'media' });
  return bucket;
}
