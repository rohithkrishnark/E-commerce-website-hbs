var express = require("express");
var router = express.Router();
var controller = require("./controller");
var database = require("../../config/connection");
var bcrypt = require("bcrypt");
var session = require("express-session");
var mongodb =require("mongodb")

/* GET home page. */

router.get("/", controller.UserHomePage);
router.get("/productDetail/:id", controller.ProductDetail);
router.get("/categories/:id", controller.CategoriesDetail);
router.get("/register", controller.UserRegister);
router.get("/login", controller.UserLogin);
router.get('/addcart/:id',controller.AddtoCart)
router.get('/mycart',controller.MyCartpage)
router.get('/placeorder',controller.PlaceOrder)
router.get("/odernow",controller.OrderPage)




router.get("/mycart/:id",(req,res)=>{
  let delte_id = req.params.id;
  database.then((db)=>{
    db.collection("AddtoCart").deleteOne({_id: new mongodb.ObjectId(delte_id)}).then((data)=>{
      console.log(`item deleted succefully`);
    })
  })
  res.redirect("/mycart")
})

router.post("/register", (req, res) => {
  let UserDetail = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    status: 1,
  };
  database.then((db) => {
    bcrypt.hash(req.body.password, 10).then((passResult) => {
      UserDetail.password = passResult;
      db.collection("UserRegistration")
        .insertOne(UserDetail)
        .then((data) => {
          console.log(`One data inserted successfully`);
        });
    });
  });
  res.redirect("/register");
});

router.post("/login", (req, res) => {
  let login_detail = {
    email: req.body.email,
    password: req.body.password,
  };
  database.then(async (db) => {
    let user = await db
      .collection("UserRegistration")
      .findOne({ email: login_detail.email });

    if (user) {
      let passmatch = bcrypt.compare(login_detail.password, user.password);
      if (passmatch) {
        req.session.user = user;
        req.session.save()
        console.log(user);
        if (user.status == 0) {
          res.redirect("/admin");
        } else {
          res.redirect("/");
        }
      } else {
        console.log("You entered incoorect passowrd");
        res.redirect("/login");
      }
    }else{
        console.log(`no user found`);
    }
  }).catch((err)=>{
    console.log(`internal server error`);
  })
});




router.get("/logout",(req,res)=>{
    console.log(req.session);
    req.session.destroy();
    res.redirect("/login")
})

module.exports = router;


