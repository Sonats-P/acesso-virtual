-- Create visitors table
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  photo TEXT,
  status TEXT NOT NULL DEFAULT 'inside' CHECK (status IN ('inside', 'outside')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for portaria system)
CREATE POLICY "Allow all operations on visitors" 
ON public.visitors 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_visitors_updated_at
BEFORE UPDATE ON public.visitors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better search performance
CREATE INDEX idx_visitors_name ON public.visitors(name);
CREATE INDEX idx_visitors_cpf ON public.visitors(cpf);
CREATE INDEX idx_visitors_status ON public.visitors(status);