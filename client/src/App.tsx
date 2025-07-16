
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AchievementProvider } from "./components/achievements/AchievementProvider";
import AuthGuard from "./components/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SesionesPreparacion from "./pages/SesionesPreparacion";
import EntrenamientosJudo from "./pages/EntrenamientosJudo";
import TecnicasJudo from "./pages/TecnicasJudo";
import TacticaJudo from "./pages/TacticaJudo";
import Peso from "./pages/Peso";

import Graficos from "./pages/Graficos";
import Gestion from "./pages/Gestion";
import Admin from "./pages/Admin";
import TrainerClubs from "./pages/TrainerClubs";
import Achievements from "./pages/Achievements";


import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AchievementProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <AuthGuard>
                  <Index />
                </AuthGuard>
              } />
              <Route path="/sesiones-preparacion" element={
                <AuthGuard>
                  <SesionesPreparacion />
                </AuthGuard>
              } />
              <Route path="/entrenamientos-judo" element={
                <AuthGuard>
                  <EntrenamientosJudo />
                </AuthGuard>
              } />
              <Route path="/tecnicas-judo" element={
                <AuthGuard>
                  <TecnicasJudo />
                </AuthGuard>
              } />
              <Route path="/tactica-judo" element={
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
              <Route path="/admin" element={
                <AuthGuard>
                  <Admin />
                </AuthGuard>
              } />
              <Route path="/clubes" element={
                <AuthGuard>
                  <TrainerClubs />
                </AuthGuard>
              } />
              <Route path="/logros" element={
                <AuthGuard>
                  <Achievements />
                </AuthGuard>
              } />


              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </AchievementProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
