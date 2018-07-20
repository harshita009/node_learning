/**
 * Module dependencies.
 */
 require("dotenv").config();
 var express=require("express"),
 body_parser=require("body-parser"),
 register_user=require("./register_user")
 verify_token=require("./verify_token"),
 login_user=require("./login_user"),
 jwt=require("jsonwebtoken"),
 secured_api=require("./secured_api"),
 //router = express.Router(),
 app=express();





app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());


app.get('/', (request, response) => {
  response.send('Hello from Express!')
})


app.post('/api/register',register_user.register);

app.listen(process.env.PORT, (err) => {
  if (err) {
    throw err
  }
  console.log(`server is listening on ${process.env.PORT}`)
});
//router.use(verify_token.verifytoken());
app.post('/api/login',login_user.login);
app.post('/api/securedapi',verify_token.verifytoken,secured_api.fun);










 
