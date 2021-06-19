const express = require("express");

const tourController = require("../controllers/tourController");

const router = express.Router();

router
  .route("/")
  .get(tourController.getAllUsers)
  .post(tourController.createUser);

router
  .route("/:id")
  .get(tourController.getUser)
  .patch(tourController.updateUser)
  .delete(tourController.deleteUser);

module.exports = router;
