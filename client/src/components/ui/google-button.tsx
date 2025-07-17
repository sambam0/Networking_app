import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

interface GoogleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function GoogleButton({ children, onClick, disabled = false }: GoogleButtonProps) {
  const handleClick = async () => {
    if (onClick) {
      onClick();
    } else {
      // Check if Google OAuth is available
      try {
        const response = await fetch('/api/auth/google', { method: 'HEAD' });
        if (response.status === 501) {
          alert('Google sign-in is not configured yet. Please use email sign-in.');
          return;
        }
        window.location.href = '/api/auth/google';
      } catch (error) {
        window.location.href = '/api/auth/google';
      }
    }
  };

  return (
    <Button 
      type="button"
      variant="outline"
      className="w-full py-4 text-lg border-2 hover:bg-gray-50 dark:hover:bg-gray-900"
      onClick={handleClick}
      disabled={disabled}
    >
      <FcGoogle className="h-5 w-5 mr-3" />
      {children}
    </Button>
  );
}