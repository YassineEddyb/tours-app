const User = require("../models/userModel");
const catchAsync = require("../utils/catch-async");

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);

  res.status(200).json({
    status: "success",
    data: newUser,
  });
});
