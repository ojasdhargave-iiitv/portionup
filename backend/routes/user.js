const {Router}=require("express");
const usermiddleware=require("../middlewares/user");
const upload = require("../config/multer");

const {userSignupPost,userLoginPost,uploadMealImage,getMealImage,analyzeMeal,addMealManual,getMealHistory,getDailySummary,getHealthTips}=require("../controllers/usercontroller");

const router=Router();

// auth
router.post("/signup", userSignupPost); //working
router.post("/login",userLoginPost); //working

// meal
router.post("/meal/upload", usermiddleware, upload.single('mealImage'), uploadMealImage); //inprogress
router.post("/meal/analyze", usermiddleware,analyzeMeal); //working
router.post("/meal/manual", usermiddleware,addMealManual); //working

// data
router.get("/meals", usermiddleware,getMealHistory);
router.get("/summary", usermiddleware,getDailySummary);
router.get("/tips", usermiddleware,getHealthTips);


module.exports=router;  