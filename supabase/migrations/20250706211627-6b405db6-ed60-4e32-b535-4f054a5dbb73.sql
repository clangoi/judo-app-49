
-- Primero, actualizar el enum para cambiar 'practicante' por 'deportista'
ALTER TYPE public.app_role RENAME VALUE 'practicante' TO 'deportista';

-- Actualizar los roles existentes en la tabla user_roles
UPDATE public.user_roles SET role = 'deportista' WHERE role = 'practicante';

-- Crear perfiles para los entrenadores
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  aud,
  role
) VALUES
(
  gen_random_uuid(),
  'hugo@correo.com',
  crypt('hugo', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Hugo"}',
  'authenticated',
  'authenticated'
),
(
  gen_random_uuid(),
  'mary@correo.com',
  crypt('mary', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Mary"}',
  'authenticated',
  'authenticated'
);

-- Crear perfiles para los 10 deportistas
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  aud,
  role
) VALUES
(gen_random_uuid(), 'deportista1@correo.com', crypt('deportista1', gen_salt('bf')), now(), now(), now(), '{"full_name": "Deportista 1"}', 'authenticated', 'authenticated'),
(gen_random_uuid(), 'deportista2@correo.com', crypt('deportista2', gen_salt('bf')), now(), now(), now(), '{"full_name": "Deportista 2"}', 'authenticated', 'authenticated'),
(gen_random_uuid(), 'deportista3@correo.com', crypt('deportista3', gen_salt('bf')), now(), now(), now(), '{"full_name": "Deportista 3"}', 'authenticated', 'authenticated'),
(gen_random_uuid(), 'deportista4@correo.com', crypt('deportista4', gen_salt('bf')), now(), now(), now(), '{"full_name": "Deportista 4"}', 'authenticated', 'authenticated'),
(gen_random_uuid(), 'deportista5@correo.com', crypt('deportista5', gen_salt('bf')), now(), now(), now(), '{"full_name": "Deportista 5"}', 'authenticated', 'authenticated'),
(gen_random_uuid(), 'deportista6@correo.com', crypt('deportista6', gen_salt('bf')), now(), now(), now(), '{"full_name": "Deportista 6"}', 'authenticated', 'authenticated'),
(gen_random_uuid(), 'deportista7@correo.com', crypt('deportista7', gen_salt('bf')), now(), now(), now(), '{"full_name": "Deportista 7"}', 'authenticated', 'authenticated'),
(gen_random_uuid(), 'deportista8@correo.com', crypt('deportista8', gen_salt('bf')), now(), now(), now(), '{"full_name": "Deportista 8"}', 'authenticated', 'authenticated'),
(gen_random_uuid(), 'deportista9@correo.com', crypt('deportista9', gen_salt('bf')), now(), now(), now(), '{"full_name": "Deportista 9"}', 'authenticated', 'authenticated'),
(gen_random_uuid(), 'deportista10@correo.com', crypt('deportista10', gen_salt('bf')), now(), now(), now(), '{"full_name": "Deportista 10"}', 'authenticated', 'authenticated');

-- Asignar rol de entrenador a Hugo y Mary
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'entrenador'::app_role
FROM auth.users
WHERE email IN ('hugo@correo.com', 'mary@correo.com');

-- Asignar rol de deportista a los 10 deportistas
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'deportista'::app_role
FROM auth.users
WHERE email LIKE 'deportista%@correo.com';

-- Crear perfiles en la tabla profiles para todos los nuevos usuarios
INSERT INTO public.profiles (user_id, full_name, email)
SELECT 
  id,
  raw_user_meta_data ->> 'full_name',
  email
FROM auth.users
WHERE email IN (
  'hugo@correo.com', 
  'mary@correo.com',
  'deportista1@correo.com', 'deportista2@correo.com', 'deportista3@correo.com', 
  'deportista4@correo.com', 'deportista5@correo.com', 'deportista6@correo.com',
  'deportista7@correo.com', 'deportista8@correo.com', 'deportista9@correo.com', 'deportista10@correo.com'
);

-- Actualizar la función trigger para usar 'deportista' en lugar de 'practicante'
CREATE OR REPLACE FUNCTION public.handle_admin_user_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  -- Si el usuario que se registra es claudita06.99@gmail.com, asignarle rol de admin
  IF NEW.email = 'claudita06.99@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Para todos los demás usuarios, asignar rol de deportista
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'deportista'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;
