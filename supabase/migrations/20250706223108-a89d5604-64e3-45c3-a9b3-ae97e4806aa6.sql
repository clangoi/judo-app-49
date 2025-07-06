
-- Eliminar los roles duplicados de 'practicante' para Hugo y Mary
-- Mantener solo sus roles de 'entrenador'
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('hugo@correo.com', 'mary@correo.com')
) 
AND role = 'practicante';

-- Verificar que solo queden los roles de 'entrenador'
-- Esta consulta es solo para verificación, no modifica datos
SELECT 
  u.email,
  ur.role,
  ur.assigned_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('hugo@correo.com', 'mary@correo.com')
ORDER BY u.email, ur.role;
