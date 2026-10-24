import ApiError from '../utils/ApiError.js';

// Validates req.body against a Zod schema and replaces it with the parsed (trimmed, coerced) value.
// Errors use the same { field, message } details shape as Mongoose validation errors.
function validate(schema) {
  return function validateBody(req, res, next) {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || '(body)',
        message: issue.message,
      }));
      return next(new ApiError(400, 'Validation failed', details));
    }
    req.body = result.data;
    return next();
  };
}

export default validate;
