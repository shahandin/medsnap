-- Add Row Level Security policies to application_progress table
ALTER TABLE application_progress ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own progress
CREATE POLICY "Allow users to view their own progress" 
ON application_progress FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own progress
CREATE POLICY "Allow users to insert their own progress" 
ON application_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own progress
CREATE POLICY "Allow users to update their own progress" 
ON application_progress FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own progress
CREATE POLICY "Allow users to delete their own progress" 
ON application_progress FOR DELETE 
USING (auth.uid() = user_id);
