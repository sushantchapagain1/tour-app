import { promisify } from 'util'; //built in ulity
import User from './../models/userModel.js';
import catchAsync from '../utlis/catchAsync.js';
import AppError from '../utlis/appError.js';

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY_TIME,
  });
};

export const signup = catchAsync(async (req, res, next) => {
  // in signup donot use create(req.body) cz auyone can assign them as admin
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   confirmPassword: req.body.confirmPassword,
  // });

  const newUser = await User.create(req.body);

  // doing here cz after signing in we sent sucess page with token .
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please enter email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('email or password incorrect', 401));
  }
  // 3.if ok send jwt token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('You are not logged in', 401));

  // verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check if user exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError('The user belonging to the token no longer exists', 401)
    );

  // check if user changed password
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'The user recently changed password! Please log in again',
        401
      )
    );
  }

  // new user to fresh user
  req.user = freshUser;

  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles['admin','lead-guide','guide','user]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Yo donot have access to perform this task', 403)
      );
    }
    next();
  };
};
