-- Add gender field to Users table for BMR calculations
ALTER TABLE "Users" ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female'));

-- Add fear_foods column as a JSON array for storing user's fear foods
ALTER TABLE "Users" ADD COLUMN fear_foods JSONB DEFAULT '[]'::jsonb;