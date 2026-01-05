const bcrypt=require('bcrypt');
const { User, Meal, FoodItem } = require('../models/db');
const FormData = require('form-data');
const axios = require('axios');

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

    const token=jwt.sign({userId:user._id,username:user.username},JWT_SECRET,{expiresIn:'24d'},{noTimestamp:true});
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

    // Send image to Python API for food detection
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const detectionResponse = await axios.post('http://127.0.0.1:8000/detect', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    const detectedFoods = detectionResponse.data.detected_food_counts;

    // Get mealType from request body or default to 'other'
    const mealType = req.body.mealType || 'snack';

    // Create meal record with image and detection results in MongoDB
    const meal = await Meal.create({
      userId: req.user.userId,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      },
      detectedFoods: detectedFoods,
      mealType: mealType,
      mealTime: new Date()
    });
    
    res.status(200).json({
      message: "Meal image uploaded and analyzed successfully",
      mealId: meal._id,
      imageUrl: `/user/meal/image/${meal._id}`,
      detectedFoods: detectedFoods,
      size: req.file.size
    });
  } catch (err) {
    res.status(500).json({ error: "Image upload or detection failed" });
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
const analyzeMeal = async (items) => {
  // items: [{name: "Idli", count: 2}, {name: "Sambar", count: 1}]
  // Returns: { mealItems: [...], totals: {...} }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Items array is required");
  }

  // Search for all food items by name
  const foodNames = items.map(item => item.name);
  const foundFoods = await FoodItem.find({ name: { $in: foodNames }, isActive: true });

  if (foundFoods.length === 0) {
    throw new Error("No matching food items found");
  }

  // Build meal items and calculate totals
  const mealItems = [];
  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

  for (const item of items) {
    const food = foundFoods.find(f => f.name === item.name);
    
    if (!food) {
      console.log(`Food not found: ${item.name}`);
      continue;
    }

    const count = item.count || 1;
    const unit = food.units[0]; // Use first unit as default

    mealItems.push({
      foodId: food._id,
      count: count
    });

    // Calculate nutrition for this item
    totals.calories += unit.calories * count;
    totals.protein += unit.protein * count;
    totals.carbs += unit.carbs * count;
    totals.fat += unit.fat * count;
    totals.fiber += (unit.fiber || 0) * count;
  }

  // Round totals to 1 decimal place
  totals.calories = Math.round(totals.calories * 10) / 10;
  totals.protein = Math.round(totals.protein * 10) / 10;
  totals.carbs = Math.round(totals.carbs * 10) / 10;
  totals.fat = Math.round(totals.fat * 10) / 10;
  totals.fiber = Math.round(totals.fiber * 10) / 10;

  return { mealItems, totals };
};







const addMealManual = async (req, res) => {
  try {
    const { items, mealType } = req.body;
    // items: [{name: "Idli", count: 2}, {name: "Sambar", count: 1}]
    // mealType: "breakfast" | "lunch" | "dinner" | "snack"

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items array is required" });
    }

    if (!mealType || !["breakfast", "lunch", "dinner", "snack"].includes(mealType)) {
      return res.status(400).json({ error: "Valid mealType is required (breakfast/lunch/dinner/snack)" });
    }

    // Analyze meal using helper function
    const { mealItems, totals } = await analyzeMeal(items);

    // Create meal
    const meal = await Meal.create({
      userId: req.user.userId,
      items: mealItems,
      totals: totals,
      mealType: mealType,
      mealTime: new Date()
    });

    // Populate food details for response
    const populatedMeal = await Meal.findById(meal._id).populate('items.foodId', 'name units');

    res.status(201).json({
      message: "Meal added successfully",
      meal: {
        _id: populatedMeal._id,
        items: populatedMeal.items.map(item => ({
          name: item.foodId.name,
          count: item.count,
          unit: item.foodId.units[0].label
        })),
        totals: populatedMeal.totals,
        mealType: populatedMeal.mealType,
        mealTime: populatedMeal.mealTime
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Manual meal add failed" });
    console.log(err);
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
