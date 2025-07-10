
-- Crear tabla para almacenar las notificaciones de recordatorio
CREATE TABLE public.training_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  training_type TEXT NOT NULL, -- 'judo', 'physical_preparation', 'nutrition', 'weight'
  title TEXT NOT NULL,
  message TEXT,
  days_of_week INTEGER[] NOT NULL, -- Array de días: 0=Domingo, 1=Lunes, etc.
  time_of_day TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.training_reminders ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para training_reminders
CREATE POLICY "Users can view their own reminders" 
  ON public.training_reminders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
  ON public.training_reminders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
  ON public.training_reminders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
  ON public.training_reminders 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear tabla para registrar las notificaciones enviadas
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reminder_id UUID REFERENCES public.training_reminders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent' -- 'sent', 'failed', 'dismissed'
);

-- Habilitar RLS para notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notification_logs
CREATE POLICY "Users can view their own notification logs" 
  ON public.notification_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notification logs" 
  ON public.notification_logs 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own notification logs" 
  ON public.notification_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);
