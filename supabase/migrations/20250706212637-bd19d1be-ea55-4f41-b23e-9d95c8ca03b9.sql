
-- Eliminar los usuarios Hugo y Mary existentes
DELETE FROM auth.users WHERE email IN ('hugo@correo.com', 'mary@correo.com');

-- Crear nuevamente los usuarios Hugo y Mary con las nuevas contraseñas
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
  crypt('hugo123', gen_salt('bf')),
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
  crypt('mary123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Mary"}',
  'authenticated',
  'authenticated'
);

-- Asignar rol de entrenador a Hugo y Mary
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'entrenador'::app_role
FROM auth.users
WHERE email IN ('hugo@correo.com', 'mary@correo.com');

-- Crear perfiles en la tabla profiles para Hugo y Mary
INSERT INTO public.profiles (user_id, full_name, email)
SELECT 
  id,
  raw_user_meta_data ->> 'full_name',
  email
FROM auth.users
WHERE email IN ('hugo@correo.com', 'mary@correo.com');
