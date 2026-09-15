import { Outlet, Link, useLocation, Navigate } from 'react-router';
import { Home, PlusCircle, List, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppContext } from '../../context/AppContext';
import Login from './Login';

export default function CitizenLayout() {
  const location = useLocation();
  const { isAuthenticated, authLoading } = useAppContext();

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white justify-center items-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Chargement...</p>
      </div>
    );
  }

  // If not authenticated, render Login unconditionally
  if (!isAuthenticated) {
    return <Login />;
  }

  const navItems = [
    { name: 'Accueil', path: '/citizen/home', icon: Home },
    { name: 'Signaler', path: '/citizen/new', icon: PlusCircle },
    { name: 'Historique', path: '/citizen/history', icon: List },
    { name: 'Profil', path: '/citizen/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center pb-20 sm:pb-0">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative sm:my-8 sm:rounded-[2rem] sm:min-h-[850px] overflow-hidden flex flex-col">
        {/* Mock Top Status Bar */}
        <div className="hidden sm:flex bg-black text-white px-6 py-2 justify-between items-center text-xs font-medium sticky top-0 z-50">
          <span>9:41</span>
          <div className="flex space-x-2">
            <span>Signal</span>
            <span>LTE</span>
            <span>100%</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-slate-100 pb-safe fixed sm:absolute bottom-0 w-full z-40 shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.1)]">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link 
                  key={item.name} 
                  to={item.path}
                  className={clsx(
                    "flex flex-col items-center justify-center w-full h-full relative transition-colors",
                    isActive ? "text-blue-600" : "text-slate-400 hover:text-blue-400"
                  )}
                >
                  {isActive && <div className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full"></div>}
                  <item.icon className="h-6 w-6 mb-1 mt-1" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-bold">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
