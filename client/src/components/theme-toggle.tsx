import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full border-2 bg-background/80 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-2xl hover:bg-background hover:scale-110 hover:border-primary/50 active:scale-95"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-500 transition-all duration-300 hover:text-yellow-400 hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300 transition-all duration-300 hover:text-slate-600 hover:rotate-12" />
      )}
    </Button>
  );
}