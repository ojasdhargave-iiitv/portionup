const {Router}=require("express");
const adminmiddleware=require("../middlewares/admin");
const {adminsignuppost,adminmealpost,adminmealget}=require("../controllers/admincontroller");
const router=Router();

router.post("/signup",adminsignuppost);

router.post("/meals",adminmiddleware,adminmealpost);

router.get("/meals",adminmiddleware,adminmealget);

module.exports=router;