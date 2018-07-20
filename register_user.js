
/**
 * Created by Harshita Gupta 20-07-2018
 */
var Cryptr=require("cryptr"),
express=require("express"),
connection=require("./db_connection").connection_obj,
app=express(),
cryptr = new Cryptr(process.env.SECRET);
module.exports.register=function(req,res){
	//var today=new Date;
	var encrptedPass=cryptr.encrypt(req.body.password);
	console.log(req.body.phone);
	var user={
		name:req.body.user_name,
		password:encrptedPass,
		email:req.body.email,
		phone:req.body.phone,
		//created_at:today,
		//updated_at:today,

	};	
	    
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
	