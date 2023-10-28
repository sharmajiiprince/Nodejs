const mongoose=require('mongoose');
//mongoose.connect("mongodb://127.0.0.1:27017/mydb");
mongoose.connect('mongodb+srv://princesh1411:princeraj@cluster0.k7gz7do.mongodb.net/?retryWrites=true&w=majority').then(()=>{
    console.log('db connect !')
}).catch((err)=>{
    console.log(err);
})