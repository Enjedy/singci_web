import { Link } from 'react-router';
import { PlusCircle, Map, List, User, ShieldAlert } from 'lucide-react';

export default function Welcome() {
  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <header className="bg-blue-600 px-6 pt-12 pb-8 rounded-b-[2rem] shadow-md z-10 sticky top-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
        <h1 className="text-3xl font-bold text-white mb-1">Bienvenue</h1>
        <p className="text-blue-100 font-medium">Prêt à améliorer votre ville ?</p>
      </header>

      <div className="p-6 space-y-4 -mt-4 relative z-20">
        <Link 
          to="/citizen/new"
          className="flex flex-col items-center justify-center p-8 bg-white border-2 border-blue-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all active:scale-[0.98] group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-50/50 group-hover:bg-blue-50 transition-colors"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-8 h-8" />
            </div>
            <span className="text-xl font-bold text-slate-800">Signaler un problème</span>
            <p className="text-slate-500 text-sm text-center mt-2 px-4">Notre IA analysera votre photo et description pour agir plus vite.</p>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-4">
          <Link 
            to="/citizen/map"
            className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Map className="w-8 h-8 text-emerald-500 mb-3" />
            <span className="text-sm font-bold text-slate-700 text-center">Carte des signalements</span>
          </Link>
          
          <Link 
            to="/citizen/history"
            className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <List className="w-8 h-8 text-amber-500 mb-3" />
            <span className="text-sm font-bold text-slate-700 text-center">Mes signalements</span>
          </Link>

          <Link 
            to="/citizen/profile"
            className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <User className="w-8 h-8 text-indigo-500 mb-3" />
            <span className="text-sm font-bold text-slate-700 text-center">Profil citoyen</span>
          </Link>
          
          <Link 
            to="/citizen/alerts"
            className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <ShieldAlert className="w-8 h-8 text-red-500 mb-3" />
            <span className="text-sm font-bold text-slate-700 text-center">Urgences Mairie</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
