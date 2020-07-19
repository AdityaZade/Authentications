//jshint esversion:6
require('dotenv').config()

const express =require("express");
const bodyParser=require("body-parser")
const mongoose=require("mongoose")
const ejs=require("ejs")

//level-4
const bcrypt=require("bcrypt");
const saltRounds=10

//level-5
const session=require("express-session")
const passport=require("passport")
const passportLocalMongoose=require("passport-local-mongoose")

// level-3
// const md5=require("md5")

// level-1
// var encrypt = require('mongoose-encryption');

const app =express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

//level-5
app.use(session({
  secret:"Our little Secret",
  resave:false,
  saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());
//level-5 !


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,  useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);

const userSchema=new mongoose.Schema({
  email:String,
  password:String
});

// level-1
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });


//level 5
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User",userSchema);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/",function(req,res){
  res.render("home");
})

app.get("/register",function(req,res){
  res.render("register");
});
//level-5
//   app.post("/register",function(req,res){
//
//   bcrypt.hash(req.body.password,saltRounds, function(err, hash) {
//     const newUser = new User({
//       email:req.body.username,
//       password:hash
//     });
//
//     newUser.save(function(err){
//       if(err){
//         res.send(err);
//       }else{
//         res.render("secrets");
//       }
//     });
// });
// });
app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("login");
  }
});
app.post("/register",function(req,res){
  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err)
      res.redirect("/register")
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets")
      });
    }
  });
});
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/")
})
app.get("/login",function(req,res){
  res.render("login");
});
// app.post("/login",function(req,res){
//   const username=req.body.username;
//   const password=req.body.password
//
//   User.findOne({email:username}, function(err, foundUser){
//     if(err){
//       res.send(err);
//     }else{
//       if(foundUser){
//         bcrypt.compare(password, foundUser.password, function(err, result) {
//
//        if(result === true){
//          res.render("secrets")
//        }
// });
//       }
//     }
//   });
// });

app.post("/login",function(req,res){
const user= new User({
  username:req.body.username,
  password:req.body.password
});

req.login(user,function(err){
  if(err){
    console.log(err)
  }else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    });
  }
})
});
app.listen(3000,function(){
  console.log("Server is started at port 3000");
});
