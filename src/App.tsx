
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Peso from "./pages/Peso";
import SesionesPreparacion from "./pages/SesionesPreparacion";
import EntrenamientosJudo from "./pages/EntrenamientosJudo";
import TecnicasJudo from "./pages/TecnicasJudo";
import TacticaJudo from "./pages/TacticaJudo";
import Graficos from "./pages/Graficos";
import NotFound from "./pages/NotFound";

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
            <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
            <Route path="/peso" element={<AuthGuard><Peso /></AuthGuard>} />
            <Route path="/sesiones-preparacion" element={<AuthGuard><SesionesPreparacion /></AuthGuard>} />
            <Route path="/entrenamientos-judo" element={<AuthGuard><EntrenamientosJudo /></AuthGuard>} />
            <Route path="/tecnicas-judo" element={<AuthGuard><TecnicasJudo /></AuthGuard>} />
            <Route path="/tactica-judo" element={<AuthGuard><TacticaJudo /></AuthGuard>} />
            <Route path="/graficos" element={<AuthGuard><Graficos /></AuthGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
