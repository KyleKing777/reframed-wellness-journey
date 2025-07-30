-- Add calculated health metrics columns to Users table
ALTER TABLE public."Users" 
ADD COLUMN bmr INTEGER,
ADD COLUMN tdee INTEGER,
ADD COLUMN daily_caloric_goal INTEGER;

-- Add helpful comments
COMMENT ON COLUMN public."Users".bmr IS 'Basal Metabolic Rate calculated using Mifflin-St Jeor equation';
COMMENT ON COLUMN public."Users".tdee IS 'Total Daily Energy Expenditure based on BMR and activity level';
COMMENT ON COLUMN public."Users".daily_caloric_goal IS 'Target daily calories including surplus for weight gain goals';