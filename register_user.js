
/**
 * Created by Harshita Gupta 20-07-2018
 */
var Cryptr=require("cryptr"),
express=require("express"),
connection=require("./db_connection").connection_obj,
app=express(),
SendOtp = require('sendotp'),
randomize=require('randomatic'),
sendOtp = new SendOtp('228979AfBsDtmzi5b5f16ab'),
cryptr = new Cryptr(process.env.SECRET),
boom=require("boom"),
constants=require("./constants.js");
module.exports.register=function(req,res){
	console.log("reg",req.body);
	var encrptedPass=cryptr.encrypt(req.body.password);
	console.log(req.body.phone);
	var user={
		name:req.body.user_name,
		password:encrptedPass,
		email:req.body.email,
		phone:req.body.phone,
	

	};	
	    
      	connection.query('INSERT INTO users SET ?;',user,function(err,results){
		if(err){

			const error = boom.badRequest('SQL Error!');
    		error.output.payload.details = err; 
			res.json(error);

			
		}
		else{
			var otp=randomize('0000');
			sendOtp.setOtpExpiry('10');
			sendOtp.send(user.phone,"Verification",otp, function (error, data) {
				if(err)
					throw err;
				else{
					
					connection.query('update users SET otp=? where email=?;',[otp,user.email],function(err,results){
                      if(err)
                      	throw err;
                      else
                      	console.log("otp updated");
                     
				});
			res.json({
				status:constants.SUCCESS.status,
				message:constants.SUCCESS.msg,
				data:results,

			});
			}
	});

      }


	