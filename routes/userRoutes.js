const express = require("express");

const userController = require("../controllers/userController");

const router = express.Router();

router
  .route("/")
  .get(userController.getAllTours)
  .post(userController.createTour);

router
  .route("/:id")
  .get(userController.getTour)
  .patch(userController.updateTour)
  .delete(userController.deleteTour);

module.exports = router;
