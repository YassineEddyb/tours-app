const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Tour = require("../models/tourModel");
const { deleteMany } = require("../models/tourModel");

dotenv.config({ path: "../config.env" });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours-simple.json`, "utf-8")
);

const DB = process.env.CONNECT_TO_DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then((result) => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("data successfully loaded");
  } catch (err) {
    console.log(err);
  }
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("data successfully deleted");
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}

console.log(process.argv);
