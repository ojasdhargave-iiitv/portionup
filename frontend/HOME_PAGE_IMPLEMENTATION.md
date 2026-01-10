# PortionUp - Home Page Implementation

## Overview
The home page has been successfully implemented with all components matching the reference design, featuring a functional calendar, nutrition tracking cards, and a reusable bottom navigation bar.

## Components Created

### 1. **Calendar Component** (`components/calendar.tsx`)
- Interactive monthly calendar with date selection
- Supports month navigation (previous/next)
- Highlights selected date in red
- Fully functional with real date calculations

### 2. **Bottom Navbar Component** (`components/bottom-navbar.tsx`)
- Reusable navigation component for all pages
- Icons: Home, Food, Camera, Activity, Settings
- Active tab highlighting
- Can be imported and used in any page

### 3. **Calories Card Component** (`components/calories-card.tsx`)
- Two variants: "Calories Left" and "Calories Burnt"
- Circular progress indicator for calories left
- Dynamic color scheme
- Circular SVG-based progress visualization

### 4. **Nutrition Card Component** (`components/nutrition-card.tsx`)
- Displays nutrition metrics (Protein, Carbs, Fats, Fibres)
- Customizable colors for each metric
- Shows values and units
- Responsive 2-column grid layout

## Dynamic State Management

All values are managed using React `useState` hooks in the home page:

```typescript
const [caloriesLeft, setCaloriesLeft] = useState(1352);
const [caloriesRequired, setCaloriesRequired] = useState(2050);
const [caloriesBurnt, setCaloriesBurnt] = useState(502);
const [protein, setProtein] = useState(80);
const [carbs, setCarbs] = useState(223);
const [fats, setFats] = useState(121);
const [fibres, setFibres] = useState(164);
const [selectedDate, setSelectedDate] = useState(new Date());
const [activeTab, setActiveTab] = useState('home');
```

### Updating Values
You can update any value programmatically:

```typescript
// Example: Update protein value
setProtein(100);

// Example: Update calories left
setCaloriesLeft(1500);

// Example: Update based on user input or API data
const updateNutritionData = (newData) => {
  setProtein(newData.protein);
  setCarbs(newData.carbs);
  setFats(newData.fats);
  setFibres(newData.fibres);
};
```

## Color Scheme

The UI matches the reference design with these colors:
- **Calories Left Card**: `#F4D03F` (Yellow)
- **Protein Card**: `#E8B4F5` (Light Purple/Pink)
- **Carbs Card**: `#A8D5A1` (Green)
- **Fats Card**: `#F5A6A6` (Red/Coral)
- **Fibres Card**: `#A6C8E8` (Blue)
- **Calories Burnt Card**: `#FFAB73` (Orange)
- **Bottom Navbar**: `#000` (Black)
- **Background**: `#F5F5F5` (Light Gray)

## File Structure

```
frontend/
├── app/
│   └── (tabs)/
│       └── index.tsx          # Home page with dynamic state
├── components/
│   ├── bottom-navbar.tsx      # Reusable navigation bar
│   ├── calendar.tsx           # Interactive calendar
│   ├── calories-card.tsx      # Calories display with progress
│   └── nutrition-card.tsx     # Nutrition metric cards
```

## Running the App

```bash
cd frontend
npm install
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser

## Features Implemented

✅ Functional calendar with date selection
✅ Dynamic state management with useState
✅ Reusable bottom navbar component
✅ All nutrition cards with correct colors
✅ Circular progress indicator for calories
✅ Responsive layout
✅ Professional UI matching reference design
✅ Header with profile icon and notification bell

## Future Enhancements

You can extend this implementation by:
1. Connecting to a backend API to fetch real data
2. Adding data persistence with AsyncStorage
3. Implementing date-based data filtering
4. Adding animations for value changes
5. Creating detail pages for each nutrition metric
6. Implementing the other tab pages (Food, Camera, Activity, Settings)
