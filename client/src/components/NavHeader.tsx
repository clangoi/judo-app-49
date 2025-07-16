
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useClubs } from "@/hooks/useClubs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, ArrowLeft, Users, Shield, Settings } from "lucide-react";
import { SocialShareButton } from "./SocialShareButton";
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
  const { currentUserRole } = useUserRoles(user?.id);
  const { clubs } = useClubs();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener el perfil del usuario actual para obtener el logo seleccionado
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const response = await fetch(`/api/profiles/${user.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Encontrar el club con el logo seleccionado
  const selectedClub = clubs.find(club => club.id === userProfile?.selected_club_logo_id);
  
  // Logo del admin (la imagen que subiste)
  const adminLogoUrl = "/lovable-uploads/c6a3ed23-61eb-43e2-94de-c781c8d1107b.png";
  
  // Determinar qué logo mostrar
  const logoUrl = currentUserRole === 'admin' 
    ? adminLogoUrl 
    : selectedClub?.logo_url;

  const handleSignOut = () => {
    signOut();
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleAdminPanel = () => {
    navigate('/admin');
  };

  const handleUserSettings = () => {
    // Por ahora navegar a la página principal, pero se puede crear una página de configuración específica
    navigate('/configuracion');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'entrenador':
        return 'Entrenador';
      case 'deportista':
        return 'Deportista';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'entrenador':
        return 'default';
      case 'deportista':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const isHomePage = location.pathname === '/';

  return (
    <div className="bg-primary p-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Logo del club o admin */}
            {logoUrl && (
              <div className="flex-shrink-0">
                <img 
                  src={logoUrl} 
                  alt={currentUserRole === 'admin' ? 'Logo Admin' : `Logo de ${selectedClub?.name}`}
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
            {currentUserRole && (
              <Badge variant={getRoleBadgeVariant(currentUserRole)} className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                {getRoleLabel(currentUserRole)}
              </Badge>
            )}
            
            {currentUserRole === 'admin' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAdminPanel}
                className="text-primary-foreground hover:bg-primary-foreground/20 p-2"
              >
                <Shield className="h-4 w-4" />
              </Button>
            )}

            {(currentUserRole === 'entrenador' || currentUserRole === 'admin') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/clubes')}
                className="text-primary-foreground hover:bg-primary-foreground/20 p-2"
              >
                <Users className="h-4 w-4" />
              </Button>
            )}

            <NotificationButton />
            
            <SocialShareButton />
            
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
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavHeader;
