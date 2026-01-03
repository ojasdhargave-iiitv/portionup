const {Admin,User,FoodItem,Meal,HealthTip} =  require('../models/db.js');

const adminmiddleware = (req, res, next) => {
    const username=req.headers.username;
    const password=req.headers.password;

    Admin.findOne({username:username}).then((admin)=>{
        if(!admin){
            return res.status(401).json({error:"Unauthorized: Admin not found"});
        }
        if(admin.password !== password){
            return res.status(401).json({error:"Unauthorized: Incorrect password"});
        }
        next();
    })
};

module.exports = adminmiddleware;
