const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connected to DB");   
    }).catch((err) => {
        console.log(err);
    })

async function main(){
    await mongoose.connect(MONGO_URL);
};

const initDB = async () => {                   
    await Listing.deleteMany({});              // deleting all previous data from collection
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "696f220ebc8d852b9b754214" }));   // map creates new array and insert data(owner inserted in arr) and init.Data.data returns that arr

    await Listing.insertMany(initData.data);   
    console.log("data was initialized");       
};

initDB();