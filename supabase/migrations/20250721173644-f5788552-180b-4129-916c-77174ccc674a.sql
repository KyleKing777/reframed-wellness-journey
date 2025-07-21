-- Create RLS policies for ChatbotLogs table
CREATE POLICY "Users can view their own chat logs" 
ON public."ChatbotLogs" 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat logs" 
ON public."ChatbotLogs" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat logs" 
ON public."ChatbotLogs" 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat logs" 
ON public."ChatbotLogs" 
FOR DELETE 
USING (auth.uid() = user_id);