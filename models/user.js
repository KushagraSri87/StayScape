const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    
    // username and hashed password both with salt value passport local mongoose defines automatically in schema
});


userSchema.plugin(passportLocalMongoose);  // adds username, hash and salt field to store username and password

module.exports = mongoose.model("User", userSchema);