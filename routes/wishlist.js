const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const wishlistController = require("../controllers/wishlist.js");

router.post("/", isLoggedIn, wrapAsync(wishlistController.toggleWishlist));

module.exports = router;