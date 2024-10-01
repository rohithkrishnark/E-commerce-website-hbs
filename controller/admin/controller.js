const database = require("../../config/connection");
const mongodb = require("mongodb");

exports.AdminHomePage = async (req, res) => {
  try {
    const db = await database;
    const categoriesCollection = db.collection("Catories");
    const subcategoriesCollection = db.collection("SubCategories");
    const Prouductcollection = db.collection("ProductDetail");

    const catcount = await categoriesCollection.countDocuments();
    const subcatcount = await subcategoriesCollection.countDocuments();
    const product = await Prouductcollection.countDocuments();
    res.render("admin/adminHome", {
      admin: true,
      totalCategories: catcount,
      totalSubCategories: subcatcount,
      totalproduct: product,
    });
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.AdminCategoryPage = (req, res) => {
  database.then((db) => {
    db.collection("Catories")
      .find()
      .toArray()
      .then((data) => {
        res.render("admin/admincat", { admin: true, data });
      });
  });
};
exports.AdminProduct = (req, res) => {
  database.then(async (db) => {
    let data = await db
      .collection("ProductDetail")
      .aggregate([
        { $addFields: { CategName: { $toObjectId: "$Category" } } },
        {
          $lookup: {
            from: "Catories",
            localField: "CategName",
            foreignField: "_id",
            as: "Newresult",
          },
        },
        { $unwind: "$Newresult" },
        { $addFields: { SubCat: { $toObjectId: "$SubCategory" } } },
        {
          $lookup: {
            from: "SubCategories",
            localField: "SubCat",
            foreignField: "_id",
            as: "Finalresult",
          },
        },
        { $unwind: "$Finalresult" },
      ])
      .toArray();
    res.render("admin/product", { admin: true, data });
  });
};

exports.AdminSubCat = (req, res) => {
  database.then(async (db) => {
    let data = await db
      .collection("SubCategories")
      .aggregate([
        { $addFields: { category: { $toObjectId: "$Group" } } },
        {
          $lookup: {
            from: "Catories",
            localField: "category",
            foreignField: "_id",
            as: "FinalData",
          },
        },
        { $unwind: "$FinalData" },
      ])
      .toArray();
    res.render("admin/subcat", { admin: true, data });
  });
};
exports.AddCategories = (req, res) => {
  res.render("admin/AddCategory", { admin: true });
};
exports.EditCategories = (req, res) => {
  let edit_id = req.params.id;
  database.then((db) => {
    db.collection("Catories")
      .findOne({ _id: new mongodb.ObjectId(edit_id) })
      .then((data) => {
        res.render("admin/EditCat", { admin: true, data });
      });
  });
};

exports.AdminSubCategory = (req, res) => {
  database.then(async (db) => {
    let data = await db.collection("Catories").find().toArray();
    res.render("admin/Addsubcat", { admin: true, data });
  });
};

exports.EditSubCat = (req, res) => {
  let update_Id = req.params.id;
  database.then(async (db) => {
    let data = await db.collection("Catories").find().toArray();
    let result = await db
      .collection("SubCategories")
      .findOne({ _id: new mongodb.ObjectId(update_Id) });
    res.render("admin/EditSubCat", { admin: true, data, result });
  });
};

exports.AddProducts = (req, res) => {
  database.then(async (db) => {
    let data = await db.collection("Catories").find().toArray();
    let result = await db.collection("SubCategories").find().toArray();
    res.render("admin/Addproduct", { admin: true, data, result });
  });
};

exports.EditProductDetail = (req, res) => {
  let editing_id = req.params.id;
  database.then(async (db) => {
    let data = await db.collection("Catories").find().toArray();
    let result = await db.collection("SubCategories").find().toArray();
    let final_data = await db
      .collection("ProductDetail")
      .findOne({ _id: new mongodb.ObjectId(editing_id) });
    res.render("admin/Editproduct", { admin: true, data, result, final_data });
  });
};


exports.ViewUser = (req,res) =>{
  database.then(async(db)=>{
    let users =await db.collection("UserRegistration").find().toArray();
    res.render("admin/ViewUsers",{users,admin:true})
  })
}

exports.ViewDetails = (req, res) => {
  let user_id = req.params.id;
  database.then(async (db) => {
    try {
      let data = await db.collection("UserRegistration").findOne({ _id: new mongodb.ObjectId(user_id) });
      const TotalProduct = await db.collection("AddtoCart").countDocuments({ userId: req.params.id, status: 1 });
      let products = await db.collection("AddtoCart").aggregate([
        { $match: { userId: user_id, status: 1 } },
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
      res.render("admin/userDetial", { data, TotalProduct, products,admin:true });
    } catch (err) {
      console.error("Error fetching user details:", err);
      res.status(500).send("Error fetching user details");
    }
  });
};
