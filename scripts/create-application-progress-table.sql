-- Create table to store application progress
CREATE TABLE IF NOT EXISTS application_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  application_data JSONB NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE application_progress ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own progress
CREATE POLICY "Users can only access their own application progress" ON application_progress
  FOR ALL USING (auth.uid() = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_application_progress_updated_at 
  BEFORE UPDATE ON application_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
