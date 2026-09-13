const crypto = require("crypto");
const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const razorpay = require("../razorpayConfig.js");

const MS_PER_NIGHT = 1000 * 60 * 60 * 24;

async function assertDatesAvailable(listingId, checkIn, checkOut) {
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    throw new Error("Check-in date can't be in the past");
  }
  if (checkOut <= checkIn) {
    throw new Error("Check-out must be after check-in");
  }

  let clashingBooking = await Booking.findOne({
    listing: listingId,
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });

  if (clashingBooking) {
    throw new Error(
      "Those dates aren't available - someone already booked an overlapping range",
    );
  }
}

module.exports.createCheckoutOrder = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  let checkIn = new Date(req.body.checkIn);
  let checkOut = new Date(req.body.checkOut);

  try {
    await assertDatesAvailable(id, checkIn, checkOut);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  let nights = Math.round((checkOut - checkIn) / MS_PER_NIGHT);
  let totalPrice = nights * listing.price;

  let order = await razorpay.orders.create({
    amount: totalPrice * 100,
    currency: "INR",
    receipt: `listing_${id}_${Date.now()}`,
  });

  res.json({
    orderId: order.id,
    amount: order.amount,
    keyId: process.env.RAZORPAY_KEY_ID,
    listingTitle: listing.title,
    nights,
    totalPrice,
  });
};

module.exports.verifyAndCreateBooking = async (req, res) => {
  let { id } = req.params;
  let {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    checkIn,
    checkOut,
  } = req.body;

  let expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: "Payment verification failed" });
  }

  let listing = await Listing.findById(id);
  checkIn = new Date(checkIn);
  checkOut = new Date(checkOut);

  try {
    await assertDatesAvailable(id, checkIn, checkOut);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  let nights = Math.round((checkOut - checkIn) / MS_PER_NIGHT);

  let newBooking = new Booking({
    listing: listing._id,
    guest: req.user._id,
    checkIn,
    checkOut,
    nights,
    totalPrice: nights * listing.price,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
  });

  await newBooking.save();
  req.flash("success", `Payment successful! Booked ${nights} night(s) at ${listing.title}`);
  res.json({ redirect: "/bookings" });
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

