
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alimentacion (nutrition) table
CREATE TABLE public.alimentacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fecha DATE NOT NULL,
  tipo_alimento TEXT NOT NULL CHECK (tipo_alimento IN ('Desayuno', 'Colacion', 'Almuerzo', 'Cena')),
  alimento TEXT NOT NULL,
  cantidad TEXT,
  foto_url TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create peso (weight) table
CREATE TABLE public.peso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fecha DATE NOT NULL,
  peso DECIMAL(5,2) NOT NULL,
  foto_url TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sesiones_preparacion (physical preparation) table
CREATE TABLE public.sesiones_preparacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fecha DATE NOT NULL,
  tipo_sesion TEXT NOT NULL,
  duracion INTEGER NOT NULL,
  intensidad INTEGER NOT NULL CHECK (intensidad IN (1, 2, 3, 5, 8, 13, 21, 34)),
  ejercicios TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create entrenamientos_judo table
CREATE TABLE public.entrenamientos_judo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fecha DATE NOT NULL,
  duracion INTEGER NOT NULL,
  tipo_entrenamiento TEXT NOT NULL,
  tecnicas_practicadas TEXT,
  que_funciono TEXT,
  que_no_funciono TEXT,
  comentarios TEXT,
  randory JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tecnicas_judo table
CREATE TABLE public.tecnicas_judo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre_tecnica TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descripcion TEXT,
  puntos_clave TEXT,
  fotos_urls TEXT[],
  video_youtube_url TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tactica_judo table
CREATE TABLE public.tactica_judo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre_plan TEXT NOT NULL,
  oponente TEXT,
  estrategia TEXT,
  tecnicas_primarias TEXT,
  tecnicas_secundarias TEXT,
  puntos_debiles_oponente TEXT,
  plan_accion TEXT,
  fotos_urls TEXT[],
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alimentacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_preparacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrenamientos_judo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tecnicas_judo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tactica_judo ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for alimentacion
CREATE POLICY "Users can view own alimentacion" ON public.alimentacion
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alimentacion" ON public.alimentacion
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alimentacion" ON public.alimentacion
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alimentacion" ON public.alimentacion
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for peso
CREATE POLICY "Users can view own peso" ON public.peso
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own peso" ON public.peso
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own peso" ON public.peso
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own peso" ON public.peso
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for sesiones_preparacion
CREATE POLICY "Users can view own sesiones_preparacion" ON public.sesiones_preparacion
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sesiones_preparacion" ON public.sesiones_preparacion
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sesiones_preparacion" ON public.sesiones_preparacion
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sesiones_preparacion" ON public.sesiones_preparacion
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for entrenamientos_judo
CREATE POLICY "Users can view own entrenamientos_judo" ON public.entrenamientos_judo
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entrenamientos_judo" ON public.entrenamientos_judo
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entrenamientos_judo" ON public.entrenamientos_judo
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entrenamientos_judo" ON public.entrenamientos_judo
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tecnicas_judo
CREATE POLICY "Users can view own tecnicas_judo" ON public.tecnicas_judo
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tecnicas_judo" ON public.tecnicas_judo
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tecnicas_judo" ON public.tecnicas_judo
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tecnicas_judo" ON public.tecnicas_judo
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tactica_judo
CREATE POLICY "Users can view own tactica_judo" ON public.tactica_judo
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tactica_judo" ON public.tactica_judo
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tactica_judo" ON public.tactica_judo
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tactica_judo" ON public.tactica_judo
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
