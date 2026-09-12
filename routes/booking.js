const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateBooking } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

router.post(
  "/",
  isLoggedIn,
  validateBooking,
  wrapAsync(bookingController.createBooking),
);

module.exports = router;
