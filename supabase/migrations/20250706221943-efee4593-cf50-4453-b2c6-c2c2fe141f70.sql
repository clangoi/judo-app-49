
-- Eliminar los usuarios Hugo y Mary existentes
DELETE FROM public.profiles WHERE email IN ('hugo@correo.com', 'mary@correo.com');
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('hugo@correo.com', 'mary@correo.com')
);
DELETE FROM auth.users WHERE email IN ('hugo@correo.com', 'mary@correo.com');

-- Crear Hugo y Mary como deportistas usando el mismo método exitoso
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
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'hugo@correo.com', crypt('hugo123', gen_salt('bf')), now(), null, null, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Hugo"}', now(), now(), '', '', '', '', 'authenticated', 'authenticated'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'mary@correo.com', crypt('mary123', gen_salt('bf')), now(), null, null, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Mary"}', now(), now(), '', '', '', '', 'authenticated', 'authenticated');

-- Los triggers automáticos se encargarán de:
-- 1. Crear perfiles en la tabla profiles
-- 2. Asignar roles de practicante automáticamente
