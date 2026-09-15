import { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Building2, MapPin, Phone, Mail, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  type: string;
  manager: string;
  address: string;
  phone: string;
  email: string;
  status: 'Actif' | 'Inactif' | 'En pause';
}

const initialTeams: Team[] = [
  {
    id: 'TEAM-1',
    name: 'Équipe Voirie N1',
    type: 'Service Municipal',
    manager: 'Marc Dubois',
    address: 'Centre technique, Bâtiment A',
    phone: '01 23 45 67 89',
    email: 'voirie@ville.fr',
    status: 'Actif'
  },
  {
    id: 'TEAM-2',
    name: 'Équipe Électrique Nord',
    type: 'Entreprise Partenaire',
    manager: 'Sophie Leroy',
    address: '15 rue de l\'Industrie',
    phone: '01 98 76 54 32',
    email: 'contact@elecnord.fr',
    status: 'Actif'
  },
  {
    id: 'TEAM-3',
    name: 'Service Nettoyage',
    type: 'Service Municipal',
    manager: 'Karim Haddad',
    address: 'Centre technique, Bâtiment B',
    phone: '01 23 45 67 90',
    email: 'proprete@ville.fr',
    status: 'Actif'
  },
  {
    id: 'TEAM-4',
    name: 'Plomberie Express (Urgence)',
    type: 'Prestataire Externe',
    manager: 'Julien Morel',
    address: 'Zone Artisanale Est',
    phone: '06 12 34 56 78',
    email: 'urgences@plomberie-express.fr',
    status: 'En pause'
  }
];

export default function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          team.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Tous' || team.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Actif': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Inactif': return 'bg-red-100 text-red-700 border-red-200';
      case 'En pause': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Gestion des Équipes</h1>
          <p className="text-slate-500 mt-2">Gérez les partenaires, services et entreprises qui interviennent.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Ajouter une équipe
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher une organisation, un responsable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm text-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-5 h-5 text-slate-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm text-sm flex-1 md:flex-none"
            >
              <option value="Tous">Tous les types</option>
              <option value="Service Municipal">Service Municipal</option>
              <option value="Entreprise Partenaire">Entreprise Partenaire</option>
              <option value="Prestataire Externe">Prestataire Externe</option>
            </select>
          </div>
        </div>

        {/* Grid of Teams */}
        <div className="p-6 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div key={team.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 block">
                      {team.type}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{team.name}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button className="text-slate-400 hover:text-emerald-600 transition-colors p-1">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getStatusColor(team.status)}`}>
                      {team.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex items-start">
                    <Building2 className="w-5 h-5 text-slate-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Responsable</p>
                      <p className="text-sm font-medium text-slate-800">{team.manager}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-slate-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Adresse</p>
                      <p className="text-sm font-medium text-slate-800">{team.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-slate-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Téléphone</p>
                      <p className="text-sm font-medium text-slate-800">{team.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-slate-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Email</p>
                      <p className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">{team.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                  <button className="flex-1 bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2 rounded-xl hover:bg-slate-50 transition-colors flex justify-center items-center">
                    <Edit2 className="w-4 h-4 mr-2" /> Modifier
                  </button>
                  <button className="px-4 bg-white border border-red-200 text-red-600 py-2 rounded-xl hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredTeams.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                Aucune équipe trouvée correspondant à vos critères.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
