-- Add RLS policies for Meals table
ALTER TABLE "Meals" ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own meals
CREATE POLICY "Users can view their own meals" 
ON "Meals" 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to create their own meals
CREATE POLICY "Users can create their own meals" 
ON "Meals" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own meals
CREATE POLICY "Users can update their own meals" 
ON "Meals" 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own meals
CREATE POLICY "Users can delete their own meals" 
ON "Meals" 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add RLS policies for MealIngredients table
ALTER TABLE "MealIngredients" ENABLE ROW LEVEL SECURITY;

-- Allow users to manage meal ingredients for their own meals
CREATE POLICY "Users can view meal ingredients for their meals" 
ON "MealIngredients" 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "Meals" 
    WHERE "Meals".id = "MealIngredients".meal_id::bigint 
    AND "Meals".user_id = auth.uid()
  )
);

CREATE POLICY "Users can create meal ingredients for their meals" 
ON "MealIngredients" 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Meals" 
    WHERE "Meals".id = "MealIngredients".meal_id::bigint 
    AND "Meals".user_id = auth.uid()
  )
);

CREATE POLICY "Users can update meal ingredients for their meals" 
ON "MealIngredients" 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "Meals" 
    WHERE "Meals".id = "MealIngredients".meal_id::bigint 
    AND "Meals".user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete meal ingredients for their meals" 
ON "MealIngredients" 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "Meals" 
    WHERE "Meals".id = "MealIngredients".meal_id::bigint 
    AND "Meals".user_id = auth.uid()
  )
);