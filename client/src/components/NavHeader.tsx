
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, ArrowLeft, Settings } from "lucide-react";
import { NotificationButton } from "./NotificationButton";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// Removed supabase import

interface NavHeaderProps {
  title: string;
  subtitle?: string;
}

const NavHeader = ({ title, subtitle }: NavHeaderProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Simple logo for all users
  const logoUrl = "/lovable-uploads/c6a3ed23-61eb-43e2-94de-c781c8d1107b.png";

  const handleSignOut = () => {
    signOut();
  };

  const handleBack = () => {
    // Si estamos en alguna página de mental health, regresar a mentalcheck
    const mentalHealthPaths = ['/estado-animo', '/niveles-estres', '/bienestar-mental'];
    if (mentalHealthPaths.includes(location.pathname)) {
      navigate('/mentalcheck');
    } else {
      navigate('/');
    }
  };


  const handleUserSettings = () => {
    // Por ahora navegar a la página principal, pero se puede crear una página de configuración específica
    navigate('/configuracion');
  };


  const isHomePage = location.pathname === '/';

  return (
    <div className="bg-primary p-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Logo */}
            {logoUrl && (
              <div className="flex-shrink-0">
                <img 
                  src={logoUrl} 
                  alt="Logo"
                  className="h-10 w-10 object-contain rounded bg-white/10 p-1"
                />
              </div>
            )}
            
            {!isHomePage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-primary-foreground hover:bg-primary-foreground/20 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">{title}</h1>
              {subtitle && (
                <p className="text-primary-foreground/80 text-sm">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">

            

            <NotificationButton />
            
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUserSettings}
              className="text-primary-foreground hover:bg-primary-foreground/20 p-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-primary-foreground hover:bg-primary-foreground/20 p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavHeader;
