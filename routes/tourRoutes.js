const express = require("express");

const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

router.use("/:tourId/reviews", reviewRouter);

router
  .route("/top-5-cheap")
  .get(tourController.topFiveTours, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);
router.route("/monthlty-plan/:year").get(tourController.getMonthlyPlan);

router
  .route("/")
  .get(authController.protectRouter, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protectRouter,
    authController.restrectTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
