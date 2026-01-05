const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });
const { FoodItem } = require("../models/db");

const foodData = [
  {
    name: "Idli",
    units: [
      { label: "1 idli", quantity_ml: 50, calories: 58, protein: 2, carbs: 12, fat: 0.4 }
    ]
  },
  {
    name: "Dosa",
    units: [
      { label: "1 dosa", quantity_ml: 120, calories: 168, protein: 4, carbs: 30, fat: 3 }
    ]
  },
  {
    name: "Aloo Paratha",
    units: [
      { label: "1 paratha", quantity_ml: 120, calories: 290, protein: 6, carbs: 36, fat: 12 }
    ]
  },
  {
    name: "Poha",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 180, protein: 4, carbs: 30, fat: 5 }
    ]
  },
  {
    name: "Upma",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 190, protein: 5, carbs: 28, fat: 6 }
    ]
  },
  {
    name: "Plain Rice",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 200, protein: 4, carbs: 44, fat: 0.5 }
    ]
  },
  {
    name: "Dal Tadka",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 180, protein: 9, carbs: 20, fat: 6 }
    ]
  },
  {
    name: "Rajma",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 210, protein: 13, carbs: 30, fat: 4 }
    ]
  },
  {
    name: "Chole",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 220, protein: 12, carbs: 32, fat: 5 }
    ]
  },
  {
    name: "Chapati",
    units: [
      { label: "1 chapati", quantity_ml: 40, calories: 120, protein: 3, carbs: 18, fat: 3 }
    ]
  },
  {
    name: "Paneer Butter Masala",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 330, protein: 10, carbs: 12, fat: 26 }
    ]
  },
  {
    name: "Paneer Bhurji",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 280, protein: 14, carbs: 10, fat: 20 }
    ]
  },
  {
    name: "Khichdi",
    units: [
      { label: "1 bowl", quantity_ml: 180, calories: 230, protein: 8, carbs: 35, fat: 5 }
    ]
  },
  {
    name: "Curd",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 90, protein: 5, carbs: 6, fat: 4 }
    ]
  },
  {
    name: "Curd Rice",
    units: [
      { label: "1 bowl", quantity_ml: 180, calories: 240, protein: 6, carbs: 38, fat: 6 }
    ]
  },
  {
    name: "Vegetable Pulao",
    units: [
      { label: "1 bowl", quantity_ml: 180, calories: 260, protein: 6, carbs: 42, fat: 7 }
    ]
  },
  {
    name: "Sambar",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 120, protein: 6, carbs: 14, fat: 3 }
    ]
  },
  {
    name: "Rasam",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 60, protein: 2, carbs: 8, fat: 1 }
    ]
  },
  {
    name: "Aloo Sabzi",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 190, protein: 4, carbs: 28, fat: 7 }
    ]
  },
  {
    name: "Bhindi Fry",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 180, protein: 3, carbs: 14, fat: 12 }
    ]
  },
  {
    name: "Samosa",
    units: [
      { label: "1 samosa", quantity_ml: 100, calories: 260, protein: 5, carbs: 32, fat: 13 }
    ]
  },
  {
    name: "Pakora",
    units: [
      { label: "1 plate", quantity_ml: 100, calories: 280, protein: 6, carbs: 20, fat: 18 }
    ]
  },
  {
    name: "Bread Pakora",
    units: [
      { label: "1 piece", quantity_ml: 120, calories: 300, protein: 7, carbs: 34, fat: 16 }
    ]
  },
  {
    name: "Maggi",
    units: [
      { label: "1 pack cooked", quantity_ml: 200, calories: 350, protein: 8, carbs: 45, fat: 14 }
    ]
  },
  {
    name: "Bhel Puri",
    units: [
      { label: "1 plate", quantity_ml: 120, calories: 180, protein: 5, carbs: 30, fat: 4 }
    ]
  },
  {
    name: "Sprouts Chaat",
    units: [
      { label: "1 bowl", quantity_ml: 120, calories: 140, protein: 9, carbs: 18, fat: 3 }
    ]
  },
  {
    name: "Tea",
    units: [
      { label: "1 cup", quantity_ml: 150, calories: 70, protein: 2, carbs: 10, fat: 3 }
    ]
  },
  {
    name: "Coffee",
    units: [
      { label: "1 cup", quantity_ml: 150, calories: 80, protein: 2, carbs: 12, fat: 3 }
    ]
  },
  {
    name: "Buttermilk",
    units: [
      { label: "1 glass", quantity_ml: 250, calories: 60, protein: 3, carbs: 5, fat: 2 }
    ]
  },
  {
    name: "Milk",
    units: [
      { label: "1 glass", quantity_ml: 250, calories: 150, protein: 8, carbs: 12, fat: 8 }
    ]
  },
  {
    name: "Lemon Rice",
    units: [
      { label: "1 bowl", quantity_ml: 180, calories: 250, protein: 5, carbs: 40, fat: 7 }
    ]
  },
  {
    name: "Tamarind Rice",
    units: [
      { label: "1 bowl", quantity_ml: 180, calories: 270, protein: 5, carbs: 42, fat: 8 }
    ]
  },
  {
    name: "Vegetable Curry",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 160, protein: 4, carbs: 18, fat: 8 }
    ]
  },
  {
    name: "Cabbage Sabzi",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 110, protein: 3, carbs: 12, fat: 5 }
    ]
  },
  {
    name: "Carrot Sabzi",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 120, protein: 2, carbs: 14, fat: 6 }
    ]
  },
  {
    name: "Beans Sabzi",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 130, protein: 3, carbs: 15, fat: 6 }
    ]
  },
  {
    name: "Palak Sabzi",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 100, protein: 4, carbs: 8, fat: 5 }
    ]
  },
  {
    name: "Lauki Sabzi",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 90, protein: 2, carbs: 10, fat: 4 }
    ]
  },
  {
    name: "Tinda Sabzi",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 95, protein: 2, carbs: 11, fat: 4 }
    ]
  },
  {
    name: "Mix Veg",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 150, protein: 4, carbs: 18, fat: 7 }
    ]
  },
  {
    name: "Medu Vada",
    units: [
      { label: "1 vada", quantity_ml: 60, calories: 140, protein: 4, carbs: 14, fat: 7 }
    ]
  },
  {
    name: "Uttapam",
    units: [
      { label: "1 uttapam", quantity_ml: 120, calories: 190, protein: 5, carbs: 30, fat: 4 }
    ]
  },
  {
    name: "Pongal",
    units: [
      { label: "1 bowl", quantity_ml: 180, calories: 260, protein: 7, carbs: 38, fat: 8 }
    ]
  },
  {
    name: "Appam",
    units: [
      { label: "1 appam", quantity_ml: 80, calories: 120, protein: 2, carbs: 24, fat: 2 }
    ]
  },
  {
    name: "Coconut Chutney",
    units: [
      { label: "2 tbsp", quantity_ml: 40, calories: 90, protein: 1, carbs: 4, fat: 8 }
    ]
  },
  {
    name: "Tomato Chutney",
    units: [
      { label: "2 tbsp", quantity_ml: 40, calories: 30, protein: 1, carbs: 5, fat: 1 }
    ]
  },
  {
    name: "Dal Khichdi",
    units: [
      { label: "1 bowl", quantity_ml: 180, calories: 220, protein: 9, carbs: 32, fat: 4 }
    ]
  },
  {
    name: "Plain Dal",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 150, protein: 8, carbs: 18, fat: 3 }
    ]
  },
  {
    name: "Ghee Rice",
    units: [
      { label: "1 bowl", quantity_ml: 180, calories: 290, protein: 5, carbs: 40, fat: 10 }
    ]
  },
  {
    name: "Egg Curry",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 240, protein: 12, carbs: 8, fat: 18 }
    ]
  },
  {
    name: "Boiled Egg",
    units: [
      { label: "1 egg", quantity_ml: 50, calories: 78, protein: 6, carbs: 1, fat: 5 }
    ]
  },
  {
    name: "Omelette",
    units: [
      { label: "1 omelette", quantity_ml: 80, calories: 150, protein: 8, carbs: 2, fat: 12 }
    ]
  },
  {
    name: "Lassi",
    units: [
      { label: "1 glass", quantity_ml: 250, calories: 180, protein: 8, carbs: 20, fat: 6 }
    ]
  },
  {
    name: "Chaas",
    units: [
      { label: "1 glass", quantity_ml: 250, calories: 60, protein: 3, carbs: 5, fat: 2 }
    ]
  },
  {
    name: "Fruit Salad",
    units: [
      { label: "1 bowl", quantity_ml: 150, calories: 120, protein: 2, carbs: 28, fat: 1 }
    ]
  },
  {
    name: "Banana",
    units: [
      { label: "1 medium", quantity_ml: 120, calories: 105, protein: 1, carbs: 27, fat: 0.4 }
    ]
  }
];

async function seedFoodItems() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!");

    // Clear existing food items (optional - comment out if you want to keep existing data)
    const deleteResult = await FoodItem.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing food items`);

    // Insert new food items
    const result = await FoodItem.insertMany(foodData);
    console.log(`✅ Successfully seeded ${result.length} food items!`);

    // Display some sample items
    console.log("\nSample food items:");
    result.slice(0, 5).forEach(item => {
      console.log(`  - ${item.name}: ${item.units[0].calories} cal per ${item.units[0].label}`);
    });

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding food items:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedFoodItems();
