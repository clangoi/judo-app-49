
-- Crear tabla para almacenar logos de clubes
CREATE TABLE public.clubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en la tabla clubs
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- Política para que entrenadores y admins puedan ver clubes
CREATE POLICY "Trainers and admins can view clubs" 
  ON public.clubs 
  FOR SELECT 
  USING (
    has_role(auth.uid(), 'entrenador'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR
    auth.uid() = created_by
  );

-- Política para que entrenadores puedan crear clubes
CREATE POLICY "Trainers can create clubs" 
  ON public.clubs 
  FOR INSERT 
  WITH CHECK (
    (has_role(auth.uid(), 'entrenador'::app_role) OR has_role(auth.uid(), 'admin'::app_role)) AND
    auth.uid() = created_by
  );

-- Política para que entrenadores puedan actualizar sus clubes
CREATE POLICY "Trainers can update their clubs" 
  ON public.clubs 
  FOR UPDATE 
  USING (
    (has_role(auth.uid(), 'entrenador'::app_role) OR has_role(auth.uid(), 'admin'::app_role)) AND
    auth.uid() = created_by
  );

-- Política para que entrenadores puedan eliminar sus clubes
CREATE POLICY "Trainers can delete their clubs" 
  ON public.clubs 
  FOR DELETE 
  USING (
    (has_role(auth.uid(), 'entrenador'::app_role) OR has_role(auth.uid(), 'admin'::app_role)) AND
    auth.uid() = created_by
  );

-- Agregar columna club_id a la tabla profiles para reemplazar club_name
ALTER TABLE public.profiles ADD COLUMN club_id UUID REFERENCES public.clubs(id);

-- Agregar columna selected_club_logo_id para que entrenadores seleccionen qué logo mostrar
ALTER TABLE public.profiles ADD COLUMN selected_club_logo_id UUID REFERENCES public.clubs(id);

-- Crear bucket para almacenar logos de clubes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('club-logos', 'club-logos', true);

-- Política de storage para que entrenadores puedan subir logos
CREATE POLICY "Trainers can upload club logos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'club-logos' AND 
    (has_role(auth.uid(), 'entrenador'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

-- Política de storage para que todos puedan ver los logos
CREATE POLICY "Anyone can view club logos" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'club-logos');

-- Política de storage para que entrenadores puedan actualizar sus logos
CREATE POLICY "Trainers can update their club logos" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'club-logos' AND 
    (has_role(auth.uid(), 'entrenador'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

-- Política de storage para que entrenadores puedan eliminar sus logos
CREATE POLICY "Trainers can delete their club logos" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'club-logos' AND 
    (has_role(auth.uid(), 'entrenador'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );
