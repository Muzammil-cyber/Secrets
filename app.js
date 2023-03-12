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

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



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

app.get("/secrets", passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }), (req, res) => {
	if (req.isAuthenticated) { res.render("secrets"); }
	else { res.redirect("/login"); }
})

app.get("/logout", function (req, res) {
	req.logout(function () { res.redirect("/") });
	;
});

// POST METHOD
app.post("/register", function (req, res) {

	User.register({ username: req.body.email }, req.body.password, function (err, user) {
		if (err) {
			console.log(err);
			res.redirect("/register");
		} else {
			req.login(user, (er) => {
				if (er) {
					res.json({ success: false, message: er });
				}
				else {
					res.redirect("/secrets");
				}
			});
		}
	})
	// .then(() => { res.redirect("/secrets") })
	// .catch(err => { console.log(err) })


	// function (err) {
	// 	if (err) {
	// 		console.log(err);
	// 		res.redirect("/register");
	// 	} else {
	// 		res.redirect("/secrets");
	// 	}
	// });


	// passport.authenticate("local")(req, res, function () {
	// 	res.redirect("/secrets");
	// });

});


// User.register({ username: req.body.email }, req.body.password, function (err, user) {
// 	if (err) {
// 		console.log("Error in registering.", err);
// 		res.redirect("/register");
// 	} else {
// 		console.log("your here:" + user);
// 		User.authenticate(req.body.email, req.body.password, function (err, result) {
// 			if (err) {
// 				console.log("Error in authenticating.", err);
// 				res.redirect("/login");
// 			} else {
// 				console.log("your here");
// 				console.log(result, 101);
// 				res.redirect("/secrets")
// 			}
// 			;
// 		});
// 	}
// });



app.post("/login", function (req, res) {
	const user = new User({
		username: req.body.username,
		password: req.body.password
	});

	passport.authenticate("local", function (err, user, info) {
		if (err) {
			res.json({ success: false, message: err });
		}
		else {
			if (!user) {
				res.json({ success: false, message: "username or password incorrect" });
			}
			else {
				const token = jwt.sign({ userId: user._id, username: user.username }, secretkey, { expiresIn: "24h" });
				res.json({ success: true, message: "Authentication successful", token: token });
			}
		}
	})(req, res)
});


// LISTENING ON PORT (3000)
app.listen(process.env.PORT || 3000, function () {
	console.log("Server started on port 3000");
});