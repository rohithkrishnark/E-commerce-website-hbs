var express = require("express");
var router = express.Router();
var controller = require("./controller");
var mongodb = require("mongodb");
var database = require("../../config/connection");
/* GET home page. */

router.get("/", controller.AdminHomePage);
router.get("/category", controller.AdminCategoryPage);
router.get("/product", controller.AdminProduct);
router.get("/subcat", controller.AdminSubCat);
router.get("/addcat", controller.AddCategories);
router.get("/catedti/:id", controller.EditCategories);
router.get("/addsub", controller.AdminSubCategory);
router.get("/editsub/:id", controller.EditSubCat);
router.get("/addproduct", controller.AddProducts);
router.get("/editprdt/:id", controller.EditProductDetail);
router.get("/users", controller.ViewUser);
router.get("/view/:id", controller.ViewDetails);

router.post("/editprdt/:id", (req, res) => {
  let EditProduct = {
    ProductName: req.body.prdtname,
    Descrption: req.body.description,
    Price: req.body.price,
    Category: req.body.category,
    SubCategory: req.body.subCat,
    ProductImage: req.files?.prdtimage.name,
  };
  let newData = "";
  if (req.files?.prdtimage) {
    newData = {
      ProductName:EditProduct.ProductName,
      Descrption: EditProduct.Descrption,
      Price: EditProduct.Price,
      Category: EditProduct.Category,
      SubCategory: EditProduct.SubCategory,
      ProductImage: EditProduct.ProductImage,
    }
    let MoveEditImage = req.files.prdtimage;
    MoveEditImage.mv('./public/images/product/' + EditProduct.ProductImage,function(err){
        if(err) throw err;
    })
  }else{
    newData = {
        ProductName:EditProduct.ProductName,
        Descrption: EditProduct.Descrption,
        Price: EditProduct.Price,
        Category: EditProduct.Category,
        SubCategory: EditProduct.SubCategory
      }
  }
  database.then((db)=>{
    let update_id = req.params.id
    db.collection("ProductDetail").updateOne({_id : new mongodb.ObjectId(update_id)},{$set:newData}).then((data)=>{
        console.log(`Data Updated succefully`);
    })
  })
  res.redirect("/admin/product")
});

router.get("/product/:id", (req, res) => {
  let delete_id = req.params.id;
  database.then((db) => {
    db.collection("ProductDetail")
      .deleteOne({ _id: new mongodb.ObjectId(delete_id) })
      .then((data) => {
        console.log(`One Data deleted succeffully`);
      });
  });
  res.redirect("/admin/product");
});

router.post("/addproduct", (req, res) => {
  let prodcutDetail = {
    ProductName: req.body.prdtname,
    Descrption: req.body.description,
    Price: req.body.price,
    Category: req.body.category,
    SubCategory: req.body.subCat,
    ProductImage: req.files.prdtimage.name,
  };
  let MoveData = req.files.prdtimage;
  MoveData.mv(
    "./public/images/product/" + prodcutDetail.ProductImage,
    function (err) {
      if (err) throw err;
    }
  );
  database.then((db) => {
    db.collection("ProductDetail")
      .insertOne(prodcutDetail)
      .then((data) => {
        console.log(`Data inserted succefully`);
        console.log(data);
      });
  });
  res.redirect("/admin/product");
});

router.post("/editsub/:id", (req, res) => {
  let update_id = req.params.id;
  let Update_Subcategory = {
    Group: req.body.categories,
    SubCatgories: req.body.subcat,
  };
  database.then((db) => {
    db.collection("SubCategories")
      .updateOne(
        { _id: new mongodb.ObjectId(update_id) },
        { $set: Update_Subcategory }
      )
      .then((data) => {
        console.log(`Data updated Succeffully`);
      });
  });
  res.redirect("/admin/subcat");
});

router.get("/subcat/:id", (req, res) => {
  let deleteID = req.params.id;
  database.then((db) => {
    db.collection("SubCategories")
      .deleteOne({ _id: new mongodb.ObjectId(deleteID) })
      .then((data) => {
        console.log(`One data deleted succeffully`);
      });
  });
  res.redirect("/admin/subcat");
});

router.get("/category/:id", (req, res) => {
  let delete_id = req.params.id;
  database.then((db) => {
    db.collection("Catories")
      .deleteOne({ _id: new mongodb.ObjectId(delete_id) })
      .then((data) => {
        console.log(`Data deleted Succeffully`);
        console.log(data);
      });
  });
  res.redirect("/admin/category");
});

router.post("/addcat", (req, res) => {
  let categories = {
    categoryName: req.body.catgry,
    Description: req.body.description,
    image: req.files.picture.name,
  };
  database.then((db) => {
    db.collection("Catories")
      .insertOne(categories)
      .then((data) => {
        let CategoriesImage = req.files.picture;
        CategoriesImage.mv(
          "./public/images/categories/" + categories.image,
          function (err) {
            if (err) throw err;
          }
        );
        console.log(`one data inserted succefully ${data}`);
      });
  });
  res.redirect("/admin/category");
});

router.post("/catedti/:id", (req, res) => {
  let update_id = req.params.id;
  let Updated_Data = {
    categoryName: req.body.catgry,
    Description: req.body.description,
    image: req.files?.picture.name,
  };
  let newData = "";
  if (req.files?.picture) {
    newData = {
      categoryName: Updated_Data.categoryName,
      Description: Updated_Data.Description,
      image: Updated_Data.image,
    };
    let moveUpdateFile = req.files.picture;
    moveUpdateFile.mv(
      "./public/images/categories/" + Updated_Data.image,
      function (err) {
        if (err) throw err;
      }
    );
  } else {
    newData = {
      categoryName: Updated_Data.categoryName,
      Description: Updated_Data.Description,
    };
  }
  database.then((db) => {
    db.collection("Catories")
      .updateOne({ _id: new mongodb.ObjectId(update_id) }, { $set: newData })
      .then((data) => {
        console.log("data updated succefully");
      });
  });
  res.redirect("/admin/category");
});

router.post("/addsub", (req, res) => {
  let SubCategoryDetail = {
    Group: req.body.categories,
    SubCatgories: req.body.subcat,
  };
  database.then((db) => {
    db.collection("SubCategories")
      .insertOne(SubCategoryDetail)
      .then((data) => {
        console.log("Data inserted succefullly");
      });
  });
  res.redirect("/admin/addsub");
});

module.exports = router;
