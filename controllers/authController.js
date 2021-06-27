const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/userModel");
const catchAsync = require("../utils/catch-async");
const AppError = require("../utils/app-error");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRED_IN,
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signToken(newUser._id);

  res.status(200).json({
    status: "success",
    token: token,
    data: newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email & password exist
  if (!email || !password) {
    return next(new AppError("please provide email and passowrd!", 400));
  }

  // check if user & passowrd is correct
  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401));
  }

  // check if everything is ok, send token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token: token,
  });
});

exports.protectRouter = catchAsync(async (req, res, next) => {
  // Getting token check of it's there
  let token;
  if (req.headers.authorize && req.headers.authorize.startsWith("Bearer")) {
    token = req.headers.authorize.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not loged in, please login to get accessed", 401)
    );
  }

  // Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user still exists
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError("the user belonging to the token is no longer exist", 401)
    );
  }

  // check if user changer password after the token was issued
  if (freshUser.passwordChaged(decoded.iat)) {
    return next(
      new AppError("user password has changed, please login again", 401)
    );
  }

  // Grant access to protected routs
  req.user = freshUser;
  next();
});
