-- Fix the data type mismatch between Meals.id and MealIngredients.meal_id
-- First, remove the default value that generates UUIDs
ALTER TABLE "MealIngredients" 
ALTER COLUMN meal_id DROP DEFAULT;

-- Now change the data type to bigint
ALTER TABLE "MealIngredients" 
ALTER COLUMN meal_id TYPE bigint USING meal_id::text::bigint;

-- Add proper foreign key constraint
ALTER TABLE "MealIngredients" 
ADD CONSTRAINT fk_meal_ingredients_meal_id 
FOREIGN KEY (meal_id) REFERENCES "Meals"(id) ON DELETE CASCADE;