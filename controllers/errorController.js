const AppError = require("../utils/app-error");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // operational Errors
  if (err.isOperational) {
    res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  }
  // programming Errors
  else {
    console.error("Error 🔥:" + err);
    res.status(500).json({ status: "error", message: "something went wrong" });
  }
};

const handleCastErrorDB = (err) => {
  const message = `invalide ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `duplicate field value: ${value}, please use other value`;
  return new AppError(message, 400);
};

const handleValidatinErrorsDB = (err) => {
  const arr = [];
  Object.values(err.errors).map((error) => {
    arr.push(error.message);
  });
  const message = `invalid input data: ${arr} `;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError("invalid token, please login again", 401);

const handleTokenExpiredError = (err) =>
  new AppError("your token expired, please login again", 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // send message to the developer
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  }
  // send message to the client
  else if (process.env.NODE_ENV === "production") {
    // handle Cast Errors
    if (err.name === "CastError") {
      err = handleCastErrorDB(err);
    }
    // hanlde duplicate fields Errors
    if (err.code === 11000) {
      err = handleDuplicateFieldsDB(err);
    }
    // hanlde validation Errors
    if (err.name === "ValidationError") {
      err = handleValidatinErrorsDB(err);
    }
    // handle invalid signiture error
    if (err.name === "JsonWebTokenError") {
      err = handleJWTError(err);
    }
    // handle token expired error
    if (err.name === "TokenExpiredError") {
      err = handleTokenExpiredError(err);
    }

    sendErrorProd(err, res);
  }
};
