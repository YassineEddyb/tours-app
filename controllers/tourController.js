const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/api-features");

exports.topFiveTours = async (req, res, next) => {
  req.query.sort = "ratingsAverage,price";
  req.query.limit = 5;
  req.query.fields = "name,price,summary,ratingsAverage,difficulty";
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    let features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  const tourId = req.params.id;
  console.log(tourId);
  try {
    const tour = await Tour.findById(tourId);
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: "this tour is not exist",
    });
  }
};

exports.createTour = async (req, res) => {
  const name = req.body.name;
  const rating = req.body.rating;
  const price = req.body.price;

  try {
    const newTour = await Tour.create(req.body);

    res.status(200).json({
      status: "success",
      message: newTour,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  const tourId = req.params.id;

  try {
    const tour = await Tour.findByIdAndUpdate(tourId, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: "this tour is not exist",
    });
  }
};

exports.deleteTour = async (req, res) => {
  const tourId = req.params.id;

  try {
    const tour = await Tour.findByIdAndDelete(tourId);
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: "this tour is not exist",
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "failed",
      message: "this tour is not exist",
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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

    res.status(200).json({
      status: "success",
      results: plan.length,
      data: {
        plan,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "failed",
      message: "this tour is not exist",
    });
  }
};
