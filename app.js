var express                 = require("express"),
    app                     = express(),
    bodyParser              = require("body-parser"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    LocalStrategy           = require("passport-local"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    methodOverride          = require("method-override"),
    User                    = require("./models/user"),
    Campground              = require("./models/campground"),
    Comment                 = require("./models/comment"),
    seedDB                  = require("./seeds"),
    commentRoutes           = require("./routes/comments"),
    campgroundRoutes        = require("./routes/campgrounds"),
    authRoutes              = require("./routes/auth"),
    flash                   = require("connect-flash");
    //moment                  = require("moment");
    
mongoose.connect("mongodb://localhost:27017/yelp_camp_v4", function(err, db){
	if(err) {
		console.log("Database Failed");
	} else {
		console.log("Database Connected");
	}
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(flash());

//put method override
app.use(methodOverride("_method"));

// ================//
// Passport Config //
// ================//
//setup session for passport
app.use(require("express-session")({
    secret: "Hello out there how are you",
    resave: false,
    saveUninitialized: false
}));

//send moment to all view files.
app.locals.moment = require("moment");

//set up passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//send currentUser to every single route.
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next()
})

//tell express to use route files
app.use("/campgrounds/:id/comments", commentRoutes);
app.use(authRoutes);
app.use("/campgrounds", campgroundRoutes);

// ================//
//    Seed Data    //
// ================//
//seedDB();

//==============//
// start server //
//==============//

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!");
});