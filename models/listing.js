const mongoose = require("mongoose");
const Schema = mongoose.Schema; // const { Schema } = mongoose;
const Review = require("./review.js");
const Booking = require("./booking.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
    // Bookings reference a listing by ObjectId, not the other way around -
    // without this, deleting a listing orphaned its bookings and crashed
    // the "My Trips" page trying to read the now-missing listing's details.
    await Booking.deleteMany({ listing: listing._id });
  }
});
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
