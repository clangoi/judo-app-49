
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import AuthGuard from "./components/AuthGuard";
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
      <BrowserRouter>
        <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <AuthGuard>
                  <Index />
                </AuthGuard>
              } />
              <Route path="/deporte" element={
                <AuthGuard>
                  <Deporte />
                </AuthGuard>
              } />
              <Route path="/mentalcheck" element={
                <AuthGuard>
                  <MentalCheck />
                </AuthGuard>
              } />
              <Route path="/estado-animo" element={
                <AuthGuard>
                  <EstadoAnimo />
                </AuthGuard>
              } />
              <Route path="/niveles-estres" element={
                <AuthGuard>
                  <NivelesEstres />
                </AuthGuard>
              } />
              <Route path="/bienestar-mental" element={
                <AuthGuard>
                  <BienestarMental />
                </AuthGuard>
              } />
              <Route path="/concentracion" element={
                <AuthGuard>
                  <Concentracion />
                </AuthGuard>
              } />
              <Route path="/evaluacion-profunda" element={
                <AuthGuard>
                  <EvaluacionProfunda />
                </AuthGuard>
              } />
              <Route path="/checkin-rapido" element={
                <AuthGuard>
                  <CheckinRapido />
                </AuthGuard>
              } />
              <Route path="/manejo-crisis" element={
                <AuthGuard>
                  <ManejoCrisis />
                </AuthGuard>
              } />
              <Route path="/tecnicas-respiracion" element={
                <AuthGuard>
                  <TecnicasRespiracion />
                </AuthGuard>
              } />
              <Route path="/mindfulness-express" element={
                <AuthGuard>
                  <MindfulnessExpress />
                </AuthGuard>
              } />
              <Route path="/sesiones-preparacion" element={
                <AuthGuard>
                  <SesionesPreparacion />
                </AuthGuard>
              } />
              <Route path="/entrenamientos-deportivo" element={
                <AuthGuard>
                  <EntrenamientosJudo />
                </AuthGuard>
              } />
              <Route path="/tecnicas-deportivo" element={
                <AuthGuard>
                  <TecnicasJudo />
                </AuthGuard>
              } />
              <Route path="/tactica-deportivo" element={
                <AuthGuard>
                  <TacticaJudo />
                </AuthGuard>
              } />
              <Route path="/peso" element={
                <AuthGuard>
                  <Peso />
                </AuthGuard>
              } />

              <Route path="/graficos" element={
                <AuthGuard>
                  <Graficos />
                </AuthGuard>
              } />
              <Route path="/gestion" element={
                <AuthGuard>
                  <Gestion />
                </AuthGuard>
              } />
              <Route path="/configuracion" element={
                <AuthGuard>
                  <Configuracion />
                </AuthGuard>
              } />

              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          <PWAInstallPrompt />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
