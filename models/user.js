const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:{type:String,required:true},
    password:{type:String,required:true},
    email:{type:String,required:true},
    phonenumber:{type:String,required:true},
    role:{type:String,enum:["buyer","seller"],default:"buyer"}
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);