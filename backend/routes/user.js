const {Router}=require("express");
const usermiddleware=require("../middlewares/user");
const {usersignuppost,usermealpost,usermealget}=require("../controllers/usercontroller");
const router=Router();

router.post("/signup",usersignuppost);

router.post("/meals",usermiddleware,usermealpost);

router.get("/meals",usermiddleware,usermealget);

module.exports=router;