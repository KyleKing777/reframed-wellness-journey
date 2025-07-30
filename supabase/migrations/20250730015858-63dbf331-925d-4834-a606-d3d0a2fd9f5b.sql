-- Add RLS policies for DailyMacros table
CREATE POLICY "Users can view their own daily macros" 
ON "DailyMacros" 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily macros" 
ON "DailyMacros" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily macros" 
ON "DailyMacros" 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily macros" 
ON "DailyMacros" 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add RLS policies for WeightTracking table
CREATE POLICY "Users can view their own weight tracking" 
ON "WeightTracking" 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weight tracking" 
ON "WeightTracking" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight tracking" 
ON "WeightTracking" 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight tracking" 
ON "WeightTracking" 
FOR DELETE 
USING (auth.uid() = user_id);