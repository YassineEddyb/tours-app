const express = require("express");

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.patch(
  "/update-password",
  authController.protectRouter,
  authController.updatePassword
);

router.patch(
  "/updateMe",
  authController.protectRouter,
  userController.updateMe
);

router.delete(
  "/deleteMe",
  authController.protectRouter,
  userController.deleteMe
);

router.post("/forget-password", authController.forgetPassword);
router.patch("/reset-password/:token", authController.resetPassword);

router.route("/").get(userController.getAllUsers);
//   .post(userController.createUser);

// router
//   .route("/:id")
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
