import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAppContext, Report, ReportStatus, ReportPriority } from '../../context/AppContext';
import { Search, Filter, MapPin, X, Sparkles, Building, Map as MapIcon, ArrowRight, Phone, Clock, Users, Wrench, Zap, MessageSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReportImage from '../../components/figma/ReportImage';
import { estimateWork } from '../../services/QuoteService';

export default function ManageReports() {
  const { reports, updateReportStatus, updateReportPriority, assignTeam, deleteReport } = useAppContext();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('status') || 'Tous');
  const [filterPriority, setFilterPriority] = useState<string>(searchParams.get('priority') || 'Toutes');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Report | null>(null);

  // Réagit quand on clique sur une carte du tableau de bord
  useEffect(() => {
    setFilterStatus(searchParams.get('status') || 'Tous');
    setFilterPriority(searchParams.get('priority') || 'Toutes');
  }, [searchParams]);

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Tous' || r.status === filterStatus;
    const matchesPriority = filterPriority === 'Toutes' || r.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
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
    'Équipe Électrique Nord',
    'Équipe Éclairage Sud',
    'Équipe Éclairage Centre',
    'Prestataire Éclairage',
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
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none shadow-sm text-sm flex-1 md:flex-none"
            >
              <option value="Toutes">Toutes priorités</option>
              <option value="Haute">Priorité Haute</option>
              <option value="Moyenne">Priorité Moyenne</option>
              <option value="Basse">Priorité Basse</option>
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
                  <tr
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-center">
                        <ReportImage src={report.imageUrl} alt={report.title} className="w-10 h-10 rounded-lg object-cover mr-3 hidden lg:block" />
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
                        onClick={(e) => e.stopPropagation()}
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
                        onClick={(e) => e.stopPropagation()}
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
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleTeamChange(report.id, e)}
                        className="text-sm px-2 py-1.5 rounded border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-700 max-w-[160px] truncate"
                      >
                        {teams.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedReport(report); }}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-lg transition-colors flex items-center"
                        >
                          Voir détails <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(report); }}
                          title="Supprimer le signalement"
                          className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Report Detail Modal (affiché comme un post) ---- */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onChangeStatus={(s) => updateReportStatus(selectedReport.id, s)}
          onChangePriority={(p) => updateReportPriority(selectedReport.id, p)}
          onChangeTeam={(t) => assignTeam(selectedReport.id, t)}
          onDelete={(r) => { setSelectedReport(null); setConfirmDelete(r); }}
          teams={teams}
        />
      )}

      {/* ---- Confirmation suppression ---- */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Supprimer ce signalement ?</h3>
            <p className="text-sm text-slate-500 mt-2">
              Le signalement « {confirmDelete.title} » sera définitivement supprimé.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                Annuler
              </button>
              <button
                onClick={() => { deleteReport(confirmDelete.id); setConfirmDelete(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================== Détail signalement =========================== */

const statusStyle: Record<ReportStatus, string> = {
  'En attente': 'bg-amber-50 text-amber-700 border-amber-200',
  'En cours': 'bg-blue-50 text-blue-700 border-blue-200',
  'Résolu': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const priorityStyle: Record<ReportPriority, string> = {
  Haute: 'bg-red-50 text-red-700 border-red-200',
  Moyenne: 'bg-orange-50 text-orange-700 border-orange-200',
  Basse: 'bg-slate-50 text-slate-700 border-slate-200',
};

function ReportDetailModal({
  report,
  onClose,
  onChangeStatus,
  onChangePriority,
  onChangeTeam,
  onDelete,
  teams,
}: {
  report: Report;
  onClose: () => void;
  onChangeStatus: (s: ReportStatus) => void;
  onChangePriority: (p: ReportPriority) => void;
  onChangeTeam: (t: string) => void;
  onDelete: (r: Report) => void;
  teams: string[];
}) {
  const navigate = useNavigate();
  const estimate = estimateWork(report.category, report.subCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Post header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center mr-3">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Citoyen {report.citizenId || '·'}</p>
              <p className="text-xs text-slate-400">{format(new Date(report.date), 'dd MMM yyyy à HH:mm', { locale: fr })}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post image */}
        <div className="w-full h-56 bg-slate-100">
          <ReportImage src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
        </div>

        {/* Post body */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${report.signalType === 'Bâtiment communal' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
              {report.signalType === 'Bâtiment communal' ? <Building className="w-3.5 h-3.5 mr-1" /> : <MapIcon className="w-3.5 h-3.5 mr-1" />}
              {report.signalType}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
              {report.category}
            </span>
            {report.subCategory && (
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                {report.subCategory}
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusStyle[report.status]}`}>
              {report.status}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${priorityStyle[report.priority]}`}>
              Priorité {report.priority}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center">
              {report.title}
              {report.aiAnalyzed && <Sparkles className="w-4 h-4 text-indigo-500 ml-2" />}
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">{report.description}</p>
          </div>

          <div className="flex items-start text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-emerald-600 flex-shrink-0" />
            <span>{report.location}</span>
          </div>

          {/* Travaux estimés */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center">
                <Wrench className="w-4 h-4 mr-1.5" /> Estimation des travaux
              </p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {estimate.complexity}
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              {estimate.lines.map((l, i) => (
                <div key={i} className="flex items-start">
                  <Zap className="w-3.5 h-3.5 mr-2 text-amber-500 flex-shrink-0 mt-px" />
                  <span>{l.label}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-amber-700 pt-1 border-t border-emerald-100">
                <span>Moyens / main d'œuvre</span>
                <span className="text-right max-w-[55%]">{estimate.mainWork}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic mt-2">⏱️ {estimate.delay} · {estimate.disclaimer}</p>
          </div>

          {/* Assignment controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Statut</span>
              <select
                value={report.status}
                onChange={(e) => onChangeStatus(e.target.value as ReportStatus)}
                className="mt-1 w-full text-xs font-semibold px-2.5 py-2 rounded-lg border outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
              >
                <option value="En attente">En attente</option>
                <option value="En cours">En cours</option>
                <option value="Résolu">Résolu</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Priorité</span>
              <select
                value={report.priority}
                onChange={(e) => onChangePriority(e.target.value as ReportPriority)}
                className="mt-1 w-full text-xs font-semibold px-2.5 py-2 rounded-lg border outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Basse">Basse</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Haute">Haute</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Équipe</span>
              <select
                value={report.assignedTeam || 'Non assigné'}
                onChange={(e) => onChangeTeam(e.target.value)}
                className="mt-1 w-full text-xs font-semibold px-2.5 py-2 rounded-lg border outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
              >
                {teams.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          </div>

          {report.assignedTeam && (
            <div className="flex items-center text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
              <Users className="w-4 h-4 mr-2 text-slate-400" />
              Assigné à : <strong className="ml-1">{report.assignedTeam}</strong>
            </div>
          )}

          <div className="flex gap-3 pt-1 border-t border-slate-100">
            <button onClick={() => navigate(`/admin/messages?report=${report.id}`)} className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-white bg-gradient-to-br from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 py-2.5 rounded-xl shadow-lg shadow-violet-200 transition-all active:scale-[0.98]">
              <MessageSquare className="w-4 h-4" /> Discuter avec l'auteur
            </button>
            <button onClick={() => navigate('/admin/assistant')} className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl transition-colors">
              <Wrench className="w-4 h-4 text-emerald-600" /> Estimer les travaux
            </button>
          </div>
          <button onClick={() => navigate('/admin/messages')} className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 py-2 rounded-lg transition-colors">
            <Phone className="w-3.5 h-3.5" /> Contacter l'équipe assignée ({report.assignedTeam || 'Équipe Électrique Nord'})
          </button>
          <button onClick={() => onDelete(report)} className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Supprimer ce signalement
          </button>

          <p className="text-[10px] text-slate-400 text-center flex items-center justify-center">
            <Clock className="w-3 h-3 mr-1" /> Demandé le {format(new Date(report.date), 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>
      </div>
    </div>
  );
}