-- Create applications table for storing submitted applications
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    application_data JSONB NOT NULL,
    benefit_type TEXT NOT NULL CHECK (benefit_type IN ('medicaid', 'snap', 'both')),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'denied')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);

-- Create index for faster queries by benefit_type
CREATE INDEX IF NOT EXISTS idx_applications_benefit_type ON public.applications(benefit_type);

-- Create index for faster queries by status
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- Enable Row Level Security
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own applications
CREATE POLICY "Users can view their own applications" ON public.applications
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own applications
CREATE POLICY "Users can insert their own applications" ON public.applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);
