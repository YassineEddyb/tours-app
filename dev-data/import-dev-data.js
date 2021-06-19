const fs = require("fs");

const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

const app = express();

const tourRouter = require("./routes/tourRoutes");
// const userRouter = require("./routes/userRoutes");

app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1/tours", tourRouter);
// app.use("/api/v1/users", userRouter);

app.use((req, res) => {
  res.status(404).send("page not found");
});

const port = 3000 || process.env.PORT;

const DB = process.env.CONNECT_TO_DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then((result) => {
    app.listen(port);
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });
