const express = require("express");
const path = require("path");
const { connectdb, userModel } = require("./models/user");
const { postModel } = require("./models/post");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { nextTick } = require("process");
const dayjs = require('dayjs');
const crypto = require('crypto');
const upload = require('./config/multerconfig')
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);


const app = express();
app.use(cookieParser());

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.render("index");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/profile", IslogedIn,async function (req, res) {
  let user = await userModel.findOne({email : req.user.email})
  res.render("profilepic",{user});
});
app.post("/upload",IslogedIn,upload.single('avatar') ,async function (req,res) {
  let user = await userModel.findOne({email : req.user.email});

  user.profilepic = req.file.filename;
  await user.save();

  res.redirect('/home')

});
app.get('/home', IslogedIn, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
   let posts = await postModel.find()
    .populate('user', 'username profilepic')
    .sort({ date: -1 });

   const formattedPosts = posts.map(post => {
    const minutes = dayjs().diff(post.date, 'minute');
    const formattedTime = minutes < 1 ? 'just now' : dayjs(post.date).fromNow();

    return {
      ...post.toObject(),  // convert mongoose doc to plain JS object
      formattedTime
    };
  });
  res.render("home", { user, posts: formattedPosts });
});
app.get('/friends',IslogedIn,async function (req,res) {
  let user = await userModel.find().populate('posts');

  res.render("friends",{user});
});
app.post('/upload/photo',IslogedIn,upload.array('avatar'),async function (req,res) {
  let user = await userModel.findOne({email : req.user.email});
  let {content} = req.body;
  let post = await postModel.create({
    user : user._id,
    content,
     photos: req.files.map(file => file.filename)
  });
   user.posts.push(post._id);
  await user.save();

  res.redirect('/home');

});
app.post('/upload/photo', IslogedIn, upload.array('avatar'), async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });

  req.files.forEach(file => {
    user.photos.push(file.filename);
  });

  await user.save();

  res.redirect('/profile');
});

app.get('/profile/photo',IslogedIn,async function (req,res) {
  let user = await userModel.findOne({email : req.user.email});
  res.render('picpost',{user});
});

app.post("/register", async function (req, res) {
  try {

    let { username, email, password, age } = req.body;
    let users = await userModel.findOne({email});
    if (users) {
      return res.status(400).send("email already in use");
    }
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        try {
          let user = await userModel.create({
          username,
          age,
          email,
          password : hash
        });
        let token = jwt.sign({email : email , userid : user._id},"shhshh");
        res.cookie("token",token);
        res.redirect('/home');
        } catch (error) {
          res.status(500).send(error);
        }
        
      });
    });
    
  }
  catch (error) {
    res.status(500).send(error);
  }

});


app.post('/login',async function (req,res) {
  let {email , password} = req.body;
  let user = await userModel.findOne({email});
  if (!user) return res.status(500).send("Something went wrong");

  bcrypt.compare(password ,user.password,function (err,result) {
    if (result) {
      let token = jwt.sign({email : email , userid : user._id},"shhshh");
        res.cookie("token",token);
        res.redirect('/home');
    } else {
      res.redirect("/login");
    }
  })
});

app.get('/logout',function (req,res) {
  res.cookie("token","");
  res.redirect('/login');
});

app.get('/like/:id',IslogedIn, async function(req,res) {
    let post = await postModel.findOne({_id: req.params.id}).populate("user");;
    if (post.likes.indexOf(req.user.userid) === -1) {
        post.likes.push(req.user.userid);
    } else {
        post.likes.splice(post.likes.indexOf(req.user.userid),1)
    }
    await post.save();
    res.redirect('/home')
})

function IslogedIn(req, res, next) {
  if (!req.cookies.token) {
    res.redirect("/");
  } else {
    let data = jwt.verify(req.cookies.token, "shhshh");
    req.user = data;
    next();
  }
};

app.post('/post',IslogedIn, async function (req,res) {
  let user = await userModel.findOne({email : req.user.email});
  let {content} = req.body;
  let post = await postModel.create({
    user : user._id,
    content
  });
   user.posts.push(post._id);
  await user.save();
  res.redirect('/home');
})


const start = async function () {
  try {
    await connectdb();
    app.listen(3000, function () {
      console.log("Server started on http://localhost:3000");
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

start();
