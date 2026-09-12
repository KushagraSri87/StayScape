const Review = require("../models/review");
const Listing = require("../models/listing");

module.exports.createReview = async(req, res) => {
    let listing = await Listing.findById(req.params.id);   // listing is also used here so it necessary to require it.
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;               // logged in user becomes the author of new review
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save(); 
    req.flash("success", "New Review Created");

    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async(req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });               // deleting review from id     
    await Review.findByIdAndDelete(reviewId);                                            // deleting review
    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${ id }`);
};