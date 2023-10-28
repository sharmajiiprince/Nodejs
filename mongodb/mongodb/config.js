const mongoose=require('mongoose');
//mongoose.connect("mongodb://127.0.0.1:27017/mydb");
mongoose.connect('mongodb+srv://princeraj:princeraj@cluster0.ubqgau4.mongodb.net/?retryWrites=true&w=majority').then(()=>{
    console.log('db connect !')
}).catch((err)=>{
    console.log(err);
})