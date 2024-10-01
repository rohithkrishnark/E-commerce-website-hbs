var express = require('express');
var router = express.Router();
var admin = require("./admin")
var user = require("./user")
/* GET home page. */


router.use('/',user);
router.use('/admin',admin)

module.exports = router;
