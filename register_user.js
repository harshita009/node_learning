
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
				if(err)
         			cb(err);
         		else
         			cb(null,constants.QUERY_SUCCESS.msg);
		
        		

			})
      	},
		two:["one",function(arg,cb){

			var otp=randomize('0000');
			sendOtp.send(user.phone,"Verification",otp, function (err) {
				if(err){
					sendOtp.retry(user.phone, false, function (err, data) {
					if(err)
					  cb(err);
					else
         			  cb(null,otp);
                   });
					
				}
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
			data:err
		   });
           
           }
           else{
           res.json({
			status:constants.SUCCESS.status,
			message:constants.SUCCESS.msg,
			data:result
		});
       }



                    });
      }
				


			
	

module.exports.verify_otp=function(req,res){

	var user={
		phone:req.body.phone,
	    otp:req.body.otp,
	    email:req.body.email,

    	};	
    	console.log(user);
	    
      	connection.query('update users set otp_verified=1 where email=? and otp=?',[user.email,user.otp],function(err,results){
		if(err){

			const error = boom.badRequest('SQL Error!');
    		error.output.payload.details = err; 
			res.json(error);

			
		}
		else{
		    if(results.changedRows==1){
		    	res.json({
				        status:constants.SUCCESS.status,
				        message:constants.SUCCESS.msg,
				        });

		    }	
		    else if(results.changedRows==1 && results.changedRows==0 ){
		    	res.json({
				        status:constants.SUCCESS.status,
				        message:"user already verified!",
				        });


		    }
		    else{
		    	res.json({
				        status:constants.SUCCESS.status,
				        message:"Incomplete Details!",
				        });


		    }

		   }

	  });
      }




