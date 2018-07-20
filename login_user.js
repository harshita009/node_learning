var connection=require("./db_connection").connection_obj,
Cryptr=require("cryptr"),
jwt=require("jsonwebtoken");

cryptr = new Cryptr(process.env.SECRET);

module.exports.login=function(req,res){
	var today=new Date;
	var user= {
	    email:req.body.email,
    };
    var encrptedPass=cryptr.encrypt(req.body.password);
    connection.query("select * from users where email= ?;",[user.email,encrptedPass],function(err,results){
    if(err)
    {
    	console.log("error")
    	throw err;
    }
    else{
    console.log(results); 
    console.log(results[0].name);
    console.log(results[0].phone);
    // console.log(results[0].password);
    if(cryptr.decrypt(results[0].password)==req.body.password)
    {
    console.log("Password matched!")
    var token = jwt.sign(user, process.env.SECRET, { expiresIn: process.env.TOKEN_LIFE}) 
    res.json({
				status:"Successfull",
				message:"User Logged In Successfully!",
				data:results,
				token:token,

			});

     }
      else{
   	res.json({
				status:"Successfull",
				message:"Wrong Password!",
				
			});


   }
   }
  


    });






}
