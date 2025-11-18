// - Cleaner code: No repetitive try-catch blocks.
// - Centralized error handling: You can customize how errors are handled in one place.
// - More readable: Focus on business logic, not boilerplate.

//  Think of It Like This:
// Imagine you're building a house. Instead of checking every single wire manually for faults, you install a circuit breaker. If something goes wrong, the breaker trips and protects the whole system.
// asyncHandler is your circuit breaker for async functions in Express.




const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    res.status(500).json({ message: error.message });
  });
};

export default asyncHandler;