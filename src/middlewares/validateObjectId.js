import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

function validateObjectId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new ApiError(400, `Invalid id:${req.params.id}`));
  }
  return next();
}

export default validateObjectId;
