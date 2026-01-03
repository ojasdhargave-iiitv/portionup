const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));


//admin
const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "admin"
    }
  },
  { timestamps: true }
);


//user
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "user"
    },
    meals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meal"
      }
    ]
  },
  { timestamps: true }
);


//food
const fooditemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    units: [
      {
        label: String,              // small bowl / medium bowl
        quantity_ml: Number,        // 200 / 300 / 400
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);


//meal
const mealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FoodItem"
        },
        unit: String,          // medium bowl
        count: Number          // 1.2
      }
    ],

    image: {
      data: Buffer,           // Store image as binary data
      contentType: String     // image/jpeg, image/png, etc.
    },

    totals: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number
    },

    mealTime: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);


//health
const healthTipSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    category: String,
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);


//models
const Admin = mongoose.model("Admin", adminSchema);
const User = mongoose.model("User", userSchema);
const FoodItem = mongoose.model("FoodItem", fooditemSchema);
const Meal = mongoose.model("Meal", mealSchema);
const HealthTip = mongoose.model("HealthTip", healthTipSchema);


module.exports = {Admin,User,FoodItem,Meal,HealthTip};
