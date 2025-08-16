-- Create applications table to store submitted applications
CREATE TABLE IF NOT EXISTS public.applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    application_type text NOT NULL CHECK (application_type IN ('medicaid', 'snap', 'both')),
    application_data jsonb NOT NULL,
    status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'denied', 'pending_documents')),
    submitted_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    reference_number text GENERATED ALWAYS AS ('APP-' || EXTRACT(YEAR FROM submitted_at) || '-' || LPAD(EXTRACT(DOY FROM submitted_at)::text, 3, '0') || '-' || UPPER(SUBSTRING(id::text, 1, 8))) STORED
);

-- Add RLS policies
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own applications
CREATE POLICY "Users can view own applications" ON public.applications
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own applications
CREATE POLICY "Users can insert own applications" ON public.applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own applications
CREATE POLICY "Users can update own applications" ON public.applications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON public.applications(submitted_at DESC);

-- Update the application_progress table to remove submitted_applications column
ALTER TABLE public.application_progress DROP COLUMN IF EXISTS submitted_applications;

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
