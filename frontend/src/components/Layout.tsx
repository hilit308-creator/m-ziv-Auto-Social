import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings, 
  Share2,
  Lightbulb,
  MessageSquare,
  Video
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'דשבורד', href: '/', icon: LayoutDashboard },
  { name: 'פוסטים', href: '/posts', icon: FileText },
  { name: 'וידאו', href: '/video', icon: Video },
  { name: 'לוח תוכן', href: '/calendar', icon: Calendar },
  { name: 'רעיונות', href: '/ideas', icon: Lightbulb },
  { name: 'אנליטיקה', href: '/analytics', icon: BarChart3 },
  { name: 'חיבורים', href: '/connections', icon: Share2 },
  { name: 'מענה אוטומטי', href: '/auto-reply', icon: MessageSquare },
  { name: 'הגדרות', href: '/settings', icon: Settings },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-mziv-section flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white fixed h-full border-l border-mziv-border">
        <div className="p-4 border-b border-mziv-border">
          <img 
            src="/logo.png" 
            alt="מרכז זיו" 
            className="h-12 w-auto"
          />
        </div>
        
        <nav className="p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                      isActive 
                        ? 'bg-brand-light text-brand-primary' 
                        : 'text-mziv-text-secondary hover:bg-mziv-section'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-primary rounded-l"></div>
                    )}
                    <item.icon size={20} className={isActive ? 'text-brand-primary' : ''} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 mr-64 p-8 bg-mziv-section">
        {children}
      </main>
    </div>
  );
}
