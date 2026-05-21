const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Prisma Validation Errors
  if (err.name === 'PrismaClientValidationError') {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: err.message
      }
    });
  }

  // Prisma Known Request Errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT_ERROR',
        message: 'A record with this field already exists',
        details: err.meta
      }
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found'
      }
    });
  }

  // Prisma Foreign Key Constraint Violations
  if (err.code === 'P2003') {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Foreign key constraint failed. Check that the provided provider ID exists.',
        details: err.meta
      }
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred'
    }
  });
};

module.exports = errorHandler;
