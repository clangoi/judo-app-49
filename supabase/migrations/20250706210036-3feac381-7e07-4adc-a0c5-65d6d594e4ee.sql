
-- Eliminar el trigger problemático que causa el conflicto
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

-- Eliminar la función problemática
DROP FUNCTION IF EXISTS public.handle_new_user_role();

-- Modificar la función para manejar TODOS los usuarios (no solo admin)
CREATE OR REPLACE FUNCTION public.handle_admin_user_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Si el usuario que se registra es claudita06.99@gmail.com, asignarle rol de admin
  IF NEW.email = 'claudita06.99@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Para todos los demás usuarios, asignar rol de practicante
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'practicante'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;
