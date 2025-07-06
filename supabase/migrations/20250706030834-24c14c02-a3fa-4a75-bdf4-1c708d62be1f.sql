
-- Crear enum para los roles de la aplicación
CREATE TYPE public.app_role AS ENUM ('practicante', 'entrenador', 'admin');

-- Crear tabla para los roles de usuario
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'practicante',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Habilitar RLS en la tabla user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Crear función helper para verificar roles (evita problemas de RLS recursivo)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Crear función para obtener el rol principal del usuario
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID DEFAULT auth.uid())
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = COALESCE(_user_id, auth.uid())
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'entrenador' THEN 2
      WHEN 'practicante' THEN 3
    END
  LIMIT 1;
$$;

-- Políticas RLS para user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para asignar rol por defecto al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'practicante');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_role();

-- Asignar rol 'practicante' a usuarios existentes
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'practicante'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles);

-- Actualizar políticas RLS existentes para considerar roles
-- Para ejercicios: entrenadores y admins pueden ver ejercicios de otros usuarios
DROP POLICY IF EXISTS "Users can view their own exercises" ON public.exercises;
CREATE POLICY "Role-based exercise access" ON public.exercises
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'entrenador') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Para sesiones de entrenamiento: entrenadores y admins pueden ver sesiones de otros
DROP POLICY IF EXISTS "Users can view their own training sessions" ON public.training_sessions;
CREATE POLICY "Role-based training session access" ON public.training_sessions
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'entrenador') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Para registros de ejercicios: entrenadores y admins pueden ver registros de otros
DROP POLICY IF EXISTS "Users can view their own exercise records" ON public.exercise_records;
CREATE POLICY "Role-based exercise record access" ON public.exercise_records
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'entrenador') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Para entradas de peso: entrenadores y admins pueden ver peso de otros
DROP POLICY IF EXISTS "Users can view their own weight entries" ON public.weight_entries;
CREATE POLICY "Role-based weight entry access" ON public.weight_entries
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'entrenador') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Para técnicas: entrenadores y admins pueden ver técnicas de otros
DROP POLICY IF EXISTS "Users can view their own techniques" ON public.techniques;
CREATE POLICY "Role-based technique access" ON public.techniques
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'entrenador') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Para notas tácticas: entrenadores y admins pueden ver notas de otros
DROP POLICY IF EXISTS "Users can view their own tactical notes" ON public.tactical_notes;
CREATE POLICY "Role-based tactical note access" ON public.tactical_notes
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'entrenador') OR 
  public.has_role(auth.uid(), 'admin')
);
