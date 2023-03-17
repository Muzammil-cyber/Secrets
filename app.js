// app.js Boilerplate with mongoose
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(session({
	secret: "Our little secret.",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Replace the uri string with your MongoDB deployment's connection string.
const uri = "mongodb://127.0.0.1:27017"
mongoose.connect(uri + "/userDB")
// mongoose.set("useCreateIndex", true);


const userSchema = new mongoose.Schema({
	email: String,
	password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use({
	usernameField: 'email',
}, User.authenticate());

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id).then(function (user) {
		done(null, user)
	});
});




// GET METHOD
app.get("/", function (req, res) {
	res.render("home");
});

app.get("/register", function (req, res) {
	res.render("register");
});

app.get("/login", function (req, res) {
	res.render("login");
});

app.get("/secrets", (req, res) => {
	if (req.isAuthenticated) { res.render("secrets"); }
	else { res.redirect("/login"); }
})

app.get("/logout", function (req, res) {
	req.logout(function (err) {
		if (err) { console.log(err) }
		res.redirect('/');
	});

});

// POST METHOD
app.post("/register", function (req, res) {

	User.register({ username: req.body.username }, req.body.password, function (err, user) {
		if (err) {
			console.log(err);
			res.redirect("/register");
		} else {
			passport.authenticate("local")(req, res, function () {
				res.redirect("/secrets");
			});
		}
	});


});

app.post("/login", function (req, res) {
	const user = new User({
		username: req.body.username,
		password: req.body.password
	});

	req.login(user, function (err) {
		if (err) {
			console.log(err);
		} else {
			passport.authenticate("local")(req, res, function () {
				res.redirect("/secrets");
			});
		}
	});
});


// LISTENING ON PORT (3000)
app.listen(process.env.PORT || 3000, function () {
	console.log("Server started on port 3000");
});