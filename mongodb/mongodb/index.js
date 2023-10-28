const express=require('express');
const mongoose=require('mongoose');
require('./config');
const Product=require('./Product');
const otp=require('./otp')
const jwt=require('jsonwebtoken');
const nodemailer = require('nodemailer');
const secretkey="secreatkey";


const app=new express();
// Serve static files from the "public" directory
app.use(express.static('public'));

app.use(express.json());

app.post("/create",async(req,res)=>{
    let data=new Product(req.body);
    let result=await data.save();
    res.send(result);
})

app.get("/list",async(req,res)=>{
    let data=await Product.find({});
    res.send(data);
})

app.delete("/delete/:_id",async(req,res)=>{
    let data=await Product.deleteOne(req.params);
    res.send(data);
})

app.put("/update/:_id",async(req,res)=>{
     let data=await Product.updateOne(
        req.params,
        {
            $set:req.body 
        }
     );
     res.send(data);

});

app.get("/search/:key",async(req,res)=>{
    let data=await Product.find(
        {
            "$or":[
                {
                    "name":{$regex:req.params.key}    
                }
        
            ]
        }
    )
    res.send(data)
});

app.post("/login",async(req,res)=>{
    const user={
        id:1,
        name:"anil",
        email:"anil11@gmail.com"
    }
    jwt.sign({user},secretkey, {expiresIn:'300s'},(err,token)=>{
        res.json({
            token,
            message:"token generated !"
        })
  })
})

app.post("/profile",verifyToken,(req,res)=>{
   jwt.verify(req.token,secretkey,(err,authData)=>{
    if(err){
        res.send({result:"invalid token"});
    }
    else{
        res.json({
            message:"profile accessed!",
            authData
        })
    }
   })
})

function verifyToken(req,res,next){
    const bearerHeader=req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
       const bearer=bearerHeader.split(" ");
       const token=bearer[1];
       req.token=token;
       next();
    }
    else{
        res.send({
            result:'Token is not valid'
        })
    }
}

// Generate a 6-digit OTP normal
// const generateOTP = () => {
//     const digits = '0123456789';
//     let OTP = '';
//     for (let i = 0; i < 4; i++) {
//         OTP += digits[Math.floor(Math.random() * 10)];
//     }
//     return OTP;
// };

// app.get('/generate-otp', (req, res) => {
//     const otp = generateOTP();
//     res.send(`Your One-Time Password is: ${otp}`);
// });


// Generate a 6-digit OTP and store the timestamp
// const otpSchema = new mongoose.Schema({
//     otp: String,
//     token: String,
//   });
// const otp1 = mongoose.model('otp', otpSchema);

let otpData = { otp: null, timestamp: null };

const generateOTP = () => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    otpData = { otp: OTP, timestamp: Date.now() };
};

const isOTPValid = () => {
    if (!otpData.otp || !otpData.timestamp) {
        return false;
    }
    const currentTime = Date.now();
    return currentTime - otpData.timestamp < 60000;
};

let otpValid = "";
let valitoken="";

const secretKey = 'yourSecretKey';
app.get('/generate-otp', async(req, res) => {
    generateOTP();
    otpValid = otpData.otp;
    //otpValid={otpValid};
    let time= new Date();
    let date=JSON.stringify(time);
    console.log(date);
    jwt.sign({ date }, secretKey, { expiresIn: '300s' }, async (err, token) => {

        if (err) {
            console.error('Error creating JWT token:', err);
            res.status(500).send('Internal Server Error');
          } else {
            valitoken = token;
            
            let info = {token: valitoken, otp:otpValid };
            let data = new otp(info);

           //email send code
            try {
              let result = await data.save();
              //let data=await otp.create({token:valitoken,otp:otpValid});

              setTimeout(async(req,res)=>{
              let del=await otp.findByIdAndDelete(result._id);
              console.log('expired otp!')
              },10000);



              const mailOptions = {
                
                from: 'prince.raj@indicchain.com', 
                to: 'princesh1411@gmail.com', 
                subject: 'Test otp generation message', 
                text:`this message regarding otp ${result.otp}`,
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error occurred: ', error);
                    res.send('Error occurred while sending email');
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
              res.send(`Your One-Time Password is: ${otpValid} and Token: ${valitoken} and ${result} and email send successfully`);
            } catch (error) {
              console.error('Error saving data to database:', error);
              res.status(500).send('Internal Server Error');
            }
          }

    });
});

app.get('/validate-otp/:otp', async(req, res) => {
    let otp = req.params.otp;
    let data=await otp.find({});
    console.log(data);
    if (isOTPValid() && otpValid === otp) {
        res.send('OTP is valid');
    } else if (otpValid !== otp) {
        res.send('Not matched OTP');
    } else {
        res.send('OTP has expired');
    }
});

//send email by nodemailer.
const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    service: 'gmail',
    auth: {
        user: 'prince.raj@indicchain.com', // Replace with your email
        pass: 'ofltduvzoepxiiis', // Replace with your password
    },
});

app.get('/send-email', (req, res) => {
    const mailOptions = {
        from: 'princesh1411@gmail.com', // Sender address
        to: 'prince.raj@indicchain.com', // List of recipients
        subject: 'Test otp generation', 
        text:'this message regarding otp',
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error occurred: ', error);
            res.send('Error occurred while sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Email sent successfully');
        }
    });
});

//forgot password api
passtoken='';
app.post('/forgot-password', (req, res) => {
    const userEmail = req.body.email; 
    //const resetToken = generateRandomToken(); 
    const user={
        email:userEmail,
    }
    jwt.sign({user},secretkey, {expiresIn:'300s'},(err,token)=>{
       passtoken=token;
       console.log(passtoken)
    })

    const mailOptions = {
        from: 'prince.raj@indicchain.com',
        to: userEmail,
        subject: 'Reset Your Password',
        text: `Click on this link to reset your password: http://yourwebsite.com/reset-password?token=${passtoken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error occurred: ', error);
            res.status(500).send('Error sending reset password email');
        } else {
            //console.log('Email sent: ' + info.response);
            res.send(`Reset password email sent successfully ${passtoken}`);
        }
    });
});

//reset password.
app.post('/reset-password', async(req, res) => {
    const resetToken = req.body.token; 
    // const newPassword = req.body.password;
    if(passtoken===resetToken){
        let data=await Product.updateOne(
            req.params,
            {
                $set:req.body
            }
         );
    
        // For this example, we simply send a success message
        res.send(`Password reset successfully ${data}`);
    }
    else{
        res.send('invalid something.')
    }

   
});

//terms and condition api.
const termsAndConditionsText = `These are the terms and conditions of using our service. Please read them carefully before proceeding.`;

app.get('/terms-and-conditions', (req, res) => {
    res.send(termsAndConditionsText);
});

//privacy and policy.
const privacyPolicyText = `This is the privacy policy of our service. We are committed to protecting your privacy and ensuring the security of your information.`;

app.get('/privacy-policy', (req, res) => {
    res.send(privacyPolicyText);
});


app.listen(3000,()=>{
    console.log('server running!');
});