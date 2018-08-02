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
 app=express();





app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

app.get("/", (req, res) => {
	res.send("Hello from Express!")//res.send uses content-type:text/html
})

app.post("/api/insert_user_details",register_user.insert_user_details);
app.post("/api/generate_otp",register_user.generate_otp);
app.post("/api/verify_otp",register_user.verify_otp);
app.get("/api/generate_email",register_user.generate_email);
app.get("/api/verify_email",register_user.verify_email);

app.listen(process.env.PORT, (err) => {
  if (err) {
    throw err
  }
  console.log(`server is listening on ${process.env.PORT}`);
});
app.post("/api/login",login_user.login);
app.post("/api/securedapi",verify_token.verifytoken,secured_api.fun);










 
