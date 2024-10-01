const mongodb = require("mongodb").MongoClient;
const conn = new mongodb("mongodb://localhost:27017/");



function MyConnection(){
   return conn.connect().then((dbase)=>{
        let database = dbase.db("ECommerse");
        return database
    })
}
module.exports = MyConnection()