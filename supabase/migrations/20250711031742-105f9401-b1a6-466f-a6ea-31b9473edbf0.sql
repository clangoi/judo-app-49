
-- Add rest_seconds column to exercise_records table
ALTER TABLE public.exercise_records 
ADD COLUMN rest_seconds integer;
