const Joi = require('joi');

module.exports.listingSchema = Joi.object({
  listing : Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    price: Joi.number().required().min(0),
    country: Joi.string().required(),
    image: Joi.string().allow("", null)
  }).required()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5),
  }).required(),
});

// const listingSchema = Joi.object({
//   listing : Joi.object({
//     title: Joi.string().required(),
//     description: Joi.string().required(),
//     location: Joi.string().required(),
//     price: Joi.number().required().min(0),
//     country: Joi.string().required(),
//     image: Joi.string().allow("", null)
//   }).required()
// }); 


// // Create Route basic method of validation condition for direct host call  (app.js) 

// app.post("/listings",wrapAsync (async (req, res, next) => {
//     // let {title, description, image, price, country, location } = req.body;
//     // let listing = req.body.listing;
//     if(!req.body.listing){
//         next( new ExpressError(400, "Send valid data for listing"));
//     }
//     const newListing = new Listing(req.body.listing);
//     if(!newListing.description){
//         throw new ExpressError(400, "Description is missing!");
//     }
//     if(!newListing.title){
//         throw new ExpressError(400, "title is missing!");
//     }
//     if(!newListing.location){
//         throw new ExpressError(400, "location is missing!");
//     }
//     await newListing.save();
//     res.redirect("/listings");
// }));