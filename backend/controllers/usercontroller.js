//auth
const userSignupPost = async (req, res) => {
  try {
    // TODO:
    // 1. validate input
    // 2. hash password
    // 3. save user
    // 4. return JWT
    res.status(201).json({
      message: "User signup successful"
    });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
};

const userLoginPost = async (req, res) => {
  try {
    // TODO:
    // 1. find user
    // 2. compare password
    // 3. generate JWT
    res.status(200).json({
      message: "User login successful"
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};


//meal flow

const uploadMealImage = async (req, res) => {
  try {
    // req.file will come from multer
    res.status(200).json({
      message: "Meal image uploaded",
      imageUrl: "image_url_here"
    });
  } catch (err) {
    res.status(500).json({ error: "Image upload failed" });
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
    res.status(200).json({
      meals: []
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch meal history" });
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
  analyzeMeal,
  addMealManual,
  getMealHistory,
  getDailySummary,
  getHealthTips
};
