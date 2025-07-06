
-- Eliminar todos los registros de ejercicios
DELETE FROM public.exercise_records;

-- Eliminar todos los ejercicios
DELETE FROM public.exercises;

-- Eliminar todas las entradas de nutrición
DELETE FROM public.nutrition_entries;

-- Eliminar todas las sesiones de randori
DELETE FROM public.randori_sessions;

-- Eliminar todas las notas tácticas
DELETE FROM public.tactical_notes;

-- Eliminar todas las técnicas
DELETE FROM public.techniques;

-- Eliminar todas las asignaciones de entrenador-estudiante
DELETE FROM public.trainer_assignments;

-- Eliminar todas las sesiones de entrenamiento
DELETE FROM public.training_sessions;

-- Eliminar todos los roles de usuario
DELETE FROM public.user_roles;

-- Eliminar todas las entradas de peso
DELETE FROM public.weight_entries;

-- Eliminar todos los perfiles de usuario
DELETE FROM public.profiles;

-- Eliminar todos los usuarios de autenticación (esto eliminará en cascada otros datos relacionados)
DELETE FROM auth.users;
