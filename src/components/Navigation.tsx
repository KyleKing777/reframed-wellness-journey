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
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;