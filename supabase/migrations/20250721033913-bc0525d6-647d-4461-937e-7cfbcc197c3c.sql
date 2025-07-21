-- Add user_id column to Users table to link with Supabase auth
ALTER TABLE public."Users" ADD COLUMN user_id UUID;

-- Add index for better performance on user_id lookups
CREATE INDEX idx_users_user_id ON public."Users"(user_id);

-- Enable Row Level Security on Users table
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;

-- Create policies for user access to their own data
CREATE POLICY "Users can view their own profile" 
ON public."Users" 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public."Users" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public."Users" 
FOR UPDATE 
USING (auth.uid() = user_id);