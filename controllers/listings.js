const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); // needs installation
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

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
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  // here isLoggedIn used because of securing create listing from any tool or Azax request

  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry;
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
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }); // deconstruct by (...) for individual parameters

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

module.exports.searchByCountry = async (req, res) => {
  let searchedCountry = req.query.country;
  const allListings = await Listing.find({ country: searchedCountry });
  if (!allListings.length) {
    req.flash("error", "Not any listing available for your country");
    return res.redirect("/listings");
  }
  res.render("listings/index.ejs", { allListings });
};
