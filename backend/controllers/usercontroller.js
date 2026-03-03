const bcrypt=require('bcrypt');
const { User, Meal, FoodItem } = require('../models/db');
const FormData = require('form-data');
const axios = require('axios');
const mongoose = require('mongoose');

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

    res.status(201).json({
      message: "User signup successful"
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

    const token=jwt.sign({userId:existinguser._id,username:existinguser.username},JWT_SECRET,{expiresIn:'30d'});
    
    res.status(200).json({
      message: "User login successful",
      token
    });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};









//meal flow
const uploadMealImage = async (req,res) => {
  try {
    console.log('=== Upload Request Received ===');
    console.log('File:', req.file ? 'Present' : 'Missing');
    console.log('Body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    console.log('File details:', {
      size: req.file.size,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname
    });

    // Send image to Python API for food detection
    console.log('Sending to Python API at http://127.0.0.1:8000/detect');
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    console.log('Calling Python API with timeout of 30 seconds...');
    const detectionResponse = await axios.post('http://127.0.0.1:8000/detect', formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 10000, // 30 second timeout
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('Detection response:', detectionResponse.data);
    const detectedFoods = detectionResponse.data.detected_food_counts;

    // Check if any food was detected
    if (!detectedFoods || Object.keys(detectedFoods).length === 0) {
      console.log('No food detected, skipping MongoDB save');
      return res.status(200).json({
        message: "No food detected in the image",
        detectedFoods: {},
        size: req.file.size
      });
    }

    // Convert detected foods to items array for analysis
    const itemsForAnalysis = Object.entries(detectedFoods).map(([name, count]) => ({
      name: name,
      count: count
    }));

    console.log('Items for analysis:', itemsForAnalysis);

    // Analyze meal to get nutrition data
    let mealItems = [];
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    
    try {
      const analysisResult = await analyzeMeal(itemsForAnalysis);
      mealItems = analysisResult.mealItems;
      totals = analysisResult.totals;
      console.log('Analysis complete - Totals:', totals);
    } catch (analysisErr) {
      console.warn('Analysis failed, returning detected data only:', analysisErr.message);
      // Continue without nutrition data if analysis fails
    }

    // Get mealType from request body or default to 'snack'
    const mealType = req.body.mealType || 'snack';

    // Return detection results WITHOUT saving to database
    // User will confirm and save from the meals page
    console.log('Detection complete - returning data without saving to DB');
    res.status(200).json({
      message: "Food detected successfully",
      detectedFoods: detectedFoods,
      totals: totals,
      mealType: mealType,
      size: req.file.size
    });
  } catch (err) {
    console.error('=== Upload Error ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.response) {
      console.error('Python API Response:', err.response.data);
      console.error('Python API Status:', err.response.status);
    }
    console.error('Full error:', err);
    
    res.status(500).json({ 
      error: "Image upload or detection failed",
      details: err.message,
      pythonError: err.response?.data
    });
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

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Items array is required");
  }

  // Search for all food items by name
  const foodNames = items.map(item => item.name);
  console.log('Searching for food items:', foodNames);
  
  const foundFoods = await FoodItem.find({ name: { $in: foodNames }, isActive: true });
  console.log(`Found ${foundFoods.length} food items in database`);

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

    console.log(`Processing food: ${food.name}`);
    console.log(`Food units:`, JSON.stringify(food.units));

    // Check if units array exists and has data
    if (!food.units || food.units.length === 0) {
      console.warn(`Warning: Food item "${food.name}" has no units defined, skipping nutrition calculation`);
      continue;
    }

    const count = item.count || 1;
    const unit = food.units[0]; // Use first unit as default

    console.log(`Unit data:`, {
      label: unit.label,
      calories: unit.calories,
      protein: unit.protein,
      carbs: unit.carbs,
      fat: unit.fat,
      count: count
    });

    mealItems.push({
      foodId: food._id,
      count: count
    });

    // Calculate nutrition for this item (with null/undefined checks)
    const calories = (unit.calories || 0) * count;
    const protein = (unit.protein || 0) * count;
    const carbs = (unit.carbs || 0) * count;
    const fat = (unit.fat || 0) * count;
    const fiber = (unit.fiber || 0) * count;

    console.log(`Adding to totals - Calories: ${calories}, Protein: ${protein}, Carbs: ${carbs}, Fat: ${fat}`);

    totals.calories += calories;
    totals.protein += protein;
    totals.carbs += carbs;
    totals.fat += fat;
    totals.fiber += fiber;
  }

  console.log('Final totals before rounding:', totals);

  // Round totals to 1 decimal place
  totals.calories = Math.round(totals.calories * 10) / 10;
  totals.protein = Math.round(totals.protein * 10) / 10;
  totals.carbs = Math.round(totals.carbs * 10) / 10;
  totals.fat = Math.round(totals.fat * 10) / 10;
  totals.fiber = Math.round(totals.fiber * 10) / 10;

  console.log('Final totals after rounding:', totals);

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
      .populate('items.foodId', 'name units')
      .sort({ mealTime: -1 })
      .limit(50);
    
    const formattedMeals = meals.map(meal => ({
      _id: meal._id,
      mealTime: meal.mealTime,
      mealType: meal.mealType,
      totals: meal.totals,
      items: meal.items.map(item => ({
        name: item.foodId?.name || 'Unknown',
        count: item.count,
        unit: item.foodId?.units?.[0]?.label || 'serving'
      })),
      imageUrl: meal.image ? `/user/meal/image/${meal._id}` : null,
      hasImage: !!meal.image
    }));

    res.status(200).json({
      meals: formattedMeals
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch meal history" });
    console.log(err);
  }
};

const getDailySummary = async (req, res) => {
  try {
    // Get optional date query param, default to today
    const dateParam = req.query.date;
    let targetDate;
    if (dateParam) {
      targetDate = new Date(dateParam);
    } else {
      targetDate = new Date();
    }

    // Start and end of the target day (UTC-friendly)
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const meals = await Meal.find({
      userId: req.user.userId,
      mealTime: { $gte: startOfDay, $lte: endOfDay }
    });

    let calories = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
    for (const meal of meals) {
      calories += meal.totals?.calories || 0;
      protein += meal.totals?.protein || 0;
      carbs += meal.totals?.carbs || 0;
      fat += meal.totals?.fat || 0;
      fiber += meal.totals?.fiber || 0;
    }

    res.status(200).json({
      calories: Math.round(calories * 10) / 10,
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      fiber: Math.round(fiber * 10) / 10,
      mealCount: meals.length
    });
  } catch (err) {
    console.error('Daily summary error:', err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};

const getNutritionPreview = async (req, res) => {
  try {
    const { items } = req.body;
    // items: [{name: "Idli", count: 2}, ...]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(200).json({
        calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0
      });
    }

    const { totals } = await analyzeMeal(items);
    res.status(200).json(totals);
  } catch (err) {
    console.error('Nutrition preview error:', err);
    res.status(200).json({
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0
    });
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

const getRandomFoodItems = async (req, res) => {
  try {
    const randomFoods = await FoodItem.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 5 } },
      { $project: {
        _id: 1,
        name: 1,
        'units.calories': 1,
        'units.protein': 1,
        'units.carbs': 1,
        'units.fat': 1
      }}
    ]);

    // Format the response to match frontend interface
    const formattedFoods = randomFoods.map(food => ({
      id: food._id.toString(),
      name: food.name,
      calories: food.units[0]?.calories || 0,
      protein: food.units[0]?.protein || 0,
      carbs: food.units[0]?.carbs || 0,
      fat: food.units[0]?.fat || 0
    }));

    res.status(200).json({
      foods: formattedFoods
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch food items" });
  }
};


const deleteMeal = async (req, res) => {
  try {
    const { mealId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(mealId)) {
      return res.status(400).json({ error: "Invalid meal ID" });
    }

    const meal = await Meal.findOneAndDelete({
      _id: mealId,
      userId: req.user.userId
    });

    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    res.status(200).json({ message: "Meal deleted successfully" });
  } catch (err) {
    console.error('Delete meal error:', err);
    res.status(500).json({ error: "Failed to delete meal" });
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
  getHealthTips,
  getRandomFoodItems,
  deleteMeal,
  getNutritionPreview
};
