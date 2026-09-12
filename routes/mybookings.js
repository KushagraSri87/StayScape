const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isBookingOwner } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

router.get("/", isLoggedIn, wrapAsync(bookingController.myBookings));

router.delete(
  "/:bookingId",
  isLoggedIn,
  isBookingOwner,
  wrapAsync(bookingController.cancelBooking),
);

module.exports = router;
