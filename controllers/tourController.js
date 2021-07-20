const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/api-features");
const catchAsync = require("../utils/catch-async");
const AppError = require("../utils/app-error");

exports.topFiveTours = async (req, res, next) => {
  req.query.sort = "ratingsAverage,price";
  req.query.limit = 5;
  req.query.fields = "name,price,summary,ratingsAverage,difficulty";
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  let features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // throw "test error";
  // send response
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tourId = req.params.id;
  const tour = await Tour.findById(tourId).populate("reviews");

  console.log(tour);

  if (!tour) {
    next(new AppError("tour not found", 404));
    return;
  }

  // send response
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // const name = req.body.name;
  // const rating = req.body.rating;
  // const price = req.body.price;

  const newTour = await Tour.create(req.body);

  // send response
  res.status(200).json({
    status: "success",
    message: newTour,
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tourId = req.params.id;

  const tour = await Tour.findByIdAndUpdate(tourId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    next(new AppError("tour not found", 404));
    return;
  }

  // send response
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.7 } },
    },
    {
      $group: {
        _id: "$difficulty",
        avgRatings: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);

  // send response
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
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
        _id: { $month: "$startDates" },
        toursCount: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { toursCount: -1 },
    },
  ]);

  // send response
  res.status(200).json({
    status: "success",
    results: plan.length,
    data: {
      plan,
    },
  });
});
