-- Create prescreening table to track completion status
CREATE TABLE IF NOT EXISTS prescreening_completion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  medicaid_eligible BOOLEAN,
  snap_eligible BOOLEAN,
  responses JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure one prescreening per user
ALTER TABLE prescreening_completion 
ADD CONSTRAINT prescreening_completion_user_id_unique UNIQUE (user_id);

-- Enable RLS
ALTER TABLE prescreening_completion ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own prescreening" ON prescreening_completion
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prescreening" ON prescreening_completion
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescreening" ON prescreening_completion
  FOR UPDATE USING (auth.uid() = user_id);
