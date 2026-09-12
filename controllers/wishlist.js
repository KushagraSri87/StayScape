const User = require("../models/user.js");

module.exports.toggleWishlist = async (req, res) => {
  let { id } = req.params;
  let user = await User.findById(req.user._id);

  let alreadySaved = user.wishlist.some((listingId) => listingId.equals(id));

  if (alreadySaved) {
    user.wishlist = user.wishlist.filter((listingId) => !listingId.equals(id));
    req.flash("success", "Removed from your wishlist");
  } else {
    user.wishlist.push(id);
    req.flash("success", "Saved to your wishlist");
  }

  await user.save();
  res.redirect(`/listings/${id}`);
};

module.exports.showWishlist = async (req, res) => {
  let user = await User.findById(req.user._id).populate("wishlist");
  res.render("wishlist/index.ejs", { wishlist: user.wishlist });
};