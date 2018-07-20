/**
 * Created by Harshita Gupta 20-07-2018
 */
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
    connection.query("select * from users where email= ?;",[user.email],function(err,results){
    if(err){
    	throw err;
    }
    
    else{
       if(cryptr.decrypt(results[0].password)==req.body.password){
       var token = jwt.sign(user, process.env.SECRET, { expiresIn: process.env.TOKEN_LIFE}); 
       // connection.query("update users set token=? where email= ?",[token,user.email],function(err,result){
       // if(err){
       //     	throw err;
       //     }
       //  else{
       //    	console.log("Token Updated!");
       //     }

       // });

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
