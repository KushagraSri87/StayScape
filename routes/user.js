const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js"); 
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js")


router.route("/signup")
    .get( userController.renderSignupForm )
    .post( wrapAsync (userController.signup ))          // Signup Post Route


router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl,
    passport.authenticate("local", {    // authenticate(), function is used as route middleware to authenticate reqests. "local" is compulsory it is local strategy
        failureRedirect: "/login", 
        failureFlash: true 
    }), 
    userController.login
);

router.get("/logout", userController.logout);

module.exports = router;