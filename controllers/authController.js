import { promisify } from 'util'; //built in ulity
import User from './../models/userModel.js';
import catchAsync from '../utlis/catchAsync.js';
import AppError from '../utlis/appError.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sendEmail from '../utlis/email.js';

dotenv.config({ path: './config.env' });

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY_TIME,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
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
  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please enter email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('email or password incorrect', 401));
  }
  createSendToken(user, 200, res);
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

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
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

export const forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('User with this email doesnot exists', 404));

  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // sent it to the user
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forget Your Password? Reset here\n${resetUrl}\n
  if you did not forget it simply ignore this email.!
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token is valid for 10 mins only',
      message,
    });

    res.status(200).json({ status: 'success', message: 'Token Sent to email' });
  } catch (error) {
    // if error occured while sending the reset then we have to set it to undefined
    user.passwordResetToken = undefined;
    user.resetPasswordExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was error sending email try again later', 500)
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    resetPasswordExpiresIn: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or expired!', 404));

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.resetPasswordExpiresIn = undefined;
  await user.save();
  createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Current password is not correct', 401));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  createSendToken(user, 200, res);
});
