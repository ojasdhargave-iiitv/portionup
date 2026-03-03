const {Router}=require("express");
const usermiddleware=require("../middlewares/user");
const upload = require("../config/multer");

const {userSignupPost,userLoginPost,uploadMealImage,getMealImage,analyzeMeal,addMealManual,getMealHistory,deleteMeal,getDailySummary,getHealthTips,getRandomFoodItems,getAllFoodItems,getNutritionPreview,updateProfile,getProfilePic}=require("../controllers/usercontroller");

const router=Router();

// auth
router.post("/signup", userSignupPost); //working
router.post("/login",userLoginPost); //working
router.get("/auth/verify", usermiddleware, (req, res) => {
  // If middleware passes, user is authenticated
  res.status(200).json({
    authorized: true,
    userId: req.user.userId,
    username: req.user.username
  });
});

// meal
router.post("/meal/upload", upload.single('mealImage'), uploadMealImage); //inprogress - TEMP: auth removed for testing
router.post("/meal/analyze", usermiddleware,analyzeMeal); //working
router.post("/meal/manual", usermiddleware,addMealManual); //working
router.post("/meal/preview", usermiddleware, getNutritionPreview); // nutrition preview for add-meal

router.delete("/meal/:mealId", usermiddleware, deleteMeal);

// data
router.get("/meals", usermiddleware,getMealHistory);
router.get("/summary", usermiddleware,getDailySummary);
router.get("/tips", usermiddleware,getHealthTips);
router.get("/foods/random", getRandomFoodItems); // Get random food items for search
router.get("/foods/all", getAllFoodItems); // Get all food items for search

// profile
router.put("/profile", usermiddleware, upload.single('profilePic'), updateProfile);
router.get("/profile/pic", getProfilePic); // auth via header or ?token= query param


module.exports=router;  