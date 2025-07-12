
-- Crear tabla para clubes
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en la tabla clubs
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clubs
-- Los entrenadores y admins pueden ver todos los clubes
CREATE POLICY "Trainers and admins can view all clubs" ON public.clubs
FOR SELECT USING (
  public.has_role(auth.uid(), 'entrenador') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Solo entrenadores y admins pueden crear clubes
CREATE POLICY "Trainers and admins can create clubs" ON public.clubs
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'entrenador') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Solo el creador del club o admins pueden actualizarlo
CREATE POLICY "Club creators and admins can update clubs" ON public.clubs
FOR UPDATE USING (
  auth.uid() = created_by OR 
  public.has_role(auth.uid(), 'admin')
);

-- Solo el creador del club o admins pueden eliminarlo
CREATE POLICY "Club creators and admins can delete clubs" ON public.clubs
FOR DELETE USING (
  auth.uid() = created_by OR 
  public.has_role(auth.uid(), 'admin')
);

-- Modificar la tabla profiles para referenciar clubs en lugar de tener club_name como texto
ALTER TABLE public.profiles 
ADD COLUMN club_id UUID REFERENCES public.clubs(id),
ADD CONSTRAINT profiles_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);

-- Crear un trigger para actualizar updated_at en clubs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clubs_updated_at 
    BEFORE UPDATE ON public.clubs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
