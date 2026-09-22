const Listing = require("../models/listing");
const Booking = require("../models/booking");

// OpenCage geocoding - free tier, no credit card required (unlike Mapbox's
// billing setup). Node 20+ has fetch() built in, no extra package needed.
const OPENCAGE_KEY = process.env.OPENCAGE_API_KEY;

async function geocodeLocation(query) {
  let url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    query,
  )}&key=${OPENCAGE_KEY}&limit=1`;
  let response = await fetch(url);
  let data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`Could not find coordinates for "${query}"`);
  }
  let { lat, lng } = data.results[0].geometry;
  // keep the same GeoJSON [lng, lat] shape the schema already expects
  return { type: "Point", coordinates: [lng, lat] };
}

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  console.log(req.user); // when user logged in users info saved in req and req.user used to authenticate user
  res.render("listings/new.ejs"); //If index route use below show route it gives error because it try to find id(previous operation) not new form
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews", // to show all review of each listing
      populate: {
        path: "author", // to show author of each review
      },
    })
    .populate("owner"); // populate chainning user for add owner in listings.
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist ");
    return res.redirect("/listings");
  }

  // Upcoming bookings for this listing - shown to everyone as "unavailable"
  // date ranges, and shown in full (with guest name) only to the owner.
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  let bookings = await Booking.find({
    listing: listing._id,
    checkOut: { $gte: today },
  })
    .populate("guest")
    .sort({ checkIn: 1 });

    let isWishlisted = false;
  if (req.user) {
    isWishlisted = req.user.wishlist.some((listingId) =>
      listingId.equals(listing._id),
    );
  }

  res.render("listings/show.ejs", { listing, bookings, isWishlisted });
};

module.exports.createListing = async (req, res, next) => {
  // here isLoggedIn used because of securing create listing from any tool or Azax request

  let geometry = await geocodeLocation(req.body.listing.location);
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = geometry;
  await newListing.save();
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist ");
    return res.redirect("/listings");
  }

  let originalImgUrl = listing.image.url;
  originalImgUrl = originalImgUrl.replace("/upload", "/upload/h_300,w_250"); // to reduce image quality
  res.render("listings/edit.ejs", { listing, originalImgUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  // { new: true } is required here - without it, findByIdAndUpdate returns the
  // PRE-update document, and the .save() below would overwrite the DB with those
  // stale field values (only the image change would actually stick).
  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true },
  ); // deconstruct by (...) for individual parameters

  if (typeof req.file !== "undefined") {
    // use to prevent edit listing without giving img
    let url = req.file.path; // path stores the url value
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};

// Escapes regex special characters so a search term like "C++" or "(test)"
// can't break the query or be used for a regex-injection attack.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports.searchByCountry = async (req, res) => {
  let searchTerm = req.query.country;
  let safeTerm = escapeRegex(searchTerm);
  // Matches against location (city/state, e.g. "Goa") OR country (e.g.
  // "India"), case-insensitive, partial match - not just an exact country match.
  const allListings = await Listing.find({
    $or: [
      { location: { $regex: safeTerm, $options: "i" } },
      { country: { $regex: safeTerm, $options: "i" } },
    ],
  });
  if (!allListings.length) {
    req.flash("error", `No listings found for "${searchTerm}"`);
    return res.redirect("/listings");
  }
  res.render("listings/index.ejs", { allListings });
};
