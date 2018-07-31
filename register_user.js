
/**
 * Created by Harshita Gupta 20-07-2018
 */
var Cryptr=require("cryptr"),
express=require("express"),
connection=require("./db_connection").connection_obj,
app=express(),
async = require('async'),
SendOtp = require('sendotp'),
randomize=require('randomatic'),
sendOtp = new SendOtp('228979AfBsDtmzi5b5f16ab'),
cryptr = new Cryptr(process.env.SECRET),
boom=require("boom"),
constants=require("./constants.js");
module.exports.generate_otp=function(req,res){
	var encrptedPass=cryptr.encrypt(req.body.password);
	console.log(req.body.phone);
	var user={
		name:req.body.user_name,
		password:encrptedPass,
		email:req.body.email,
		phone:req.body.phone,
	};	
	    
      	async.auto({ 
      	one : function(cb){
      		connection.query('INSERT INTO users SET ?;',user,function(err,results)
      		{
				if(err){
					
				    if(err.code=="ER_DUP_ENTRY"){
				    	connection.query('select otp_verified from users where email=?;',user.email,function(err,result){
				    		if(result[0].otp_verified==0){
                                cb(null,constants.QUERY_SUCCESS.msg);
				    		}
				    		else{
                                cb(err);
				    		}
				    	});
				    }
				}
         			
         		else
         			cb(null,constants.QUERY_SUCCESS.msg);
		
        		

			})
      	},
		two:["one",function(arg,cb){

			var otp=randomize('0000');
			sendOtp.setOtpExpiry('5');
			sendOtp.send(user.phone,"Verification",otp, function (err) {//Retry Sending otp -To Be Done 
				if(err)
					cb(err);
				else
         			cb(null,otp);
				
				})
		}],
		three:["one","two",function(arg,cb){
					console.log(arg);
					connection.query('update users SET otp=? where email=?;',[arg.two,user.email],function(err,results){
                      if(err)
                      	cb(err);
                      else
         			    cb(null,constants.QUERY_SUCCESS.msg);
                                              
                    })}]
				}
                    
        ,function(err,result){
         if(err){
           res.json({
			status:constants.FALIURE.status,
			message:constants.FALIURE.msg,
			data:err,
		   });
           
           }
           else{
           res.json({
			status:constants.SUCCESS.status,
			message:constants.SUCCESS.msg,
			data:result,
		});
       }

      });
      }
				


			
	

module.exports.verify_otp=function(req,res){

	var user={
		email:req.body.email,
		phone:req.body.phone,
	    otp:req.body.otp,
	    	};	
    	
    	sendOtp.verify(user.phone,user.otp, function (err, data) {
 		
 		if(data.type == 'success') 
 		{
 			
 			connection.query('update users SET otp_verified=1 where email=?;',[user.email],function(err,results){
            if(err){
            	throw(err);
            }
            else{
         			   res.json({
			              status:constants.SUCCESS.status,
			              message:constants.SUCCESS.msg,
			              });
                                              
                 }
            });


 	    }
  		if(data.type == 'error'){
  			
  			res.json({
			status:constants.FALIURE.status,
			message:constants.FALIURE.msg,
		
		   });
		   }
		});
		}

