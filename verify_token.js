/**
 * Created by Harshita Gupta 20-07-2018
 */
var jwt = require('jsonwebtoken');
module.exports.verifytoken = function(req,res,next) {
  var token = req.body.token;
    if (token) {
        jwt.verify(token,process.env.SECRET,function(err) {
            if (err) { 
                throw err;
            }  
            else{ 
                 next();
            } 
        });
    } else {
       
       console.log("No Token Received.");
    }
}