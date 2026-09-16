import { Outlet, Link, useLocation } from 'react-router';
import { Map, Users, Settings, LogOut, BarChart3, AlertTriangle, MessageSquare, Bot, Home } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppContext } from '../../context/AppContext';

export default function AdminLayout() {
  const location = useLocation();
  const { isAuthenticated, user, authLoading } = useAppContext();

  const navItems = [
    { name: 'Accueil', path: '/admin', icon: Home },
    { name: 'Tableau de bord', path: '/admin/dashboard', icon: BarChart3 },
    { name: 'Signalements', path: '/admin/reports', icon: AlertTriangle },
    { name: 'Carte', path: '/admin/map', icon: Map },
    { name: 'Messagerie', path: '/admin/messages', icon: MessageSquare },
    { name: 'Assistant Devis', path: '/admin/assistant', icon: Bot },
    { name: 'Équipes', path: '/admin/teams', icon: Users },
    { name: 'Paramètres', path: '/admin/settings', icon: Settings },
  ];

  const adminName = user?.email?.split('@')[0] || 'Administrateur';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/40">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">SignCi Admin</h2>
              <p className="text-xs text-slate-400 font-medium">Gestion des signalements</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={clsx(
                    "flex items-center px-4 py-3 rounded-xl transition-all font-medium text-sm",
                    isActive 
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-900/50" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className={clsx("w-5 h-5 mr-3", isActive ? "text-violet-100" : "text-slate-500")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white capitalize">{adminName}</p>
              </div>
            </div>
            <Link
              to="/"
              className="text-slate-500 hover:text-white transition-colors"
              title="Retour à l'accueil"
            >
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Map className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">SignCi Admin</span>
          </div>
          <Link to="/" className="text-slate-300">
            <LogOut className="w-6 h-6" />
          </Link>
        </header>
        
        <div className="flex-1 overflow-auto bg-slate-50 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}