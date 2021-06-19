const Tour = require("../models/tourModel");

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json({
      status: "success",
      data: {
        tours: tours,
      },
    });
  } catch (err) {
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
