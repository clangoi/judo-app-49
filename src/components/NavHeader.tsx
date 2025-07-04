
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavHeaderProps {
  title: string;
  subtitle?: string;
}

const NavHeader = ({ title, subtitle }: NavHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm border-b p-4 mb-6">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {subtitle && (
            <p className="text-slate-600">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavHeader;
