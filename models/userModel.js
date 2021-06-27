const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please enter your name"],
  },
  email: {
    type: String,
    required: [true, "please enter your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please provide a valid Email"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "password required"],
    minlength: 6,
    maxlength: 20,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "confirm password required"],
    minlength: 6,
    maxlength: 20,
    validate: {
      // works only on save
      validator: function (el) {
        return el === this.password;
      },
      message: "passwords are not the same",
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  // only run this function if password was modified
  if (!this.isModified("password")) return next();

  // hash the password with 12 cost
  this.password = await bcrypt.hash(this.password, 12);

  // delete confirmPassword field(
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChaged = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedAtTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimeStamp < changedAtTimeStamp;
  }

  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
