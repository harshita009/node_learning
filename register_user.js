var Cryptr=require("cryptr"),
express=require("express"),
connection=require("./db_connection").connection_obj,
app=express(),
cryptr = new Cryptr(process.env.SECRET);
//console.log("Connection", connection);
module.exports.register=function(req,res){
	var today=new Date;
	var encrptedPass=cryptr.encrypt(req.body.password);
	//console.log("encrptedPass  "+ encrptedPass);
	//console.log("decryptedPass  "+ cryptr.decrypt(encrptedPass));
	console.log(req.body.phone);
	var user={
		name:req.body.user_name,
		password:encrptedPass,
		email:req.body.email,
		phone:req.body.phone,
		created_at:today,
		updated_at:today,

	};	
	    //console.log("user",user);
      	connection.query('INSERT INTO users SET ?;',user,function(err,results){
		if(err)
			res.json({
             status:"Failed",
             message:"An Error Occured",
             data:err
			});
		else
			res.json({
				status:"Successfull",
				message:"User Regisered Successfully!",
				data:results,

			});
			
	});

      }
	