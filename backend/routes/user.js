const {Router}=require("express");
const usermiddleware=require("../middlewares/user");
const upload = require("../config/multer");

const {userSignupPost,userLoginPost,uploadMealImage,getMealImage,analyzeMeal,addMealManual,getMealHistory,getDailySummary,getHealthTips}=require("../controllers/usercontroller");

const router=Router();

// auth
router.post("/signup", userSignupPost);
router.post("/login",userLoginPost);

// meal
router.post("/meal/upload", usermiddleware, upload.single('mealImage'), uploadMealImage);
router.post("/meal/analyze", usermiddleware,analyzeMeal);
router.post("/meal/manual", usermiddleware,addMealManual);

// data
router.get("/meals", usermiddleware,getMealHistory);
router.get("/summary", usermiddleware,getDailySummary);
router.get("/tips", usermiddleware,getHealthTips);


module.exports=router;  