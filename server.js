const fs = require("fs");

const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = express();

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const AppError = require("./utils/app-error");
const errorHandler = require("./controllers/errorController");

app.use(morgan("dev"));
app.use(express.json());

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
