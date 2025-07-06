
-- Eliminar los usuarios Hugo y Mary existentes
DELETE FROM auth.users WHERE email IN ('hugo@correo.com', 'mary@correo.com');

-- Crear nuevamente los usuarios Hugo y Mary con las nuevas contraseñas
INSERT INTO auth.users (
  id, 
  instance_id,
  email, 
  encrypted_password, 
  email_confirmed_at, 
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at, 
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  aud,
  role
) VALUES
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'hugo@correo.com',
  crypt('hugo123', gen_salt('bf')),
  now(),
  null,
  null,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Hugo"}',
  now(),
  now(),
  '',
  '',
  '',
  '',
  'authenticated',
  'authenticated'
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'mary@correo.com',
  crypt('mary123', gen_salt('bf')),
  now(),
  null,
  null,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Mary"}',
  now(),
  now(),
  '',
  '',
  '',
  '',
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
