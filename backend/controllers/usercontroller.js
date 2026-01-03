const bcrypt=require('bcrypt');
const { User, Meal } = require('../models/db');

const jwt=require('jsonwebtoken');
const JWT_SECRET=process.env.jwt_secret;




//auth
const userSignupPost = async (req, res) => {
  try {
    const {username,password}=req.body;

    const existinguser=await User.findOne({username:username});
    if(existinguser){
        return res.status(400).json({error:"Username already exists"});
    }

    const hashedpassword=await bcrypt.hash(password,6);

    const user=await User.create({
        username:username,
        password:hashedpassword
    });

    const token=jwt.sign({userId:user._id,username:user.username},JWT_SECRET,{expiresIn:'1d'},{noTimestamp:true});
    res.status(201).json({
      message: "User signup successful",
      token: token
    });
  
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
    console.log(err);
  }
};





const userLoginPost = async (req, res) => {
  try {
    const {username,password}=req.body;
    
    const existinguser=await User.findOne({username:username});
    if(!existinguser){
        return res.status(400).json({error:"User not found"});
    }

    const ismatched=await bcrypt.compare(password,existinguser.password);
    if(!ismatched){
        return res.status(401).json({error:"Invalid credentials"});
    }

    const token=jwt.sign({userId:existinguser._id,username:existinguser.username},JWT_SECRET,{expiresIn:'1h'});
    
    res.status(200).json({
      message: "User login successful",
      token
    });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};






//meal flow
const uploadMealImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Create meal record with image in MongoDB
    const meal = await Meal.create({
      userId: req.user.userId,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      },
      mealTime: new Date()
    });
    
    res.status(200).json({
      message: "Meal image uploaded successfully",
      mealId: meal._id,
      imageUrl: `/user/meal/image/${meal._id}`,
      size: req.file.size
    });
  } catch (err) {
    res.status(500).json({ error: "Image upload failed" });
    console.log(err);
  }
};





// Get meal image by ID (only if user owns it)
const getMealImage = async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.mealId, userId: req.user.userId });
    
    if (!meal || !meal.image || !meal.image.data) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.contentType(meal.image.contentType);
    res.send(meal.image.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch image" });
    console.log(err);
  }
};




// analyze meal (image -> portion -> nutrition)
const analyzeMeal = async (req, res) => {
  try {
    // FLOW:
    // 1. detect food items
    // 2. send to Gemini (portion estimation)
    // 3. calculate nutrition from DB
    // 4. save meal

    res.status(200).json({
      calories: 720,
      protein: 32,
      carbs: 110,
      fat: 18
    });
  } catch (err) {
    res.status(500).json({ error: "Meal analysis failed" });
  }
};

// manual meal entry
const addMealManual = async (req, res) => {
  try {
    // foodId, unit, count
    // calculate nutrition
    // save meal
    res.status(201).json({
      message: "Meal added manually"
    });
  } catch (err) {
    res.status(500).json({ error: "Manual meal add failed" });
  }
};





//data fetching
const getMealHistory = async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.user.userId })
      .select('-image.data') // Exclude image data for performance
      .sort({ mealTime: -1 })
      .limit(50);
    
    const mealsWithImageUrls = meals.map(meal => ({
      _id: meal._id,
      mealTime: meal.mealTime,
      totals: meal.totals,
      items: meal.items,
      imageUrl: meal.image ? `/user/meal/image/${meal._id}` : null,
      hasImage: !!meal.image
    }));

    res.status(200).json({
      meals: mealsWithImageUrls
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch meal history" });
    console.log(err);
  }
};

const getDailySummary = async (req, res) => {
  try {
    res.status(200).json({
      calories: 1800,
      protein: 95,
      carbs: 220,
      fat: 60
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};

const getHealthTips = async (req, res) => {
  try {
    res.status(200).json({
      tips: []
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tips" });
  }
};


module.exports = {
  userSignupPost,
  userLoginPost,
  uploadMealImage,
  getMealImage,
  analyzeMeal,
  addMealManual,
  getMealHistory,
  getDailySummary,
  getHealthTips
};
