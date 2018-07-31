
/**
 * Created by Harshita Gupta 20-07-2018
 */

//Importing modules to be used. 

var Cryptr=require("cryptr"),
express=require("express"),
connection=require("./db_connection").connection_obj,
app=express(),
async = require('async'),
SendOtp = require('sendotp'),
randomize=require('randomatic'),
sendOtp = new SendOtp(process.env.OTPKEY),
cryptr = new Cryptr(process.env.SECRET),
constants=require("./constants.js");


/*
There were two ways to do otp verification:
1-Generate the otp 
2-Store the otp in the db
3-If the otp entered by the user matched the otp in the db for that user then user's phone number is verified.
4-Otp is valid or invalid this will be verified using a mysql query.

The second method is using the sendotp modules builtin functions for the purpose of otp verification
and validity.

Below is the implementation using second method.
*/


//Generating the OTP.
module.exports.generate_otp=function(req,res){
	//encrypting the password bare password should not be stored in the db.
	var encrptedPass=cryptr.encrypt(req.body.password);
	

	var user={
		name:req.body.user_name,
		password:encrptedPass,
		email:req.body.email,
		phone:req.body.phone,
	};	
	

	/*Using aync.auto for the purpose of serializing the execution of sub tasks.
    In async.auto the result is the argument passed with the callback function.
    And every function passes the result till that function to the next function.
    Important point to note is that if a function is dependent on some other function
    the order in which the parameters are received is opposite to what it is in normal case.
    i.e. The first argument is the result and the second one is the callback.
    */
    async.auto({ 

    	//First function which will be executed it not dependent on any function.
      	one : function(cb){
      		/*Inserting all the details of the user in db.
      		The values of the columns like otp_verified will be set to 0 by default.*/
      		
      		connection.query('INSERT INTO users SET ?;',user,function(err,results)
      		{
				if(err){
					/*This condition is to deal with the case when a user has not verified
                    the otp before expiry.*/
				    if(err.code=="ER_DUP_ENTRY"){
				    	//User details are there in the db but the phone nubmer of the user is not verified yet.
				    	connection.query('select otp_verified from users where email=?;',user.email,function(err,result){
				    		if(result[0].otp_verified==0){
				    			//The result this function would be constants.QUERY_SUCCESS.msg.
                                cb(null,constants.QUERY_SUCCESS.msg);
				    		}
				    		else{
				    			//Since an error occured the final callback will be executed.
                                cb(err);
				    		}
				    	});
				    }
				}
         			
         		else
         			//The result corresponding to one would be constants.QUERY_SUCCESS.msg.
         			cb(null,constants.QUERY_SUCCESS.msg);
		
        		

			})
      	},
      	/*This is the second function and it is dependent on the first function as we want no otp to be generated
      	before inserting the details of the user and confirming that he does not has its mobile number already verified.        
         */
		two:["one",function(arg,cb){
            //Function to generate a 4 digit OTP.
         	var otp=randomize('0000');
         	//Expiry time of OTP in minutes. 
			sendOtp.setOtpExpiry('5');
			//Sending the OTP to the user.
			sendOtp.send(user.phone,"Verification",otp, function (err) {//Retry Sending otp -To Be Done 
				if(err)
					cb(err);
				else
					//The result of this function will be the otp.
         			cb(null,otp);
				
				})
		}],
		/*This is the third and the last function and it is dependent on function one and two i.e. details will be inserted 
		otp will be generated and then the value of the otp will be stored in db.*/
		three:["one","two",function(arg,cb){
					connection.query('update users SET otp=? where email=?;',[arg.two,user.email],function(err,results){
                      if(err)
                      	cb(err);
                      else
         			    cb(null,constants.QUERY_SUCCESS.msg);
                                              
                    })}]
				}
                    
        ,
        //Final callback.
        function(err,result){
         if(err){
           //Faliure status and msg.
           res.json({
			status:constants.FALIURE.status,
			message:constants.FALIURE.msg,
			data:err,
		   });
           
           }
           else{
           //Success status and msg.
           res.json({
			status:constants.SUCCESS.status,
			message:constants.SUCCESS.msg,
		   //result will be a json containing the function name and there corresponding results.
			data:result,
		});
       }

      });
      }
				


			
	
//Verifying OTP
module.exports.verify_otp=function(req,res){

	var user={
		email:req.body.email,
		phone:req.body.phone,
	    otp:req.body.otp,
	    	};	
    	//Function to verify the OTP.
    	sendOtp.verify(user.phone,user.otp, function (err, data) {
 		
 		if(data.type == 'success') 
 		{
 			//Updation of is_verified column in db if the OTP has been successfully verified. 
 			connection.query('update users SET otp_verified=1 where email=?;',[user.email],function(err,results){
            if(err){
            	//In case of updation query err throw err rare to occur. 
            	throw(err);
            }
            else{
            	//Success status and msg.
         			   res.json({
			              status:constants.SUCCESS.status,
			              message:constants.SUCCESS.msg,
			              });
                                              
                 }
            });


 	    }
 	    //For case when user has entered the wrong otp or when the OTP is no longer valid.
  		if(data.type == 'error'){
  			
  			res.json({
			status:constants.FALIURE.status,
			message:constants.FALIURE.msg,
		
		   });
		   }
		});
		}

