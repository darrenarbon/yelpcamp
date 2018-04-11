var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

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
    var newCampground = {name: name, price: price, image: image, description: desc, author: author}
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

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
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

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedGround){
        if(err) {
            res.redirect("/campground");
        } else {
            req.flash("success", "Campground successfully edited");
            res.redirect("/campgrounds/" + req.params.id);
        }
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