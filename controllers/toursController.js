import Tour from './../models/tourModel.js';
import APIFeatures from '../utlis/apiFeatures.js';
import AppError from '../utlis/appError.js';
import catchAsync from '../utlis/catchAsync.js';
// example of middelware
// export const checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing Name Or Price',
//     });
//   }
//   next();
// };

export const aliashTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// ROUTE HANDLERS
export const getAllTour = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.filter)
    .filter()
    .sort()
    .limitFields()
    .paginate(); //new obj and using methods

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    data: {
      tours,
    },
  });
});

export const createTour = catchAsync(async (req, res, next) => {
  // const newTour = new Tour({})
  // newTour.save()

  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

export const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Tour.findOne({ _id: req.params.id })
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

export const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

export const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: 'difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

export const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$id' } },
    { $project: { _id: 0 } },
    { $sort: { numTourStarts: -1 } },
    { $limit: 12 },
  ]);
  res.status(200).json({
    status: 'success',
    data: plan,
  });
});
