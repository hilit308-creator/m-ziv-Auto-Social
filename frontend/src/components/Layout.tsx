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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-full">
        <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-pink-500">
          <h1 className="text-2xl font-bold text-white">M-Ziv Social</h1>
          <p className="text-sm text-purple-100">אוטומציה לרשתות חברתיות</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-purple-50 text-purple-600' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 mr-64 p-8">
        {children}
      </main>
    </div>
  );
}
