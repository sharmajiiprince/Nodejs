const mongoose=require('mongoose');
const mystoreschema=new mongoose.Schema({
    id:Number,
    name: String,
    email:String,
    contact:Number,
    age:Number,
    city:String,
    otp:Number,
    password:String,
});
//module.exports=mongoose.model('mystores',mystoreschema);
module.exports=mongoose.model('users',mystoreschema);

