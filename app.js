require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const nodeMailer = require("nodemailer");
// const session = require("express-session");
// const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine" , "ejs");
app.use(bodyParser.urlencoded({ extended : true}));

// app.use(session({
//   secret :"our little secret.",
//   resave : false,
//   saveUninitialized : false
// }));
//
// app.use(passport.initialize());
// app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/loginDB" , { useNewUrlParser : true , useUnifiedTopology: true });
mongoose.set("useCreateIndex" , true);

const loginSchema = new mongoose.Schema({
  name : String,
  email: String,
  password : String
});

const User = mongoose.model("User" , loginSchema);


app.get("/" , function(req , res){
  res.render("home");
});

app.get("/login" , function(req , res){
  res.render("login");
});

app.get("/register" , function(req , res){
  res.render("register");
});


let transporter = nodeMailer.createTransport({
  service: "gmail",
  auth:{
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

var name;
var email;
var password;

var otp = Math.floor(Math.random()*1000000);

// POST request to rtegister route///////////////////
app.post("/register" , function(req , res){

  name= req.body.name;
  email= req.body.email;
  password = req.body.password;


      let otpMail ={
        from: process.env.EMAIL ,
        to: email ,
        subject: "Email verification via One Time Password." ,
        text: "otp is "+otp
      };
      transporter.sendMail(otpMail , function(err){
        if(err){
          console.log(err,"error");
        }else{
        console.log("Otp email was sent");
        }
      });
      res.render("otp")


});


// POST request to OTP////////////////////////////////////////
app.post("/otp" , function(req , res){
  var otpEntered = req.body.otp ;
  if(otpEntered==otp){

    const newUser = new User({
      name: name,
      email: email,
      password: password
    });

    newUser.save(function(err){
      if(err){
        console.log(err);
      }else{

        let registeredMail ={
          from: process.env.EMAIL ,
          to: email ,
          subject: "Your Account is Verified and Registered" ,
          text: "Your login Credentials are :- "+" Email:- "+email +"   Password:- "+password
        };
        transporter.sendMail(registeredMail , function(err){
          if(err){
            console.log(err,"error");
          }else{
          console.log("User is successfully registered");
          }
        });
      }
    });
    res.render("submit");

  }else{
    res.render("register");
  }
});


// post route to submit logout button
app.post("/submit" , function(req , res){
  res.render("home");
});

// post request to login route
app.post("/login" , function(req , res){
  const username = req.body.email ;
  const password = req.body.password ;

  User.findOne({ email : username } , function(err , foundUser){
    if(err){
      console.log(err);
    }else{
      if (foundUser){
          if(foundUser.password === password){
            res.render("submit");
          }
        }
    }
  });

});


app.listen(3000 , function(){
  console.log("server is running on port 3000");
});
