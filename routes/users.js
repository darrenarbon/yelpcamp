var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var middleware = require("../middleware");



// ================//
//   USER ROUTES   //
// ================//

//show user list
router.get("/", middleware.isAdmin, function(req, res){
    // Get all campgrounds from DB
    User.find({}, function(err, allUsers){
       if(err){
           console.log(err);
       } else {
          // list all the campgrounds
          res.render("users/index",{users:allUsers});
       }
    });
})

// ADD new user to the DB
router.post("/", middleware.isAdmin, function(req, res){
    //add user

    var userData = {
        username: req.body.user.username,
        firstname: req.body.user.firstname,
        surname: req.body.user.surname
    }

    if (!req.body.user.isAdmin || req.body.user.isAdmin == "") {
        userData.isAdmin = false;
    } else if(req.body.user.isAdmin == "true") {
        userData.isAdmin = true;
    }

    console.log(userData);
    console.log(req.body.user);

    User.register(new User(userData), req.body.user.password, function(err, user){
        if (err){
            req.flash("error", err.message);
            res.redirect("/users");
        }
        res.redirect("/users/" + user._id);
    });
})

// SHOW form to add new user
router.get("/new", middleware.isAdmin, function(req, res){
    res.render("users/new");
});

// SHOW - shows more info about one user
router.get("/:id", middleware.checkProfileOwner, function(req, res){
    //find the user with provided ID
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        } else {
            Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
                if (err) {
                    req.flash("error", "Something went wrong");
                    res.redirect("back");
                }
                //console.log(campgrounds)
                //render show template with that user
                res.render("users/show", {user: foundUser, campgrounds: campgrounds});
            });       
        };
    });
});

//show edit user form
router.get("/:id/edit", middleware.checkProfileOwner, function(req,res){
    User.findById(req.params.id, function(err, foundUser){
        res.render("users/edit", {user: foundUser});   
    });
});

//update the user
router.put("/:id", middleware.checkProfileOwner, function(req,res){
    console.log(req.body.user)
    if (!req.body.user.isAdmin || req.body.user.isAdmin == "") {
        req.body.user.isAdmin = false;
    }
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
        if(err) {
            res.redirect("/users");
        } else {
            req.flash("success", "User successfully edited");
            res.redirect("/users/" + req.params.id);
        }
    });
});

//delete user
router.delete("/:id", middleware.isAdmin, function(req, res){
    //destroy user
    User.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/users");
        } else {
            req.flash("success", "User removed")
            res.redirect("/users");
        }
    });
});

module.exports = router;