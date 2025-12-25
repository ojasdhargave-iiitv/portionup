const mongoose=require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("Connected to MongoDB");
});

const adminSchema=new mongoose.Schema({
    username:String,
    password:String
});
const userSchema=new mongoose.Schema({
    username:String,
    password:String,
    addedmeals:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"meal"
    }]
});
const mealSchema=new mongoose.Schema({});

const admin=mongoose.model("admin",adminSchema);
const user=mongoose.model("user",userSchema);
const meal=mongoose.model("meal",mealSchema);

module.exports={admin,user,meal};