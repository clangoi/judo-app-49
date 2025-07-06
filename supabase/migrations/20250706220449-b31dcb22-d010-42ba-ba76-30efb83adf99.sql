
-- Limpiar los usuarios deportistas que fueron creados incorrectamente
DELETE FROM auth.users WHERE email LIKE 'deportista%@correo.com';

-- Limpiar cualquier perfil o rol asociado a estos usuarios
DELETE FROM public.profiles WHERE email LIKE 'deportista%@correo.com';
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT user_id FROM public.profiles WHERE email LIKE 'deportista%@correo.com'
);

-- Crear los 10 deportistas usando el método correcto de Supabase
-- Usar la función de Supabase para crear usuarios autenticados
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
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'deportista1@correo.com', crypt('deportista1', gen_salt('bf')), now(), null, null, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Deportista 1"}', now(), now(), '', '', '', '', 'authenticated', 'authenticated'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'deportista2@correo.com', crypt('deportista2', gen_salt('bf')), now(), null, null, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Deportista 2"}', now(), now(), '', '', '', '', 'authenticated', 'authenticated'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'deportista3@correo.com', crypt('deportista3', gen_salt('bf')), now(), null, null, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Deportista 3"}', now(), now(), '', '', '', '', 'authenticated', 'authenticated'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'deportista4@correo.com', crypt('deportista4', gen_salt('bf')), now(), null, null, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Deportista 4"}', now(), now(), '', '', '', '', 'authenticated', 'authenticated'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'deportista5@correo.com', crypt('deportista5', gen_salt('bf')), now(), null, null, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Deportista 5"}', now(), now(), '', '', '', '', 'authenticated', 'authenticated'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'deportista6@correo.com', crypt('deportista6', gen_salt('bf')), now(), null, null, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Deportista 6"}', now(), now(), '', '', '', '', 'authenticated', 'authenticated'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'deportista7@correo.com', crypt('deportista7', gen_salt('bf')), now(), null, null, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Deportista 7"}', now(), now(), '', '', '', '', 'authenticated', 'authenticated'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'deportista8@correo.com', crypt('deportista8', gen_salt('bf')), now(), null, null, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Deportista 8"}', now(), now(), '', '', '', '', 'authenticated', 'authenticated'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'deportista9@correo.com', crypt('deportista9', gen_salt('bf')), now(), null, null, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Deportista 9"}', now(), now(), '', '', '', '', 'authenticated', 'authenticated'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'deportista10@correo.com', crypt('deportista10', gen_salt('bf')), now(), null, null, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Deportista 10"}', now(), now(), '', '', '', '', 'authenticated', 'authenticated');

-- Los triggers automáticos se encargarán de:
-- 1. Crear perfiles en la tabla profiles
-- 2. Asignar roles de deportista automáticamente
