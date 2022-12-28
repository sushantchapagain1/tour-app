import express from 'express';
import * as userController from '../controllers/usersController.js';
import * as authController from '../controllers/authController.js';
const Router = express.Router();

Router.post('/signup', authController.signup);
Router.post('/login', authController.login);

Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
Router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default Router;
