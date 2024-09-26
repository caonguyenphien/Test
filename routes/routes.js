//Import
const express = require("express");
const router = express.Router();
//
const User = require('../models/users');
const multer = require('multer');

//file system (CRUD)
const fs = require("fs");
const { type } = require("os");
const e = require("express");

//(req,res)=> mặc định 2 giá trị. Ưu tiên cho dev trước (req), còn người dùng phía sau (res)
// router.get("/users", (req, res) => {
//     res.send("Hi Guy, All Users on the My Nodejs Project!");
// });

//Add image and upload
//image upload
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './upload')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single('image');

//Trang chủ
// router.get("/", (req, res) => {
//     res.render('index', { title: 'Home Page' })
// });
//Lưu dữ liệu và hình ảnh xuống database
//CALLBACK VERSION ADD
// router.post("/add",upload,(req,res)=>{
//     const user = new User({
//         name: req.body.name,
//         email:req.body.email,
//         phone:req.body.phone,
//         image:req.body.fieldname,
//     });
//     user.save((err)=>{
//         if(err){
//             res.json({message: err.message, type:'danger'});
//         }else{
//             req.session.message={
//                 type: "success",
//                 message:"User added successfully!",
//             }
//         };
//         res.redirect("/");
//     });
// });

//PROMISES VERSION ADD
// router.post("/add", upload,(req,res)=>{
//     const user = new User({
//         name:req.body.name,
//         email:req.body.email,
//         phone: req.body.phone,
//         image:req.file.filename,
//     });
//     user.save().then(()=>{
//         req.session.message={
//             type:"success",
//             messages:"User added successfully!",
//         };
//         res.redirect("/");
//     }).catch(err=>{res.json({message: err.message, type: 'danger'});});
// });

//Hiển thị hình ảnh lên html
//CALLBACK VERSION ADD
router.get("/add",(req,res)=>{res.render("add_users",{title: "Add Users"});})

//AWAIT/AS VERSION  ADD
router.post("/add", upload, async (req, res) => {
    try {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
      });
  
      await user.save();
  
      req.session.message = {
        type: "success",
        message: "User added successfully!",
      };
  
      res.redirect("/");
    } catch (err) {
      res.json({ message: err.message, type: 'danger' });
    }
  });
//HOME
//CALBACK VERSION


//PROMISE VERSION HOME
// router.get("/",(req,res)=>{
//     User.find().exec().then(users=>{
//         res.render('index',{
//             title: 'Home page',
//             users: users,
//         });
//     }).catch(err=>{
//         res.json({message: err.message});
//     });
// });

//AWAIT/AS VERSION HOME
router.get("/", async (req, res) => {
    try {
      const users = await User.find().exec();
      res.render('index', {
        title: 'Home page',
        users: users,
      });
    } catch (err) {
      res.json({ message: err.message });
    }
  });

//Xử lý hiển thị truyền dữ liệu ra html
//PROMISES VERSION EDIT
router.get("/edit/:id",(req,res)=>{
  let id  = req.params.id;
  User.findById(id)
    .then(user=>{
      if(user==null){
        res.redirect("/");
      }else{
        res.render("edit_users",{
          title: "Update User",
          user: user,
        });
      }
    })
    .catch(err=>{
      res.redirect("/");
    });
});

//Xử lý thông tin cho DEV (đưa vào data)
//ASYNC/ AWAIT VERSION EDIT
router.post("/edit/:id",upload,async(req,res)=>{
  try{
    let id = req.params.id;
    let new_image= "";
    
    if(req.file){
      new_image = req.file.filename ;
      try{
        fs.unlinkSync("./upload/", +req.body.old_image);
        }catch(err){
        console.log(err);
      }
    }else{
      new_image = req.body.old_image;
    }
    const result = await User.findByIdAndUpdate(id,{
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image,
    });
    req.session.message={
      type: "success",
      message: "User updated successfully!",
    };
    res.redirect("/");
  }catch(err){
    res.json({message: err.message, type: 'danger'})
  };
});


//Xóa dữ liệu trên database
//ASYNC / AWAIT VERSION DELETE
router.get("/delete/:id",upload,async(req,res)=>{
  try{
    let id = req.params.id;
    const result = await User.findByIdAndDelete(id);
    if(result.image!=""){
      try{
        fs.unlinkSync("./upload/", +result.image);
      }catch(err){
        console.log(err);
      }
    }
    req.session.message={
      type: "info",
      message: "User deleted successfully!",
    };
    res.redirect("/");
  }catch(err){
    res.json({message: err.message});
  }
});








module.exports = router;
