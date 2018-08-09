var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   name: String,
   price: Number,
   image: String,
   description: String,
   location: String,
   lat: Number, 
   lng: Number,
   numofplots: Number,
   toilets: Boolean,
   tapwater: Boolean,
   hotwater: Boolean,
   showers: Boolean,
   electrichookup: Boolean,
   campshop: Boolean,
   createdAt: {
      type: Date, 
      default: Date.now
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   author: {
    	id: {
    		type: mongoose.Schema.Types.ObjectId,
        	ref: "User"
        },
        username: String
    }
}, { usePushEach: true });

module.exports = mongoose.model("Campground", campgroundSchema);