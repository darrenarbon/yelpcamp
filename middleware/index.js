
var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCommentOwner = function(req, res, next) {
	if(req.isAuthenticated()) {
        Comment.findById(req.params.c_id, function(err, comment){
            if (err || !comment){
                req.flash("error", "Campground not found in the database");
                res.redirect("back");
            } else {
                //does the user own the campground?
                if (comment.author.id.equals(req.user._id)){
                    next();   
                } else {
                    //no permissions to do that
                    req.flash("error", "You do not have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        //not logged in
        req.flash("error", "You need to be logged in to do that")
        res.redirect("back");
    }
}

middlewareObj.checkCampgroundOwner = function(req, res, next) {
	if(req.isAuthenticated()) {
        Campground.findById(req.params.id, function(err, campground){
            if (err || !campground){
                req.flash("error", "Campground not found in the database");
                res.redirect("back");
            } else {
                //does the user own the campground?
                if (campground.author.id.equals(req.user._id)){
                    next();   
                } else {
                    //no permissions to do that
                    req.flash("error", "You do not have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        //not logged in
        req.flash("error", "You need to be logged in to do that")
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next) {
	if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj