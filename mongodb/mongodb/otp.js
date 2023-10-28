const mongoose=require('mongoose');
const mystoreschema=new mongoose.Schema({
    token:String,
    otp:Number
 });
 module.exports=mongoose.model('myotps',mystoreschema);