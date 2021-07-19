const fs = require("fs");

const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = express();

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const AppError = require("./utils/app-error");
const errorHandler = require("./controllers/errorController");

// Global middlewares
// set security http headers
app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "too many requests from this IP please try again after an hour",
});
// limit request from same IP
app.use("/api", limiter);

// development logger
app.use(morgan("dev"));
// Body parser
app.use(express.json({ limit: "10kb" }));

// data sanitization against noSql query injection
app.use(mongoSanitize());

// data sanitization against xss attaks
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: ["duration"],
  })
);

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// page not found middleware
app.all("*", (req, res, next) => {
  next(new AppError("page not found", 404));
});

// handdle opirational errors
app.use(errorHandler);

const port = 3000 || process.env.PORT;

const DB = process.env.CONNECT_TO_DATABASE;

let server;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then((result) => {
    server = app.listen(port);
    console.log("connected to mongodb");
  });

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
