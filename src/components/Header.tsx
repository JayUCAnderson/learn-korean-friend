
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Goodbye! 안녕히 가세요!",
        description: "You've been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo and title */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-korean-600">KoreanPal</span>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 hover:bg-korean-50"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 hover:bg-korean-50"
            >
              Logout
            </Button>
          </nav>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <nav className="py-4 border-t border-gray-100">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 hover:bg-korean-50"
              >
                Logout
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
