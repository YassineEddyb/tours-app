const crypto = require("crypto");
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
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
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
  passwordResetToken: String,
  passwordResetExpires: Date,
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

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.inNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
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

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
