import express from 'express';
import * as tourController from '../controllers/toursController.js';
import * as authController from '../controllers/authController.js';

const Router = express.Router();

// Router.param('id', tourController.checkValidID);

Router.route('/top-five-tours').get(
  tourController.aliashTopTours,
  tourController.getAllTour
);

Router.route('/tour-stats').get(tourController.getTourStats);
Router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

Router.route('/')
  .get(authController.protect, tourController.getAllTour)
  .post(tourController.createTour);
Router.route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

export default Router;
