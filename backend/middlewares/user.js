const {Admin,User,FoodItem,Meal,HealthTip} = require('../models/db.js');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.jwt_secret;

const usermiddleware = (req, res, next) => {
    // const username=req.headers.username;
    // const password=req.headers.password;

    const authHeader=req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({error:"Unauthorized: No token provided"});
    }
    
    const token=authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({error:"Unauthorized: No token provided"});
    }
 
    try{
        const decoded=jwt.verify(token,JWT_SECRET);
        req.user=decoded;
        next();
    }catch(err){
        return res.status(401).json({error:"Unauthorized: Invalid token"});
    }

    // User.findOne({username:username}).then((user)=>{
    //     if(!user){
    //         return res.status(401).json({error:"Unauthorized: User not found"});
    //     }
    //     if(user.password !== password){
    //         return res.status(401).json({error:"Unauthorized: Incorrect password"});
    //     }
    //     next();
    // })
};

module.exports = usermiddleware;
