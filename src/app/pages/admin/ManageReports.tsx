import { useState } from 'react';
import { useAppContext, ReportStatus, ReportPriority } from '../../context/AppContext';
import { Search, Filter, MapPin, MoreVertical, Edit2, Sparkles, Building, Map as MapIcon, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ManageReports() {
  const { reports, updateReportStatus, updateReportPriority, assignTeam } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Tous');

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Tous' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    updateReportStatus(id, e.target.value as ReportStatus);
  };

  const handlePriorityChange = (id: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    updateReportPriority(id, e.target.value as ReportPriority);
  };

  const handleTeamChange = (id: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    assignTeam(id, e.target.value);
  };

  const teams = [
    'Équipe Voirie N1', 
    'Équipe Électrique Nord', 
    'Service Nettoyage', 
    'Service Plomberie',
    'Maintenance Bâtiments',
    'Équipe Polyvalente',
    'Non assigné'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Gestion des signalements</h1>
          <p className="text-slate-500 mt-2">Traitez, assignez et suivez les incidents de la ville.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher par titre, adresse, catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm text-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-5 h-5 text-slate-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm text-sm flex-1 md:flex-none"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="En cours">En cours</option>
              <option value="Résolu">Résolus</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4">Signalement</th>
                <th className="px-6 py-4">Lieu & Catégorie</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Priorité (IA)</th>
                <th className="px-6 py-4">Équipe (Auto)</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Aucun signalement trouvé.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-center">
                        {report.imageUrl ? (
                          <img src={report.imageUrl} alt={report.title} className="w-10 h-10 rounded-lg object-cover mr-3 hidden lg:block" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mr-3 hidden lg:block">
                            <MapPin className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1 flex items-center">
                            {report.title}
                            {report.aiAnalyzed && (
                              <span title="Analysé par l'IA" className="ml-2 text-indigo-500">
                                <Sparkles className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </p>
                          <div className="flex items-center text-xs text-slate-500 mt-1">
                            <span className="truncate">{format(new Date(report.date), 'dd MMM yyyy HH:mm', { locale: fr })}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-semibold ${report.signalType === 'Bâtiment communal' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`}>
                          {report.signalType === 'Bâtiment communal' ? <Building className="w-3 h-3 mr-1" /> : <MapIcon className="w-3 h-3 mr-1" />}
                          {report.signalType}
                        </span>
                        <div className="text-xs font-medium text-slate-700 flex items-center mt-1">
                          {report.category}
                          {report.subCategory && <><ArrowRight className="w-3 h-3 mx-1 text-slate-400" /> <span className="text-slate-500">{report.subCategory}</span></>}
                        </div>
                        <div className="flex items-center text-xs text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 mr-1 inline" />
                          <span className="truncate max-w-[150px]">{report.location}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.id, e)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500 appearance-none
                          ${report.status === 'En attente' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            report.status === 'En cours' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                      >
                        <option value="En attente">En attente</option>
                        <option value="En cours">En cours</option>
                        <option value="Résolu">Résolu</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={report.priority}
                        onChange={(e) => handlePriorityChange(report.id, e)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 appearance-none
                          ${report.priority === 'Haute' ? 'bg-red-50 text-red-700 border-red-200' : 
                            report.priority === 'Moyenne' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                            'bg-slate-50 text-slate-700 border-slate-200'}`}
                      >
                        <option value="Basse">Basse</option>
                        <option value="Moyenne">Moyenne</option>
                        <option value="Haute">Haute</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={report.assignedTeam || 'Non assigné'}
                        onChange={(e) => handleTeamChange(report.id, e)}
                        className="text-sm px-2 py-1.5 rounded border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-700 max-w-[160px] truncate"
                      >
                        {teams.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Voir les détails">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
