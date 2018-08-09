var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var NodeGeocoder = require("node-geocoder");

var options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);

// ================//
// Campsite Routes //
// ================//


//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          // list all the campgrounds
          res.render("campgrounds/index",{campgrounds:allCampgrounds});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
   
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var numberofplots = req.body.numofplots;
    var toilets = (req.body.user.isAdmin  == "true") ? true : false;

    geocoder.geocode(req.body.location, function(err, data) {
        if (err || !data.length) {
            req.flash("error", "Invalid address");
            return res.redirect("back");
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;

        var newCampground = {name: name, price: price, image: image, description: desc, author: author, location: location, lat: lat, lng: lng, numofplots: numofplots, toilets: toilets}
        // Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                req.flash("error", "Could not add campground");
                res.redirect("back");
            } else {
                //redirect back to campgrounds page
                req.flash("success", "Campground added")
                res.redirect("/campgrounds");
            }
        });
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

//SEARCH - find campgrounds that match the name
router.post("/quickSearch", function(req, res){
    var qSearch = req.body.query;
    var query = {
        "$or": [{"name": {"$regex": qSearch, "$options": "i"}}, {"description": {"$regex": qSearch, "$options": "i"}}]
    };

    var output = [];
    Campground.find(query, function(err, sites){
        if(sites && sites.length && sites.length > 0) {
          sites.forEach(site => {
            var obj = {
                id: site._id,
                label: site.name
            };
            output.push(obj);
          });
      }
      res.json(output);
    });
});

//SEARCH - find campgrounds that match the name
router.post("/advSearch", function(req, res){
    var qSearch = req.body;
    
    var query = {}
    var priceQuery = {}
    for (var term in qSearch) {
        if (qSearch.hasOwnProperty(term) && qSearch[term] != "") {
            if (term == "costFrom" || term == "costTo") {
                // minimum price
                if (term == "costFrom") priceQuery["$gt"] = qSearch[term];
                //maximum price
                if (term == "costTo") priceQuery["$lt"] = qSearch[term];
            } else{
                query[term] = qSearch[term];  
            }
        }
    }
    if (Object.keys(priceQuery).length !== 0 && priceQuery.constructor === Object) {
        query["price"] = priceQuery;
    }
    
    var output = [];
    Campground.find(query, function(err, sites){
        if(err){
           console.log(err);
        } else {
          // list all the campgrounds
          res.render("campgrounds/index",{campgrounds:sites});
        }
    });
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //console.log("From Show: " + foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//show edit campground form
router.get("/:id/edit", middleware.checkCampgroundOwner, function(req,res){
    Campground.findById(req.params.id, function(err, campground){
        res.render("campgrounds/edit", {campground: campground});   
    });
});

//update the campground
router.put("/:id", middleware.checkCampgroundOwner, function(req,res){
    //remove any potential bad scripts
    //req.body.blog.body = req.sanitize(req.body.blog.body);
    //update the database
    geocoder.geocode(req.body.location, function(err, data) {
        if (err || !data.length) {
           req.flash("error", "Invalid address");
           return res.redirect("back");
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        req.body.campground.toilets = (req.body.campground.toilets == "true") ? true: false;
        req.body.campground.tapwater = (req.body.campground.tapwater == "true") ? true: false;
        req.body.campground.hotwater = (req.body.campground.hotwater == "true") ? true: false;
        req.body.campground.showers = (req.body.campground.showers == "true") ? true: false;
        req.body.campground.electrichookup = (req.body.campground.electrichookup == "true") ? true: false;
        req.body.campground.campshop = (req.body.campground.campshop == "true") ? true: false;

        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedGround){
            if(err) {
                res.redirect("/campground");
            } else {
                console.log(req.body.campground)
                req.flash("success", "Campground successfully edited");
                res.redirect("/campgrounds/" + req.params.id);
            }
        });
    });
});

//delete campground
router.delete("/:id", middleware.checkCampgroundOwner, function(req, res){
    //destroy campground
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground removed")
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;