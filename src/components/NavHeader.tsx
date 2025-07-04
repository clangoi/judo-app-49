
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NavHeaderProps {
  title: string;
  subtitle?: string;
}

const NavHeader = ({ title, subtitle }: NavHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-[#C5A46C]">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-[#C5A46C] hover:text-[#B8956A] hover:bg-[#C5A46C]/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#C5A46C] rounded-full flex items-center justify-center text-white font-bold">
              RC
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A]">{title}</h1>
              {subtitle && <p className="text-sm text-[#575757]">{subtitle}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavHeader;
