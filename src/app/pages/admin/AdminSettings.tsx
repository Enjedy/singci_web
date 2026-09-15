import { useState } from 'react';
import { Settings as SettingsIcon, Globe, Map as MapIcon, Users, Bell, Shield, Image as ImageIcon, Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaved, setIsSaved] = useState(false);

  const tabs = [
    { id: 'general', name: 'Général', icon: Globe },
    { id: 'users', name: 'Utilisateurs', icon: Users },
    { id: 'security', name: 'Sécurité', icon: Shield },
    { id: 'map', name: 'Carte', icon: MapIcon },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Paramètres du système</h1>
          <p className="text-slate-500 mt-2">Configurez la plateforme AdminCity selon les besoins de la mairie.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all flex items-center"
        >
          {isSaved ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          {isSaved ? 'Enregistré !' : 'Enregistrer'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium text-sm w-full text-left ${
                  activeTab === tab.id 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[500px]">
          
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-slate-400" /> Paramètres Généraux
                </h2>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nom du système</label>
                    <input type="text" defaultValue="AdminCity - Plateforme Maire" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Logo de l'application</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      </div>
                      <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">
                        Changer le logo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Langue par défaut</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                        <option>Français</option>
                        <option>Anglais</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Fuseau horaire</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                        <option>Europe/Paris (UTC+1)</option>
                        <option>Africa/Abidjan (GMT)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-slate-400" /> Gestion des utilisateurs
                </h2>
                <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800">
                  + Nouvel Admin
                </button>
              </div>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Utilisateur</th>
                      <th className="px-4 py-3">Rôle</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    <tr>
                      <td className="px-4 py-4 font-medium text-slate-800">Admin Principal</td>
                      <td className="px-4 py-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Super Admin</span></td>
                      <td className="px-4 py-4 text-slate-400">Gérer</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 font-medium text-slate-800">Chef Service Voirie</td>
                      <td className="px-4 py-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Modérateur</span></td>
                      <td className="px-4 py-4 text-slate-400">Gérer</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-8 animate-in fade-in">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <MapIcon className="w-6 h-6 mr-2 text-slate-400" /> Paramètres de la carte
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Fournisseur de carte</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option>OpenStreetMap (Défaut)</option>
                    <option>Google Maps</option>
                    <option>Mapbox</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div>
                    <h4 className="font-bold text-slate-800">Géolocalisation automatique</h4>
                    <p className="text-xs text-slate-500 mt-1">Activer la détection GPS sur le terrain pour les équipes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div>
                    <h4 className="font-bold text-slate-800">Afficher la zone d'intervention</h4>
                    <p className="text-xs text-slate-500 mt-1">Délimiter les limites de la commune sur la carte</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <Bell className="w-6 h-6 mr-2 text-slate-400" /> Centre de Notifications
              </h2>
              
              <div className="space-y-4">
                {[
                  { title: "Nouveau signalement (Haute priorité)", desc: "Recevoir un email immédiat quand l'IA détecte une urgence." },
                  { title: "Mise à jour de statut", desc: "Alerte quand une équipe passe un ticket en 'Résolu'." },
                  { title: "Rapport hebdomadaire", desc: "Résumé automatique envoyé tous les lundis matins." }
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                    <div>
                      <h4 className="font-bold text-slate-800">{notif.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={i === 0} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-slate-400" /> Sécurité
              </h2>
              
              <div className="space-y-6">
                <div className="p-5 border border-slate-200 rounded-xl space-y-4">
                  <h3 className="font-bold text-slate-800">Changer de mot de passe</h3>
                  <div className="space-y-3">
                    <input type="password" placeholder="Mot de passe actuel" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                    <input type="password" placeholder="Nouveau mot de passe" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">Mettre à jour</button>
                  </div>
                </div>
                
                <div className="p-5 border border-slate-200 rounded-xl">
                  <h3 className="font-bold text-slate-800 mb-4">Historique des connexions récentes</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-2">
                      <span>Aujourd'hui à 08:30</span>
                      <span>IP: 192.168.1.1</span>
                    </div>
                    <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-2">
                      <span>Hier à 14:15</span>
                      <span>IP: 192.168.1.45</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
