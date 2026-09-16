import { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Building2, MapPin, Phone, Mail, Edit2, Trash2, X, Check, Users } from 'lucide-react';

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

const emptyForm = {
  name: '',
  type: 'Service Municipal',
  manager: '',
  address: '',
  phone: '',
  email: '',
  status: 'Actif' as Team['status'],
};

export default function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditing(team);
    setForm({
      name: team.name,
      type: team.type,
      manager: team.manager,
      address: team.address,
      phone: team.phone,
      email: team.email,
      status: team.status,
    });
    setMenuId(null);
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.manager.trim()) {
      showToast('Veuillez renseigner au minimum le nom et le responsable.');
      return;
    }
    if (editing) {
      setTeams(prev => prev.map(t => t.id === editing.id ? { ...editing, ...form } : t));
      showToast('Équipe mise à jour ✓');
    } else {
      const newTeam: Team = {
        ...form,
        id: `TEAM-${Date.now()}`,
      };
      setTeams(prev => [...prev, newTeam]);
      showToast('Équipe ajoutée ✓');
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setTeams(prev => prev.filter(t => t.id !== deleteId));
      showToast('Équipe supprimée');
    }
    setDeleteId(null);
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          team.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Tous' || team.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Inactif': return 'bg-red-100 text-red-700 border-red-200';
      case 'En pause': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const inputCls = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm text-sm";
  const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Gestion des Équipes</h1>
          <p className="text-slate-500 mt-2">Gérez les partenaires, services et entreprises qui interviennent.</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all flex items-center"
        >
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
                  <div className="flex flex-col items-end gap-2 relative">
                    <button onClick={() => setMenuId(menuId === team.id ? null : team.id)} className="text-slate-400 hover:text-emerald-600 transition-colors p-1">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {menuId === team.id && (
                      <div className="absolute right-0 top-9 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40">
                        <button onClick={() => openEdit(team)} className="w-full flex items-center text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <Edit2 className="w-4 h-4 mr-2 text-slate-400" /> Modifier
                        </button>
                        <button onClick={() => { setDeleteId(team.id); setMenuId(null); }} className="w-full flex items-center text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                        </button>
                      </div>
                    )}
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
                  <button onClick={() => openEdit(team)} className="flex-1 bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2 rounded-xl hover:bg-slate-50 transition-colors flex justify-center items-center">
                    <Edit2 className="w-4 h-4 mr-2" /> Modifier
                  </button>
                  <button onClick={() => setDeleteId(team.id)} className="px-4 bg-white border border-red-200 text-red-600 py-2 rounded-xl hover:bg-red-50 transition-colors">
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

      {/* ---- Modal Ajouter / Modifier ---- */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setFormOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <h3 className="font-bold">{editing ? 'Modifier l\'équipe' : 'Ajouter une équipe'}</h3>
              </div>
              <button onClick={() => setFormOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Nom de l'équipe *</label>
                <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex : Équipe Voirie N2" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Type</label>
                  <select className={inputCls} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option>Service Municipal</option>
                    <option>Entreprise Partenaire</option>
                    <option>Prestataire Externe</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Statut</label>
                  <select className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Team['status'] })}>
                    <option>Actif</option>
                    <option>En pause</option>
                    <option>Inactif</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Responsable *</label>
                <input className={inputCls} value={form.manager} onChange={e => setForm({ ...form, manager: e.target.value })} placeholder="Nom du responsable" required />
              </div>
              <div>
                <label className={labelCls}>Adresse</label>
                <input className={inputCls} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Adresse du service / entreprise" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Téléphone</label>
                  <input className={inputCls} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="06 00 00 00 00" />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input className={inputCls} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contact@ville.fr" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setFormOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all">
                  <Check className="w-4 h-4" /> {editing ? 'Enregistrer' : 'Ajouter l\'équipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Confirmation suppression ---- */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Supprimer cette équipe ?</h3>
            <p className="text-sm text-slate-500 mt-2">
              L'équipe « {teams.find(t => t.id === deleteId)?.name} » ne pourra plus être assignée à des signalements.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                Annuler
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl animate-in fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}