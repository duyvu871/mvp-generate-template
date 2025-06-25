import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  errors?: Record<string, { message: string }>;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): void => {
  console.error('Error stack:', err.stack);
  
  // Default error
  let error: ErrorResponse = {
    success: false,
    error: 'Internal Server Error',
    message: err.message
  };
  
  // Validation error
  if (err.name === 'ValidationError') {
    error.error = 'Validation Error';
    error.details = Object.values(err.errors || {}).map(val => val.message);
    res.status(400).json(error);
    return;
  }
  
  // Cast error (wrong ObjectId format)
  if (err.name === 'CastError') {
    error.error = 'Resource Not Found';
    res.status(404).json(error);
    return;
  }
  
  // Duplicate key error
  if (err.code === 11000) {
    error.error = 'Duplicate Resource';
    res.status(400).json(error);
    return;
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.error = 'Invalid Token';
    res.status(401).json(error);
    return;
  }
  
  if (err.name === 'TokenExpiredError') {
    error.error = 'Token Expired';
    res.status(401).json(error);
    return;
  }
  
  res.status(err.statusCode || 500).json(error);
};

export default errorHandler;
