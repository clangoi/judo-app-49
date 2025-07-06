
-- Crear función para asignar rol de admin a claudita06.99@gmail.com automáticamente
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
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger que se ejecute después de la inserción en auth.users
CREATE TRIGGER on_auth_user_created_admin_assignment
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_admin_user_assignment();
