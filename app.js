/**
 * Created by Harshita Gupta 20-07-2018
 */
 require("dotenv").config();
 var express=require("express"),
 body_parser=require("body-parser"),
 register_user=require("./register_user")
 verify_token=require("./verify_token"),
 login_user=require("./login_user"),
 jwt=require("jsonwebtoken"),
 secured_api=require("./secured_api"),
 //swagger = require("swagger-node-express"),
 app=express();
 const Docs = require('express-api-doc');
 const dock = new Docs(app);
 dock.track({
    path: './public/examples.txt', // responses and requests will save here
})





app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

// Couple the application to the Swagger module.
//swagger.setAppHandler(app);
//swagger.addModels(models);

app.get("/", (request, response) => {
  response.send("Hello from Express!")
})


app.post("/api/register",register_user.register);

app.listen(process.env.PORT, (err) => {
  if (err) {
    throw err
  }
  console.log(`server is listening on ${process.env.PORT}`)
});
app.post("/api/login",login_user.login);
app.post("/api/securedapi",verify_token.verifytoken,secured_api.fun);










 
