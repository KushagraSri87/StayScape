if (process.env.NODE_ENV != "production") {
  // here ENV for environment || to access secret use process.env.secret (env - environment variables)
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override"); // npm i method-override
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js"); // for passport-local-mongoose

// npm i joi (defines schema for server side validation)

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

// connect-mongo v6 exports { MongoStore, ... }. Access via MongoStore.create()
const MongoStoreClass =
  MongoStore.MongoStore || MongoStore.default || MongoStore;
const store = MongoStoreClass.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in mongo session store");
});

const sessionOptions = {
  store, // used for mongo atlas store
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // present date + days + hours(in a day) + mins + seconds + mili seconds(in 1 sec)
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// app.get("/", (req, res) => {
//     res.send("Root is working");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); // A web application needs to know the ability to identify users as they browse from page to page
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate())); // In passport all users need to authenticate in LocalStrategy form by using (User.authenticate)

// use static serialize and deserialize(of user) of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; // req.user is not accessible in the navbar.ejs to show only signup and login or logout according to condtion
  next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User ({
//         email: "student@gmail.com",
//         username: "student-abc",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");      // here (register is static method and automatically checks username is unique or not) and "helloworld" is password
//     res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page NOT Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});

// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My favourite villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("Successful testing");
// });
