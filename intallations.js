// npm i express
// npm init -y
// npm i mongoose
// npm i method-override
// npm i uuid
// npm i joi
// npm i router
// npm i cookie-parser
// npm i express-session
// npm i connect-flash
// for sign up process of local strategy (npm i passport) (npm i passport-local) (npm i passport-local-mongoose) , for multiple strategies











// listing schema
// image: {
//         type: String,
//         default: "https://images.unsplash.com/photo-1764076327046-fe35f955cba1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//         set: (v) =>
//             v === "" 
//             ? "https://images.unsplash.com/photo-1713892020514-47632490e49a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdGVscyUyMGFuZCUyMHJlc29ydHN8ZW58MHx8MHx8fDA%3D" 
//             : v,
//     },

// creating new listing
// module.exports.createListing = async (req, res, next) => {              // here isLoggedIn used because of securing create listing from any tool or Azax request
    // const newListing = new Listing(req.body.listing);
    // newListing.owner = req.user._id;
    // await newListing.save();
//     req.flash("success", "New Listing Created");
//     res.redirect("/listings");
// };   