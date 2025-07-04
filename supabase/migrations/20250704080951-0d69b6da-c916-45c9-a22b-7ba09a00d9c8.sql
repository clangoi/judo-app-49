
-- Create exercises table to store available exercises
CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create exercise_records table to track exercise performance over time
CREATE TABLE public.exercise_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  training_session_id uuid REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  sets integer,
  reps integer,
  weight_kg numeric,
  duration_minutes integer,
  notes text,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for exercises
CREATE POLICY "Users can view their own exercises" ON public.exercises
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own exercises" ON public.exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own exercises" ON public.exercises
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own exercises" ON public.exercises
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for exercise_records
CREATE POLICY "Users can view their own exercise records" ON public.exercise_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own exercise records" ON public.exercise_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own exercise records" ON public.exercise_records
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own exercise records" ON public.exercise_records
  FOR DELETE USING (auth.uid() = user_id);
