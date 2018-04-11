var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");


//root route
router.get("/", function(req, res){
    res.render("landing");
});

// ================//
//   AUTH ROUTES   //
// ================//

//show reg form
router.get("/register", function(req, res){
    res.render("register")
})

//reg the user
router.post("/register", function(req, res){
    //add user
    var userData = {
        username: req.body.username,
        firstname: req.body.firstname,
        surname: req.body.surname
    }

    User.register(new User(userData), req.body.password, function(err, user){
        if (err){
            req.flash("error", err.message);
            res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + userData.firstname + " " + userData.surname);
            res.redirect("/campgrounds");
        });
    });
})

//show login form
router.get("/login", function(req, res){
    res.render("login");
});

//log the user in
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
    }), function(req, res){

});

//log the user out
router.get("/logout", function(req, res){
    req.logout();
    req.flash("error", "You are logged out")
    res.redirect("/campgrounds");
});

module.exports = router;