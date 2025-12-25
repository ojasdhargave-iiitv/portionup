const {User} = require('../models/db.js');

const usermiddleware = (req, res, next) => {
    const username=req.headers.username;
    const password=req.headers.password;

    User.findOne({username:username}).then((user)=>{
        if(!user){
            return res.status(401).json({error:"Unauthorized: User not found"});
        }
        if(user.password !== password){
            return res.status(401).json({error:"Unauthorized: Incorrect password"});
        }
        next();
    })
};

module.exports = usermiddleware;
