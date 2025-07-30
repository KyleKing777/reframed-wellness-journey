-- Fix the data type mismatch by temporarily dropping policies
-- Drop existing RLS policies that reference meal_id
DROP POLICY IF EXISTS "Users can view meal ingredients for their meals" ON "MealIngredients";
DROP POLICY IF EXISTS "Users can create meal ingredients for their meals" ON "MealIngredients";
DROP POLICY IF EXISTS "Users can update meal ingredients for their meals" ON "MealIngredients";
DROP POLICY IF EXISTS "Users can delete meal ingredients for their meals" ON "MealIngredients";

-- Remove the default value that generates UUIDs
ALTER TABLE "MealIngredients" 
ALTER COLUMN meal_id DROP DEFAULT;

-- Change the data type to bigint
ALTER TABLE "MealIngredients" 
ALTER COLUMN meal_id TYPE bigint USING meal_id::text::bigint;

-- Add proper foreign key constraint
ALTER TABLE "MealIngredients" 
ADD CONSTRAINT fk_meal_ingredients_meal_id 
FOREIGN KEY (meal_id) REFERENCES "Meals"(id) ON DELETE CASCADE;

-- Recreate RLS policies with correct data type
CREATE POLICY "Users can view meal ingredients for their meals" 
ON "MealIngredients" 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM "Meals" 
  WHERE "Meals".id = "MealIngredients".meal_id 
  AND "Meals".user_id = auth.uid()
));

CREATE POLICY "Users can create meal ingredients for their meals" 
ON "MealIngredients" 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM "Meals" 
  WHERE "Meals".id = "MealIngredients".meal_id 
  AND "Meals".user_id = auth.uid()
));

CREATE POLICY "Users can update meal ingredients for their meals" 
ON "MealIngredients" 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM "Meals" 
  WHERE "Meals".id = "MealIngredients".meal_id 
  AND "Meals".user_id = auth.uid()
));

CREATE POLICY "Users can delete meal ingredients for their meals" 
ON "MealIngredients" 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM "Meals" 
  WHERE "Meals".id = "MealIngredients".meal_id 
  AND "Meals".user_id = auth.uid()
));