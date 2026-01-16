// utils/asyncHandler.js
/**
 * A utility function to wrap async Express route handlers.
 * This catches any errors that occur in async functions and passes them to the next middleware (error handler).
 * This prevents the need for repetitive try-catch blocks in every async controller function.
 * @param {Function} fn - The asynchronous function (controller).
 * @returns {Function} - A new function that wraps the original function with error handling.
 */
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
  
module.exports = asyncHandler;
  