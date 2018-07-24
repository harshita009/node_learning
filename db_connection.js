
/**
 * Created by Harshita Gupta 20-07-2018
 */
var constants=require("./constants.js");
var mysql = require('mysql'),
connection_obj = mysql.createConnection({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASS,
database:process.env.DB_NAME
});

var connection=function(){

connection_obj.connect(function(err) {
  
 if(err)
  throw err;
 else
 {
  console.log(constants.SUCCESS.msg);
 }
  
});}();



module.exports.connection_obj=connection_obj;




