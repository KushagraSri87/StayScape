const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

router.post(
  "/checkout",
  isLoggedIn,
  wrapAsync(bookingController.createCheckoutOrder),
);

router.post(
  "/verify",
  isLoggedIn,
  wrapAsync(bookingController.verifyAndCreateBooking),
);

module.exports = router;