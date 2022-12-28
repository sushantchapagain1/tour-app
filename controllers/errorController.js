import dotenv from 'dotenv';
import AppError from '../utlis/appError.js';
dotenv.config({ path: './config.env' });

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value} Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Data.${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTerror = () =>
  new AppError('Invalid Token!.Please login again', 401);

const handleTokenError = () =>
  new AppError('Token Expried!.Please login again', 401);

const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error, //es6 error:error shorthand ho yo
    message: error.message,
    stack: error,
  });
};

const sendErrorProd = (error, res) => {
  // Operational, trusted error: send message to client
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', error);
    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

export const globalErrorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
    console.log(error);
  }
  if (process.env.NODE_ENV === 'production') {
    // let err = { ...error };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') error = handleJWTerror();
    if (error.name === 'TokenExpiredError') error = handleTokenError();
    sendErrorProd(error, res);
  }
};
