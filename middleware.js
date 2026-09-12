const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");  
const { listingSchema, reviewSchema } = require("./schema.js");
const review = require("./models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req.path, " ..", req.originalUrl);     <------------------- req originalUrl
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;  // used to redirect on exact page after login 
        req.flash("error", "you must be logged in to perform this operation");
        return res.redirect("/login");
    }
    next();  // it works when user is authenticated
};

// when you not logged in req.user stores undefined, if logged in it stores users info.


module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){                          // it is use because passport reset req.session after login 
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

// locals are variables that are accessiable every where sessions may be changed after perfoming some task.

// For authorization
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);                   // requiring listing is mandatory is to access listings
    if(!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of the listing");
        return res.redirect(`/listings/${ id }`);
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);              // used in Create Route as a Middleware
    if(error){
        let errMsg = error.details.map((el) => el.message).join (",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);              // used in Create Route as a Middleware
    if(error){
        let errMsg = error.details.map((el) => el.message).join (",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};


module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;                            // id is for listing not for review, every review had their own id that is  reviewId
    let review = await Review.findById(reviewId);                // requiring review is mandatory is to access review data
    console.log("----------------------------")
    console.log(review.author);
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${ id }`);
    }
    next();
};