import User from '../models/userModel.js';
import catchAsync from '../utlis/catchAsync.js';

export const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

export const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route is not Defined',
  });
};

export const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route is not Defined',
  });
};

export const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route is not Defined',
  });
};

export const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route is not Defined',
  });
};
