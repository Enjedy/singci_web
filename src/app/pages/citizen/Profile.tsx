import { useNavigate } from 'react-router';
import { User, Mail, Phone, MapPin, Award, LogOut, Settings, Bell, Shield, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function Profile() {
  const { logout, reports } = useAppContext();
  const navigate = useNavigate();

  // Mock user data
  const user = {
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    city: 'Abidjan, Cocody',
    role: 'Citoyen Engagé',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    joinDate: 'Janvier 2026'
  };

  // Stats from context (filtering by mock citizen ID)
  const myReports = reports.filter(r => r.citizenId === 'CIT-123');
  const resolvedReports = myReports.filter(r => r.status === 'Résolu');

  const handleLogout = async () => {
    await logout();
    navigate('/citizen/home');
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 pb-24">
      {/* Header Profile Section */}
      <div className="bg-blue-600 px-6 pt-12 pb-24 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-xl -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden mb-3 relative shadow-lg">
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <div className="flex items-center mt-1 bg-white/20 px-3 py-1 rounded-full border border-white/10">
            <Award className="w-4 h-4 text-amber-300 mr-1.5" />
            <span className="text-sm text-blue-50 font-medium">{user.role}</span>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-16 relative z-20 space-y-6">
        {/* Stats Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-around">
          <div className="text-center flex-1 border-r border-slate-100">
            <p className="text-3xl font-bold text-slate-800">{myReports.length}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Signalements</p>
          </div>
          <div className="text-center flex-1">
            <div className="flex items-center justify-center">
              <p className="text-3xl font-bold text-emerald-600">{resolvedReports.length}</p>
              {resolvedReports.length > 0 && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-1" />}
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">Résolus</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-50">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Informations personnelles</h2>
          </div>
          <div className="p-2">
            <div className="flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4 text-blue-600 flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">Adresse email</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mr-4 text-emerald-600 flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">Téléphone</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mr-4 text-amber-600 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">Ville / Quartier</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{user.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences / Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-50">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Préférences</h2>
          </div>
          <div className="p-2">
            <button className="w-full flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-4 text-slate-600 flex-shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-slate-800">Modifier le profil</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
            <button className="w-full flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-4 text-slate-600 flex-shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-slate-800">Notifications</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
            <button className="w-full flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-4 text-slate-600 flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-slate-800">Mot de passe & Sécurité</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full mt-4 bg-white border-2 border-red-50 hover:bg-red-50 text-red-600 font-bold py-4 rounded-xl active:scale-[0.98] transition-all flex justify-center items-center group"
        >
          <LogOut className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
