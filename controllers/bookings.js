const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

const MS_PER_NIGHT = 1000 * 60 * 60 * 24;

module.exports.createBooking = async (req, res) => {
  let { id } = req.params; // listing id
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }

  let checkIn = new Date(req.body.booking.checkIn);
  let checkOut = new Date(req.body.booking.checkOut);
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    req.flash("error", "Check-in date can't be in the past");
    return res.redirect(`/listings/${id}`);
  }

  // Overlap check: two ranges [checkIn, checkOut) clash if
  // existing.checkIn < new.checkOut AND existing.checkOut > new.checkIn
  let clashingBooking = await Booking.findOne({
    listing: id,
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });

  if (clashingBooking) {
    req.flash(
      "error",
      "Those dates aren't available - someone already booked an overlapping range",
    );
    return res.redirect(`/listings/${id}`);
  }

  let nights = Math.round((checkOut - checkIn) / MS_PER_NIGHT);
  let newBooking = new Booking({
    listing: listing._id,
    guest: req.user._id,
    checkIn,
    checkOut,
    nights,
    totalPrice: nights * listing.price,
  });

  await newBooking.save();
  req.flash("success", `Booked! ${nights} night(s) at ${listing.title}`);
  res.redirect("/bookings");
};

module.exports.myBookings = async (req, res) => {
  let bookings = await Booking.find({ guest: req.user._id })
    .populate("listing")
    .sort({ checkIn: 1 });
  res.render("bookings/index.ejs", { bookings });
};

module.exports.cancelBooking = async (req, res) => {
  let { bookingId } = req.params;
  await Booking.findByIdAndDelete(bookingId);
  req.flash("success", "Booking cancelled");
  res.redirect("/bookings");
};
