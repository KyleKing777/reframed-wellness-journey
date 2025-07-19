import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, MessageCircle, TrendingUp, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/meals', icon: Calendar, label: 'Meals' },
    { to: '/chat', icon: MessageCircle, label: 'Support' },
    { to: '/health', icon: TrendingUp, label: 'Health' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50">
      <div className="flex items-center justify-around px-6 py-4">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 transition-fast",
                isActive 
                  ? "text-foreground" 
                  : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;