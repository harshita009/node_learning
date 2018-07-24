/**
 * Created by Harshita Gupta 20-07-2018
 */
var connection=require("./db_connection").connection_obj,
Cryptr=require("cryptr"),
jwt=require("jsonwebtoken"),
constants=require("./constants"),
async=require("async"),
boom=require("boom");


cryptr = new Cryptr(process.env.SECRET);
module.exports.login=function(req,res){
var user= {
             email:req.body.email,
          };

	async.waterfall([function(cb){     
  connection.query("select * from users where email= ?;",[user.email],function(err,results){
  if(err){
      
            cb(err);
      
         }
    
  else{
       if(results.length==0){
      
        cb(boom.notFound('user not found!'));//res.json uses content-type:application/json
       
          }
       else{
        return cb(null,results);
        }
      
    }
   });


},


function(results,cb){
    if(cryptr.decrypt(results[0].password)==req.body.password){   
      
      return cb(null);
         

     }
      else{
         
        return cb(boom.unauthorized('invalid password'));


   }

},


function(cb){
  var token = jwt.sign(user, process.env.SECRET, { expiresIn: process.env.TOKEN_LIFE}); 
  return cb(null,token);



}],cb);




function cb(err,result){
  if(err){
    
     res.json(err);
  }
  else{
   res.json({
          status:constants.SUCCESS.status,
          message:constants.SUCCESS.msg,
          token:result

    });
  }

}





}
