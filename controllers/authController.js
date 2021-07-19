const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const catchAsync = require("../utils/catch-async");
const AppError = require("../utils/app-error");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRED_IN,
  });
};

const createAndSendToken = (user, status, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  res.status(status).json({
    status: "success",
    token: token,
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  createAndSendToken(newUser, 201, res);
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
  createAndSendToken(user, 208, res);
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

exports.restrectTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "you do not have the permission to perform this action",
          403
        )
      );
    }

    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // get user based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("there is no user with that email", 404));
  }

  // generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send it to the user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `forger your password? go to ${resetURL} and change your password`;

  try {
    await sendEmail({
      from: "tours-app",
      to: "yassindib0608@gmail.com",
      subject: "your password reset URL",
      text: message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    console.log(err);
    return next(new AppError("there was an error when sending email", 500));
  }

  res.status(200).json({
    status: "success",
    message: "token send to email",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if token has not expired, and there is user, set the new passowrd
  if (!user) {
    return next(new AppError("token is invalid or has expired", 400));
  }

  user.passaword = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save({ validateBeforeSave: false });

  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get the carrent user
  const user = await User.findById(req.user.id).select("+password");

  // check if the posted current password is correct
  if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
    return next(new AppError("current password is not correct", 404));
  }

  // if so update the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save({ validateBeforeSave: false });

  createAndSendToken(user, 200, res);
});
