const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

// Create a separate mongoose instance for seeding
const seedDb = mongoose.createConnection();

// Define FoodItem schema for this connection
const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  units: [
    {
      label: { type: String, required: true },
      quantity_ml: { type: Number, required: true },
      calories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
      fiber: { type: Number, required: true }
    }
  ],
  isActive: { type: Boolean, default: true }
});

const FoodItem = seedDb.model("FoodItem", foodItemSchema);

const foodItemsData = [
  {
    name: "aloo gobhi",
    calories: 180,
    protein: 4,
    carbs: 22,
    fat: 8,
    fiber: 5
  },
  {
    name: "aloo sabji",
    calories: 190,
    protein: 4,
    carbs: 28,
    fat: 7,
    fiber: 4
  },
  {
    name: "bhakarwadi",
    calories: 320,
    protein: 6,
    carbs: 30,
    fat: 20,
    fiber: 3
  },
  {
    name: "bhakri",
    calories: 180,
    protein: 5,
    carbs: 32,
    fat: 3,
    fiber: 4
  },
  {
    name: "bhindi",
    calories: 150,
    protein: 3,
    carbs: 14,
    fat: 10,
    fiber: 5
  },
  {
    name: "chole",
    calories: 220,
    protein: 12,
    carbs: 32,
    fat: 5,
    fiber: 8
  },
  {
    name: "coconut chutney",
    calories: 90,
    protein: 1,
    carbs: 4,
    fat: 8,
    fiber: 2
  },
  {
    name: "daal",
    calories: 160,
    protein: 8,
    carbs: 20,
    fat: 4,
    fiber: 5
  },
  {
    name: "dosa",
    calories: 168,
    protein: 4,
    carbs: 30,
    fat: 3,
    fiber: 2
  },
  {
    name: "eggs",
    calories: 155,
    protein: 13,
    carbs: 1,
    fat: 11,
    fiber: 0
  },
  {
    name: "idli",
    calories: 58,
    protein: 2,
    carbs: 12,
    fat: 0.4,
    fiber: 1
  },
  {
    name: "khandvi",
    calories: 160,
    protein: 6,
    carbs: 18,
    fat: 6,
    fiber: 3
  },
  {
    name: "medu vada",
    calories: 140,
    protein: 4,
    carbs: 14,
    fat: 7,
    fiber: 2
  },
  {
    name: "omelette",
    calories: 150,
    protein: 8,
    carbs: 2,
    fat: 12,
    fiber: 0
  },
  {
    name: "paratha",
    calories: 260,
    protein: 6,
    carbs: 36,
    fat: 10,
    fiber: 4
  },
  {
    name: "poha",
    calories: 180,
    protein: 4,
    carbs: 30,
    fat: 5,
    fiber: 3
  },
  {
    name: "puri",
    calories: 120,
    protein: 3,
    carbs: 14,
    fat: 6,
    fiber: 1
  },
  {
    name: "rajma",
    calories: 210,
    protein: 13,
    carbs: 30,
    fat: 4,
    fiber: 8
  },
  {
    name: "rice",
    calories: 200,
    protein: 4,
    carbs: 44,
    fat: 0.5,
    fiber: 1
  },
  {
    name: "roti phulka",
    calories: 120,
    protein: 3,
    carbs: 18,
    fat: 3,
    fiber: 2
  },
  {
    name: "saag",
    calories: 140,
    protein: 5,
    carbs: 10,
    fat: 8,
    fiber: 4
  },
  {
    name: "salad",
    calories: 80,
    protein: 2,
    carbs: 12,
    fat: 2,
    fiber: 4
  },
  {
    name: "sambhar",
    calories: 120,
    protein: 6,
    carbs: 14,
    fat: 3,
    fiber: 4
  },
  {
    name: "thepla",
    calories: 210,
    protein: 6,
    carbs: 30,
    fat: 8,
    fiber: 4
  },
  {
    name: "upma",
    calories: 190,
    protein: 5,
    carbs: 28,
    fat: 6,
    fiber: 2
  },
  {
    name: "varan",
    calories: 150,
    protein: 7,
    carbs: 18,
    fat: 3,
    fiber: 4
  },
  {
    name: "veg-pulao",
    calories: 260,
    protein: 6,
    carbs: 42,
    fat: 7,
    fiber: 4
  },
  {
    name: "yellow dhokla",
    calories: 160,
    protein: 6,
    carbs: 20,
    fat: 5,
    fiber: 3
  },
  {
    name: "yogurt",
    calories: 90,
    protein: 5,
    carbs: 6,
    fat: 4,
    fiber: 0
  }
];

const seedFoodItems = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    await seedDb.openUri(MONGODB_URI);
    console.log('Connected successfully!');

    console.log('Clearing existing food items...');
    await FoodItem.deleteMany({});

    console.log('Adding food items...');
    
    const foodItemsToInsert = foodItemsData.map(item => ({
      name: item.name,
      units: [
        {
          label: "1 serving",
          quantity_ml: 250,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber
        }
      ],
      isActive: true
    }));

    const result = await FoodItem.insertMany(foodItemsToInsert);
    console.log(`✓ Successfully added ${result.length} food items!`);

    console.log('\n=== Food Items Added ===');
    result.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - ${item.units[0].calories} cal`);
    });

    await seedDb.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding food items:', err);
    process.exit(1);
  }
};

seedFoodItems();
