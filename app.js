// app.js Boilerplate with mongoose
require('dotenv').config(); // Always on the TOP
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose")
const md5 = require("md5");

// Replace the uri string with your MongoDB deployment's connection string.
const uri = "mongodb://127.0.0.1:27017"
mongoose.connect(uri + "/userDB")

const app = express();

const userSchema = new mongoose.Schema({
	email: String,
	password: String
});




const User = mongoose.model("User", userSchema);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

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

// POST METHOD
app.post("/register", function (req, res) {
	const newUser = new User({
		email: req.body.email,
		password: md5(req.body.password)
	});
	newUser.save()
		.then(() => { res.render("secrets"); })
		.catch(err => { console.log(err); });
});

app.post("/login", function (req, res) {
	User.findOne({ email: req.body.email })
		.then(user => {
			if (user) {

				if (user.password === md5(req.body.password)) {
					res.render("secrets");
				} else {
					console.log("Incorrect password");
					res.render("login");
				}
			} else {
				console.log("User not found");
				res.render("login");
			}
		})
		.catch(err => { console.log(err); });
});

// LISTENING ON PORT (3000)
app.listen(process.env.PORT || 3000, function () {
	console.log("Server started on port 3000");
});