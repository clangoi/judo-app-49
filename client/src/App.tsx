
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { TimerProvider } from "./hooks/useTimerContext";
import AuthGuard from "./components/AuthGuard";
import FloatingTimer from "./components/FloatingTimer";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Deporte from "./pages/Deporte";
import MentalCheck from "./pages/MentalCheck";
import EstadoAnimo from "./pages/EstadoAnimo";
import NivelesEstres from "./pages/NivelesEstres";
import BienestarMental from "./pages/BienestarMental";
import Concentracion from "./pages/Concentracion";
import EvaluacionProfunda from "./pages/EvaluacionProfunda";
import CheckinRapido from "./pages/CheckinRapido";
import ManejoCrisis from "./pages/ManejoCrisis";
import TecnicasRespiracion from "./pages/TecnicasRespiracion";
import MindfulnessExpress from "./pages/MindfulnessExpress";
import SesionesPreparacion from "./pages/SesionesPreparacion";
import EntrenamientosJudo from "./pages/EntrenamientosJudo";
import TecnicasJudo from "./pages/TecnicasJudo";
import TacticaJudo from "./pages/TacticaJudo";
import Peso from "./pages/Peso";

import Graficos from "./pages/Graficos";
import Gestion from "./pages/Gestion";
import Configuracion from "./pages/Configuracion";


import NotFound from "./pages/NotFound";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/judo-app-49">
        <AuthProvider>
          <TimerProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="/deporte" element={<Deporte />} />
              <Route path="/mentalcheck" element={<MentalCheck />} />
              <Route path="/estado-animo" element={<EstadoAnimo />} />
              <Route path="/niveles-estres" element={<NivelesEstres />} />
              <Route path="/bienestar-mental" element={<BienestarMental />} />
              <Route path="/concentracion" element={<Concentracion />} />
              <Route path="/evaluacion-profunda" element={<EvaluacionProfunda />} />
              <Route path="/checkin-rapido" element={<CheckinRapido />} />
              <Route path="/manejo-crisis" element={<ManejoCrisis />} />
              <Route path="/tecnicas-respiracion" element={<TecnicasRespiracion />} />
              <Route path="/mindfulness-express" element={<MindfulnessExpress />} />
              <Route path="/sesiones-preparacion" element={<SesionesPreparacion />} />
              <Route path="/entrenamientos-deportivo" element={<EntrenamientosJudo />} />
              <Route path="/tecnicas-deportivo" element={<TecnicasJudo />} />
              <Route path="/tactica-deportivo" element={<TacticaJudo />} />
              <Route path="/peso" element={<Peso />} />

              <Route path="/graficos" element={<Graficos />} />
              <Route path="/gestion" element={<Gestion />} />
              <Route path="/configuracion" element={<Configuracion />} />

              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            <PWAInstallPrompt />
            <FloatingTimer />
          </TimerProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
