
-- Agregar política para que los administradores puedan ver todos los perfiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
