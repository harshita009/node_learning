
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
sendOtp = new SendOtp(process.env.OTPKEY),
cryptr = new Cryptr(process.env.SECRET),
boom=require("boom"),
constants=require("./constants.js")
nodemailer=require("nodemailer");


var smtpTransport =nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD
    }
});







module.exports.insert_user_details=function(req,res){
	var encrptedPass=cryptr.encrypt(req.body.password);
	var user={
		name:req.body.user_name,
		password:encrptedPass,
		email:req.body.email,
		phone:req.body.phone,
	};	
  
  connection.query('INSERT INTO users SET ?;',user,function(err,results){
  var msg;
  if(err){		
        
		if(err.code=="ER_DUP_ENTRY"){
		
		 	connection.query('select otp_verified from users where email=?;',user.email,function(err,result){
		 		if(result[0].otp_verified==0)
		 		{
		 			
		  			msg="OTP not verified";
		 		}

                
                else
                {
                	msg="This email is already registered with us.";               	
                }
             
                res.json({
			    status:constants.SUCCESS.status,
			    message:constants.SUCCESS.msg,
			    data:msg,

		    });  

                    	
			});
	    }
	    else{
          
	    	res.json({
			status:constants.FALIURE.status,
			message:constants.FALIURE.msg,
			data:err,});  
	    }
		}
         			
  else{
      msg="User details inserted successfully.";
       res.json({
			    status:constants.SUCCESS.status,
			    message:constants.SUCCESS.msg,
			    data:msg,
		    }); 

	  } 

       			
		
    });

}


module.exports.generate_otp=function(req,res){
	var msg;
	var user={		
		email:req.body.email,
		phone:req.body.phone,
	};	
	    
      	    
			//If user has already verified phone no TBD
			var otp=randomize('0000');
			sendOtp.setOtpExpiry('30');
			sendOtp.send(user.phone,"Verification",otp, function (err) {//Retry Sending otp -To Be Done 
				if(err || user.phone==undefined)
					msg="OTP not sent!"+err;
				else
         			msg="OTP sent successfully!"

         	   res.json({status:constants.SUCCESS.status,
			   message:constants.SUCCESS.msg,
			   data:msg});
				
				});
     



      }
				


			
	

module.exports.verify_otp=function(req,res){
    var msg;
	var user={
		email:req.body.email,
		phone:req.body.phone,
	    otp:req.body.otp,
	    	};	
    	
    	sendOtp.verify(user.phone,user.otp, function (err, data) {
  		if(data.type == 'success') 
 		{
 			
 			connection.query('update users SET otp_verified=1 where email=?;',[user.email],function(err,results){
            msg=constants.SUCCESS.msg;                                  
            res.json({
			status:constants.SUCCESS.status,
			message:constants.SUCCESS.msg,
		    data:msg
		    });

        });
        }
  		
  		if(data.type == 'error')
  		{
  			msg="Otp verification failed!"; 
  			res.json({
			status:constants.FALIURE.status,
			message:constants.FALIURE.msg,
		    data:msg
		    });			
		}



		});
        
    }


module.exports.generate_email=function(req,res){
var msg;

//If user has already verified email no TBD
async.series({
         one : function(callback){
         rand=Math.floor((Math.random() * 100) + 54);
         console.log(rand);
         link="http://"+req.get('host')+"/verify?id="+rand;
         mailOptions={
             to : req.query.email,
             subject : "Please confirm your Email account",
             html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
            }
         smtpTransport.sendMail(mailOptions, function(err, response){
         if(err){
            msg=err;
            
         }else{	 
         	msg="Email sent successfully!";
         	callback(null);
          }});
     },
    two : function(callback){
   	connection.query('update users SET email_link=? where email=?;',[rand,req.query.email],function(err,results){
		callback(null);
	});
   }},

function(err){
	if(err){
		msg=err;
		res.json({status:constants.FALIURE.status,
		message:constants.FALIURE.msg,
		data:msg});
	}
	else{
		res.json({status:constants.SUCCESS.status,
		message:constants.SUCCESS.msg,
		data:msg});
	}
});



}

module.exports.verify_email=function(req,res){
var msg;
async.waterfall([function(callback){
connection.query('select email_link from users where email=?',[req.query.email],function(err,result){
if(err)
callback(err);
else
callback(null,result[0].email_link);
});

},

function(result,callback){ 

if(req.query.rand==result){
connection.query('update users set email_verified=1  where email=?',[req.query.email],function(err,result){
if(err)
  callback(err);
else
  callback(null); 

});}

}],

function(err){
	if(err){
		res.json({status:constants.FALIURE.status,
		message:constants.FALIURE.msg,
		data:err});
	}
	else{
        msg="Email verified successfully!";
	    res.json({status:constants.SUCCESS.status,
		message:constants.SUCCESS.msg,
		data:msg});
       }
   });
}


	

