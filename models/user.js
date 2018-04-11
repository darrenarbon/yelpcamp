var mongoose 				= require("mongoose");
var passportLocalMongoose 	= require("passport-local-mongoose");

var UserSchema = mongoose.Schema({
	username: String,
	password: String,
	firstname: String, 
	surname: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);