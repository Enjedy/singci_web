import { useState } from 'react';
import { MapPin, Sparkles, Building, Map as MapIcon, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import ReportImage from '../../components/figma/ReportImage';
import { Report } from '../../context/AppContext';

export default function History() {
  const { reports, deleteReport } = useAppContext();
  const [confirmDelete, setConfirmDelete] = useState<Report | null>(null);
  
  // Filter for the mock citizen
  const myReports = reports.filter(r => r.citizenId === 'CIT-123');

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'En attente': return 'text-amber-500';
      case 'En cours': return 'text-blue-500';
      case 'Résolu': return 'text-emerald-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 pb-20">
      <header className="bg-white px-6 pt-12 pb-4 shadow-sm z-10 sticky top-0">
        <h1 className="text-2xl font-bold text-slate-800">Mes signalements</h1>
        <p className="text-sm text-slate-500 mt-1">Suivez vos tickets jusqu'à leur résolution</p>
      </header>

      <div className="p-4 bg-white min-h-[500px]">
        {myReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center px-4">
            <p>Vous n'avez aucun signalement en cours.</p>
            <p className="text-sm mt-2">Contribuez à améliorer votre ville en créant votre premier ticket.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {myReports.map(report => (
              <li key={report.id} className="py-5 flex flex-col hover:bg-slate-50 transition-colors px-2 rounded-xl">
                <div className="flex items-start">
                  <div className={`mt-1.5 mr-3 w-3 h-3 rounded-full flex-shrink-0 ${getStatusColor(report.status).replace('text-', 'bg-')}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-800 truncate pr-2">{report.title}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(report.status).replace('text-', 'bg-').replace('500', '100')} ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
                      {report.signalType === 'Bâtiment communal' ? (
                        <span className="flex items-center text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded"><Building className="w-3 h-3 mr-1" /> {report.category}</span>
                      ) : (
                        <span className="flex items-center text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded"><MapIcon className="w-3 h-3 mr-1" /> {report.category}</span>
                      )}
                      {report.subCategory && <span>• {report.subCategory}</span>}
                    </div>

                    <div className="flex items-center text-xs text-slate-400 mt-2">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      <span className="truncate">{report.location}</span>
                    </div>
                    
                    {report.assignedTeam && (
                      <p className="text-xs text-slate-500 mt-2 bg-slate-100 inline-block px-2 py-1 rounded-md">
                        Assigné à : <strong>{report.assignedTeam}</strong>
                      </p>
                    )}
                  </div>
                  <div className="ml-3 flex flex-col items-end justify-between flex-shrink-0">
                    <div className="w-16 h-16 overflow-hidden rounded-xl">
                      <ReportImage src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={() => setConfirmDelete(report)}
                      title="Supprimer ce signalement"
                      className="mt-2 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
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