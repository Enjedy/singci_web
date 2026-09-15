import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext } from '../../context/AppContext';
import { Mail, Lock, ArrowRight, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, register, authError, clearAuthError } = useAppContext();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        await register(formData.email, formData.password);
        setShowConfirmation(true);
      } else {
        await login(formData.email, formData.password);
        navigate('/citizen/home');
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRegistration = () => {
    navigate('/citizen/home');
  };

  if (showConfirmation) {
    return (
      <div className="flex flex-col min-h-screen bg-white justify-center px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-60"></div>
        
        <div className="z-10 bg-white border border-emerald-100 rounded-[2rem] p-8 shadow-xl text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Bienvenue sur Sign.Ci</h2>
          <div className="text-slate-600 space-y-4 text-sm text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p>Votre compte a été créé avec succès. Vous êtes maintenant connecté.</p>
            <ul className="font-semibold text-slate-800 space-y-2 mt-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <li>Votre Mail : <span className="text-blue-600">{formData.email}</span></li>
            </ul>
          </div>
          
          <button 
            onClick={handleConfirmRegistration}
            className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all flex justify-center items-center group"
          >
            Continuer
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white justify-center px-8 relative overflow-hidden py-12">
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-60"></div>

      <div className="z-10 text-center mb-8">
        <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight mb-2">SIGN.CI</h1>
        
        {isRegistering ? (
          <div className="mt-6 text-left bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-2">Pourquoi créer un compte ?</h3>
            <p className="text-sm text-blue-700 leading-relaxed">
              En vous inscrivant sur notre plate-forme, vous aurez la possibilité de faire des signalements à votre commune en seulement quelques clics et ainsi suivre vos tickets jusqu'à leur résolution.
            </p>
          </div>
        ) : (
          <p className="text-slate-500 font-medium">Votre ville, votre voix.</p>
        )}
      </div>

      {authError && (
        <div className="z-10 max-w-sm mx-auto w-full mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{authError}</p>
          <button onClick={clearAuthError} className="ml-auto text-red-400 hover:text-red-600 text-lg">&times;</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="z-10 space-y-5 max-w-sm mx-auto w-full">
        {isRegistering && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Login</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Votre pseudo"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="citoyen@email.com"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1">Mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="password" 
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex justify-center items-center group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Chargement...' : isRegistering ? "S'inscrire" : "Se connecter"}
            {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>

        <div className="text-center mt-6">
          <button 
            type="button" 
            onClick={() => { setIsRegistering(!isRegistering); clearAuthError(); }}
            className="text-blue-600 font-semibold text-sm hover:underline py-2"
          >
            {isRegistering ? "Je possède déjà un compte, je me connecte" : "Créer un compte"}
          </button>
        </div>
      </form>
    </div>
  );
}
