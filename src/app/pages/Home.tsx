import { Link } from 'react-router';
import { Smartphone, MonitorSmartphone, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Plateforme de Signalement Citoyen
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Choisissez votre espace pour continuer. Cette plateforme permet aux citoyens de signaler des problèmes et aux administrateurs de les gérer efficacement.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Citizen Card */}
        <Link 
          to="/citizen"
          className="group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-md hover:border-blue-300 transition-all text-left flex flex-col items-start"
        >
          <div className="bg-blue-100 p-4 rounded-xl mb-6 text-blue-600 group-hover:scale-110 transition-transform">
            <Smartphone size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Espace Citoyen</h2>
          <p className="text-slate-600 mb-8 flex-grow">
            Signalez un problème dans votre ville, ajoutez des photos, envoyez votre localisation et suivez l'avancement de vos signalements.
          </p>
          <div className="flex items-center text-blue-600 font-medium">
            Ouvrir l'application mobile <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Admin Card */}
        <Link 
          to="/admin"
          className="group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-md hover:border-emerald-300 transition-all text-left flex flex-col items-start"
        >
          <div className="bg-emerald-100 p-4 rounded-xl mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
            <MonitorSmartphone size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Espace Administrateur</h2>
          <p className="text-slate-600 mb-8 flex-grow">
            Gérez les signalements, modifiez les statuts, priorisez les interventions, attribuez des équipes et consultez les statistiques.
          </p>
          <div className="flex items-center text-emerald-600 font-medium">
            Accéder au tableau de bord <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
