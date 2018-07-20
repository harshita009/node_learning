
var mysql = require('mysql');
var connection_obj = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
 });

var connection=function(){

connection_obj.connect(function(err) {
 if(err)
  throw err;
 else
 {
  console.log("Connect To DB  Successfully!");
  connection_obj.query("use login_and_reg;",function(err,result){
  if(err){
  	throw err;
  }
  else{
    console.log("using database login_and_reg.");
       
  }
  });
 
}
  
});}();



module.exports.connection_obj=connection_obj;




