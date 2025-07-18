-- Enable Row Level Security on all tables
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Meals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MealIngredients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DailyMacros" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WeightTracking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ChatbotLogs" ENABLE ROW LEVEL SECURITY;

-- Create policies for Users table
CREATE POLICY "Users can view their own profile" 
ON public."Users" 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" 
ON public."Users" 
FOR UPDATE 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" 
ON public."Users" 
FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);

-- Create policies for Meals table
CREATE POLICY "Users can view their own meals" 
ON public."Meals" 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meals" 
ON public."Meals" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals" 
ON public."Meals" 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals" 
ON public."Meals" 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for MealIngredients table
CREATE POLICY "Users can view their own meal ingredients" 
ON public."MealIngredients" 
FOR SELECT 
USING (
  meal_id IN (
    SELECT id::text FROM public."Meals" WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own meal ingredients" 
ON public."MealIngredients" 
FOR INSERT 
WITH CHECK (
  meal_id IN (
    SELECT id::text FROM public."Meals" WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own meal ingredients" 
ON public."MealIngredients" 
FOR UPDATE 
USING (
  meal_id IN (
    SELECT id::text FROM public."Meals" WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own meal ingredients" 
ON public."MealIngredients" 
FOR DELETE 
USING (
  meal_id IN (
    SELECT id::text FROM public."Meals" WHERE user_id = auth.uid()
  )
);

-- Create policies for DailyMacros table
CREATE POLICY "Users can view their own daily macros" 
ON public."DailyMacros" 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily macros" 
ON public."DailyMacros" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily macros" 
ON public."DailyMacros" 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for WeightTracking table
CREATE POLICY "Users can view their own weight tracking" 
ON public."WeightTracking" 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weight tracking" 
ON public."WeightTracking" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight tracking" 
ON public."WeightTracking" 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for ChatbotLogs table
CREATE POLICY "Users can view their own chat logs" 
ON public."ChatbotLogs" 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat logs" 
ON public."ChatbotLogs" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."Users" (
    id,
    email,
    username,
    age,
    height_cm,
    weight_kg,
    goal_weight_kg,
    weekly_weight_gain_goal,
    activity_level,
    avg_steps_per_day,
    therapy_style,
    therapist_description
  )
  VALUES (
    NEW.id::bigint,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'New User'),
    COALESCE((NEW.raw_user_meta_data ->> 'age')::integer, 25),
    COALESCE((NEW.raw_user_meta_data ->> 'height_cm')::real, 165.0),
    COALESCE((NEW.raw_user_meta_data ->> 'weight_kg')::real, 60.0),
    COALESCE((NEW.raw_user_meta_data ->> 'goal_weight_kg')::real, 65.0),
    COALESCE((NEW.raw_user_meta_data ->> 'weekly_weight_gain_goal')::real, 0.5),
    COALESCE(NEW.raw_user_meta_data ->> 'activity_level', 'moderately-active'),
    COALESCE((NEW.raw_user_meta_data ->> 'avg_steps_per_day')::integer, 8000),
    COALESCE(NEW.raw_user_meta_data ->> 'therapy_style', 'ACT'),
    COALESCE(NEW.raw_user_meta_data ->> 'therapist_description', 'Supportive and encouraging approach')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;