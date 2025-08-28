-- Fix security issues: RLS policies, function search_path, and OTP expiry

-- 1. Fix RLS Policy - Replace overly permissive policy with proper access control
DROP POLICY IF EXISTS "Allow all operations on visitors" ON public.visitors;

-- Create more restrictive policy for authenticated users only
CREATE POLICY "Allow authenticated users to manage visitors" 
ON public.visitors 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- 2. Fix function search_path - Set search_path for all functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.set_entry_time()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is changing to 'inside' and entry_time is null, set it
  IF NEW.status = 'inside' AND OLD.status != 'inside' AND NEW.entry_time IS NULL THEN
    NEW.entry_time = now();
  END IF;
  
  -- If status is changing to 'outside' and exit_time is null, set it
  IF NEW.status = 'outside' AND OLD.status != 'outside' AND NEW.exit_time IS NULL THEN
    NEW.exit_time = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Update auth settings for OTP expiry (this needs to be done in Supabase dashboard)
-- The OTP expiry setting is configured in the Supabase dashboard under Authentication > Settings
-- Recommended: Set OTP expiry to 60 seconds (default is 3600 seconds = 1 hour)

-- 4. Add additional security constraints
-- Ensure document_number is not null when document_type is provided
ALTER TABLE public.visitors 
ADD CONSTRAINT check_document_number_not_null 
CHECK (
  (document_type IS NULL AND document_number IS NULL) OR 
  (document_type IS NOT NULL AND document_number IS NOT NULL)
);

-- Add constraint to ensure visit_date is not in the future
ALTER TABLE public.visitors 
ADD CONSTRAINT check_visit_date_not_future 
CHECK (visit_date <= CURRENT_DATE);

-- 5. Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.visitor_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID REFERENCES public.visitors(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.visitor_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy for audit log - only authenticated users can read
CREATE POLICY "Allow authenticated users to read audit log" 
ON public.visitor_audit_log 
FOR SELECT 
TO authenticated
USING (true);

-- 6. Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_visitor_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.visitor_audit_log (visitor_id, action, new_values, user_id)
    VALUES (NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.visitor_audit_log (visitor_id, action, old_values, new_values, user_id)
    VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.visitor_audit_log (visitor_id, action, old_values, user_id)
    VALUES (OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create audit trigger
CREATE TRIGGER audit_visitor_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.visitors
FOR EACH ROW EXECUTE FUNCTION public.audit_visitor_changes();
