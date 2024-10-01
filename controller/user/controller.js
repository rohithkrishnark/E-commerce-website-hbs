const database = require("../../config/connection");
const mongodb = require("mongodb");
const session = require("express-session");

exports.UserHomePage = (req, res) => {
  let cartUpdated = req.session.cartUpdated;
  req.session.cartUpdated = null;

  database.then(async (db) => {
    try {
      let productData = await db.collection("ProductDetail").find().toArray();
      let CategoryData = await db.collection("Catories").find().toArray();
        res.render('user/home', { productData, CategoryData,users:true, cartUpdated: cartUpdated });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });
};


exports.ProductDetail = (req, res) => {
  let newdata = req.params.id;
  database.then(async (db) => {
    let data = await db
      .collection("ProductDetail")
      .findOne({ _id: new mongodb.ObjectId(newdata) });
    let result = await db
      .collection("ProductDetail")
      .aggregate([
        { $addFields: { CatGName: { $toObjectId: "$Category" } } },
        {
          $lookup: {
            from: "Catories",
            localField: "CatGName",
            foreignField: "_id",
            as: "output",
          },
        },
        { $unwind: "$output" },
      ])
      .toArray();
    res.render("user/productdt", { data, users: true });
  });
};

exports.CategoriesDetail = async (req, res) => {
  const category_id = req.params.id;
  database.then(async (db) => {
    let data = await db
      .collection("ProductDetail")
      .aggregate([
        { $addFields: { CatName: { $toObjectId: "$Category" } } },
        {
          $lookup: {
            from: "Catories",
            localField: "CatName",
            foreignField: "_id",
            as: "output",
          },
        },
        { $unwind: "$output" },
        {
          $match: {
            CatName: new mongodb.ObjectId(category_id),
          },
        },
      ])
      .toArray();
    if (data.length > 0) {
      const categoryName = data[0].output.categoryName;
      res.render("user/categorydt", { data, categoryName });
    } else {
      res.render("user/categorydt", { data: [], categoryName: "" });
    }
  });
};

exports.UserRegister = (req, res) => {
  res.render("user/UserRegister", { users: true });
};




  exports.MyCartpage = (req,res) =>{
    if (!req.session.user || !req.session.user._id) {
      return res.status(401).redirect('/login');
    }
    let userId = req.session.user._id; 
    database.then(async(db)=>{
      let result = await db.collection("AddtoCart").aggregate([
        { $match: { userId: userId } }, 
        {"$addFields":{"ProductDt":{"$toObjectId":"$ProductId"}}},
        {
          $lookup:{
            from:"ProductDetail",
            localField:"ProductDt",
            foreignField:"_id",
            as:"finalproduct"
          }
        },
        {$unwind:"$finalproduct"},
        {"$addFields":{"UserDetail":{"$toObjectId":"$userId"}}},
        {
          $lookup:{
            from:"UserRegistration",
            localField:"UserDetail",
            foreignField:"_id",
            as:"finalUser"
          }
        },
        {$unwind:"$finalUser"},
      ]).toArray()
      res.render("user/MyCart",{result})
    })
  }

exports.AddtoCart = (req, res) => {
  if (!req.session.user) {
    return res.status(401).redirect('/login');
    
  }
  let cart_item = {
        ProductId: req.params.id,
        userId: req.session.user._id,
        status:0 
    };
  database.then(async(db)=>{
    let data = await db.collection("AddtoCart").insertOne(cart_item)
    if(data){
      req.session.cartUpdated = true;
      res.redirect('/')
    }else{
      console.log(`Error occuring in adding data`);
    }
  })
};

exports.UserLogin = (req, res) => {
  res.render("user/UserLogin", { users: true });
};

exports.OrderPage = (req, res) => {
  req.session.orderNowClicked = true;
  let userId = req.session.user._id;

  database.then(async (db) => {
    try {
      let orderedItems = await db.collection("AddtoCart").aggregate([
        { $match: { userId: userId, status: 1 } },
        { "$addFields": { "ProductDt": { "$toObjectId": "$ProductId" } } },
        {
          $lookup: {
            from: "ProductDetail",
            localField: "ProductDt",
            foreignField: "_id",
            as: "finalproduct"
          }
        },
        { $unwind: "$finalproduct" }
      ]).toArray();
      res.render("user/orderpage", {
        orderedItems: orderedItems
      });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};

exports.PlaceOrder = (req,res) =>{
  let userId = req.session.user._id;
  database.then(async(db)=>{
    await db.collection("AddtoCart").updateMany(
      { userId: userId },
      { $set: { status: 1 } }
    );
  })
  res.redirect("/odernow")
}