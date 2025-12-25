const {Router}=require("express");
const adminmiddleware=require("../middlewares/admin");

const {adminSignupPost,adminLoginPost,addFoodItem,updateFoodItem,getAllFoodItems,deleteFoodItem,addHealthTip,updateHealthTip,getHealthTips,deleteHealthTip,getSystemStats}=require("../controllers/admincontroller");

const router=Router();

// auth
router.post("/signup", adminSignupPost);
router.post("/login", adminLoginPost);

// food
router.post("/food", adminmiddleware,addFoodItem);
router.put("/food/:id", adminmiddleware,updateFoodItem);
router.get("/food", getAllFoodItems);
router.delete("/food/:id", adminmiddleware,deleteFoodItem);

// health tips
router.post("/tips", adminmiddleware,addHealthTip);
router.put("/tips/:id", adminmiddleware,updateHealthTip);
router.get("/tips", getHealthTips);
router.delete("/tips/:id", adminmiddleware,deleteHealthTip);

// system
router.get("/stats", getSystemStats);
module.exports=router;


//dont forgot to add those middleware of auth to check the authourisation