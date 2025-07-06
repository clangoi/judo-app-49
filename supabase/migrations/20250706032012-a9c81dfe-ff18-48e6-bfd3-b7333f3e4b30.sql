
-- Asignar rol de admin al usuario claudita06.99@gmail.com
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT user_id 
  FROM profiles 
  WHERE email = 'claudita06.99@gmail.com'
);

-- Si el usuario no tiene un rol asignado aún, insertarlo
INSERT INTO user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM profiles 
WHERE email = 'claudita06.99@gmail.com'
AND user_id NOT IN (SELECT user_id FROM user_roles);

-- Crear tabla para asignaciones de practicantes a entrenadores
CREATE TABLE public.trainer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE (trainer_id, student_id)
);

-- Habilitar RLS en trainer_assignments
ALTER TABLE public.trainer_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para trainer_assignments
CREATE POLICY "Admins can manage all trainer assignments" ON public.trainer_assignments
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Trainers can view their assigned students" ON public.trainer_assignments
FOR SELECT USING (
  auth.uid() = trainer_id OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Students can view their trainer assignment" ON public.trainer_assignments
FOR SELECT USING (
  auth.uid() = student_id OR 
  auth.uid() = trainer_id OR
  public.has_role(auth.uid(), 'admin')
);

-- Función para obtener estudiantes asignados a un entrenador
CREATE OR REPLACE FUNCTION public.get_trainer_students(_trainer_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  student_id UUID,
  full_name TEXT,
  email TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    ta.student_id,
    p.full_name,
    p.email,
    ta.assigned_at
  FROM public.trainer_assignments ta
  JOIN public.profiles p ON p.user_id = ta.student_id
  WHERE ta.trainer_id = _trainer_id;
$$;

-- Función para obtener el entrenador asignado a un estudiante
CREATE OR REPLACE FUNCTION public.get_student_trainer(_student_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  trainer_id UUID,
  full_name TEXT,
  email TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    ta.trainer_id,
    p.full_name,
    p.email,
    ta.assigned_at
  FROM public.trainer_assignments ta
  JOIN public.profiles p ON p.user_id = ta.trainer_id
  WHERE ta.student_id = _student_id;
$$;
