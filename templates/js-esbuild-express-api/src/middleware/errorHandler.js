const errorHandler = (err, req, res, next) => {
  console.error('Error stack:', err.stack);
  
  // Default error
  let error = {
    success: false,
    error: 'Internal Server Error',
    message: err.message
  };
  
  // Validation error
  if (err.name === 'ValidationError') {
    error.error = 'Validation Error';
    error.details = Object.values(err.errors).map(val => val.message);
    return res.status(400).json(error);
  }
  
  // Cast error (wrong ObjectId format)
  if (err.name === 'CastError') {
    error.error = 'Resource Not Found';
    return res.status(404).json(error);
  }
  
  // Duplicate key error
  if (err.code === 11000) {
    error.error = 'Duplicate Resource';
    return res.status(400).json(error);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.error = 'Invalid Token';
    return res.status(401).json(error);
  }
  
  if (err.name === 'TokenExpiredError') {
    error.error = 'Token Expired';
    return res.status(401).json(error);
  }
  
  res.status(err.statusCode || 500).json(error);
};

module.exports = errorHandler;
