// express is a node js minimal framework with higher leval of abstraction used for complex routing,easier handling of req and res
// middleware server-side rendering ,etc.

import express from 'express';
import morgan from 'morgan';
import AppError from './utlis/appError.js';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import { globalErrorHandler } from './controllers/errorController.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import expressMongoSanitize from 'express-mongo-sanitize';
import { xssFilter } from 'helmet';
import hpp from 'hpp';

dotenv.config({ path: './config.env' });
const __dirname = dirname(fileURLToPath(import.meta.url));
export const app = express();

// 1.MIDDLEWARES.

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const oneHour = 60 * 60 * 1000;

const limiter = rateLimit({
  max: 100,
  windowMs: oneHour, //100 request un 1 hour
  message: 'Too many requests from this ip ! Please try again later',
});

// Apply the rate limiting middleware to all requests
// app.use(limiter)

// Apply the rate limiting middleware to API calls only
app.use('/api', limiter);

app.use(express.json());
app.use(expressMongoSanitize());
app.use(xssFilter());
app.use(express.static(`${__dirname}/public`));

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// our own middleware due to req response stop we need to write middleware code in top.
app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});

// Middleware for specfic route
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// page not found
app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on this server`), 404);
});

// // ignore favicon
// app.use((req, res, next) => {
//   if (req.originalUrl.includes('/favicon.ico')) {
//     res.status(204).end();
//   }
//   next();
// });

app.use(globalErrorHandler);
