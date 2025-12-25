const {Router}=require("express");
const usermiddleware=require("../middlewares/user");

const {userSignupPost,userLoginPost,uploadMealImage,analyzeMeal,addMealManual,getMealHistory,getDailySummary,getHealthTips}=require("../controllers/usercontroller");

const router=Router();

// auth
router.post("/signup", userSignupPost);
router.post("/login",userLoginPost);

// meal
router.post("/meal/upload", usermiddleware,uploadMealImage);
router.post("/meal/analyze", usermiddleware,analyzeMeal);
router.post("/meal/manual", usermiddleware,addMealManual);

// data
router.get("/meals", usermiddleware,getMealHistory);
router.get("/summary", usermiddleware,getDailySummary);
router.get("/tips", usermiddleware,getHealthTips);


module.exports=router;