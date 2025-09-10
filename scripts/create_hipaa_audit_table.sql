-- Creating HIPAA audit logging table for PHI access tracking
CREATE TABLE IF NOT EXISTS hipaa_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- 'CREATE', 'READ', 'UPDATE', 'DELETE'
  table_name TEXT NOT NULL,
  record_id UUID,
  phi_fields_accessed TEXT[], -- Array of PHI field names accessed
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  additional_context JSONB
);

-- Adding RLS policy for audit log access
ALTER TABLE hipaa_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own audit logs
CREATE POLICY "Users can view own audit logs" ON hipaa_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Only system can insert audit logs
CREATE POLICY "System can insert audit logs" ON hipaa_audit_log
  FOR INSERT WITH CHECK (true);

-- Creating indexes for efficient audit queries
CREATE INDEX IF NOT EXISTS idx_hipaa_audit_user_id ON hipaa_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_hipaa_audit_timestamp ON hipaa_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_hipaa_audit_action_type ON hipaa_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_hipaa_audit_table_name ON hipaa_audit_log(table_name);
