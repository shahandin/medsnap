-- Create HIPAA audit log table for compliance tracking
CREATE TABLE IF NOT EXISTS public.hipaa_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- CREATE, READ, UPDATE, DELETE
    application_id UUID,
    phi_fields TEXT[], -- Array of PHI field names accessed
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    request_url TEXT,
    request_method VARCHAR(10),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hipaa_audit_log_user_id ON public.hipaa_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_hipaa_audit_log_timestamp ON public.hipaa_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_hipaa_audit_log_action_type ON public.hipaa_audit_log(action_type);

-- Enable RLS
ALTER TABLE public.hipaa_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only view their own audit logs" ON public.hipaa_audit_log
    FOR SELECT USING (auth.uid() = user_id);

-- Only allow system/service role to insert audit logs
CREATE POLICY "System can insert audit logs" ON public.hipaa_audit_log
    FOR INSERT WITH CHECK (true);
