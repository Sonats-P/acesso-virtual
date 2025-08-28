-- Add new fields to visitors table
ALTER TABLE public.visitors 
ADD COLUMN document_type TEXT DEFAULT 'CPF',
ADD COLUMN document_number TEXT,
ADD COLUMN visit_reason TEXT,
ADD COLUMN entry_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN exit_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN visit_date DATE DEFAULT CURRENT_DATE;

-- Make CPF field optional (nullable)
ALTER TABLE public.visitors ALTER COLUMN cpf DROP NOT NULL;

-- Update existing records to populate document_number with cpf
UPDATE public.visitors 
SET document_number = cpf 
WHERE document_number IS NULL;

-- Create index for better search performance on new fields
CREATE INDEX idx_visitors_document_number ON public.visitors(document_number);
CREATE INDEX idx_visitors_visit_date ON public.visitors(visit_date);
CREATE INDEX idx_visitors_entry_time ON public.visitors(entry_time);

-- Create function to automatically set entry time when status changes to 'inside'
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
$$ LANGUAGE plpgsql;

-- Create trigger for automatic entry/exit time setting
CREATE TRIGGER set_visitor_entry_exit_times
BEFORE UPDATE ON public.visitors
FOR EACH ROW
EXECUTE FUNCTION public.set_entry_time();
