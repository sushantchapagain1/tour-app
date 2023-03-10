import express from 'express';
import * as userController from '../controllers/usersController.js';
import * as authController from '../controllers/authController.js';
const Router = express.Router();

Router.post('/signup', authController.signup);
Router.post('/login', authController.login);

Router.patch('/update-me', authController.protect, userController.updateMe);
Router.delete('/delete-me', authController.protect, userController.deleteMe);

Router.post('/forget-password', authController.forgetPassword);
Router.patch('/reset-password/:token', authController.resetPassword);
Router.patch(
  '/update-my-password',
  authController.protect, //checks if user is authenticated or not and send the user in req too.
  authController.updatePassword
);

Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
Router.route('/active').get(userController.getActiveUsers);
Router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default Router;
