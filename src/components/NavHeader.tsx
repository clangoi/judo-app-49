
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, ArrowLeft, Settings, Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavHeaderProps {
  title: string;
  subtitle?: string;
}

const NavHeader = ({ title, subtitle }: NavHeaderProps) => {
  const { signOut } = useAuth();
  const { user } = useAuth();
  const { currentUserRole } = useUserRoles(user?.id);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    signOut();
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleAdminPanel = () => {
    navigate('/admin');
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
    <div className="bg-[#C5A46C] p-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {!isHomePage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              {subtitle && (
                <p className="text-white/80 text-sm">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {currentUserRole && (
              <Badge variant={getRoleBadgeVariant(currentUserRole)} className="bg-white/20 text-white border-white/30">
                {getRoleLabel(currentUserRole)}
              </Badge>
            )}
            
            {(currentUserRole === 'admin' || currentUserRole === 'entrenador') && location.pathname !== '/admin' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAdminPanel}
                className="text-white hover:bg-white/20"
              >
                <Shield className="h-4 w-4 mr-2" />
                {currentUserRole === 'admin' ? 'Admin' : 'Gestión'}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-white hover:bg-white/20"
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
