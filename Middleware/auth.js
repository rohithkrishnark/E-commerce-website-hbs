const database = require('../config/connection'); 

const addUserToLocals = async (req, res, next) => {
  if (req.session.user) {
    try {
      const db = await database;
      const totalItem = await db.collection("AddtoCart").countDocuments({ userId: req.session.user._id, status: 0 });
      res.locals.user = true;
      res.locals.totalItem = totalItem;
    } catch (error) {
      console.error("Error fetching cart item count:", error);
      res.locals.user = false;
      res.locals.totalItem = 0;
    }
  } else {
    res.locals.user = false;
    res.locals.totalItem = 0;
  }
  next();
};

module.exports = addUserToLocals;

