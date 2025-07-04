
-- Add training_category field to distinguish between judo and physical preparation sessions
ALTER TABLE public.training_sessions 
ADD COLUMN training_category text CHECK (training_category IN ('judo', 'physical_preparation')) DEFAULT 'physical_preparation';

-- Update existing sessions to have proper categories
-- Sessions with 'judo' in session_type will be marked as judo
UPDATE public.training_sessions 
SET training_category = 'judo' 
WHERE session_type ILIKE '%judo%';

-- All other sessions will remain as physical_preparation (default)
