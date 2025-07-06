
-- Crear función para manejar nuevos usuarios automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email), 
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Crear trigger para ejecutar automáticamente cuando se crea un usuario
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Crear perfiles para usuarios existentes que no los tengan
-- Esto incluirá a todos los usuarios que fueron creados automáticamente
INSERT INTO public.profiles (user_id, full_name, email)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', au.email, 'Usuario sin nombre') as full_name,
  au.email
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL;
