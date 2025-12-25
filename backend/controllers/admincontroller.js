//auth
const adminSignupPost = async (req, res) => {
  try {
    // TODO:
    // 1. create admin (manual / protected)
    // 2. hash password
    // 3. assign role = admin
    res.status(201).json({
      message: "Admin signup successful"
    });
  } catch (err) {
    res.status(500).json({ error: "Admin signup failed" });
  }
};

const adminLoginPost = async (req, res) => {
  try {
    // TODO:
    // validate admin credentials
    // generate JWT
    res.status(200).json({
      message: "Admin login successful"
    });
  } catch (err) {
    res.status(500).json({ error: "Admin login failed" });
  }
};



// add new food item
const addFoodItem = async (req, res) => {
  try {
    // name, units[], nutrition
    res.status(201).json({
      message: "Food item added successfully"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add food item" });
  }
};

// update existing food item
const updateFoodItem = async (req, res) => {
  try {
    // foodId
    // update units / nutrition
    res.status(200).json({
      message: "Food item updated successfully"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update food item" });
  }
};

// get all food items
const getAllFoodItems = async (req, res) => {
  try {
    res.status(200).json({
      foods: []
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch food items" });
  }
};

// disable / delete food item
const deleteFoodItem = async (req, res) => {
  try {
    // soft delete recommended
    res.status(200).json({
      message: "Food item removed"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove food item" });
  }
};



// add health tip / guide
const addHealthTip = async (req, res) => {
  try {
    // title, content, category
    res.status(201).json({
      message: "Health tip added"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add health tip" });
  }
};

// update health tip
const updateHealthTip = async (req, res) => {
  try {
    res.status(200).json({
      message: "Health tip updated"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update health tip" });
  }
};

// get all health tips
const getHealthTips = async (req, res) => {
  try {
    res.status(200).json({
      tips: []
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch health tips" });
  }
};

// delete health tip
const deleteHealthTip = async (req, res) => {
  try {
    res.status(200).json({
      message: "Health tip deleted"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete health tip" });
  }
};


// basic system stats
const getSystemStats = async (req, res) => {
  try {
    res.status(200).json({
      users: 0,
      mealsAnalyzed: 0,
      foodItems: 0
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};



module.exports = {
  adminSignupPost,
  adminLoginPost,

  addFoodItem,
  updateFoodItem,
  getAllFoodItems,
  deleteFoodItem,

  addHealthTip,
  updateHealthTip,
  getHealthTips,
  deleteHealthTip,

  getSystemStats
};
