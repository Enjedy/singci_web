import { MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CitizenDashboard() {
  const { reports } = useAppContext();
  
  // Filter for the mock citizen
  const myReports = reports.filter(r => r.citizenId === 'CIT-123');

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'En attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'En cours': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Résolu': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'En attente': return <Clock className="w-4 h-4 mr-1.5" />;
      case 'En cours': return <AlertCircle className="w-4 h-4 mr-1.5" />;
      case 'Résolu': return <CheckCircle2 className="w-4 h-4 mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <header className="bg-white px-6 pt-12 pb-4 shadow-sm z-10 sticky top-0">
        <h1 className="text-2xl font-bold text-slate-800">Mes Signalements</h1>
        <p className="text-sm text-slate-500 mt-1">{myReports.length} signalements effectués</p>
      </header>

      <div className="p-4 space-y-4">
        {myReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <CheckCircle2 className="w-16 h-16 mb-4 opacity-50" />
            <p>Vous n'avez aucun signalement en cours.</p>
          </div>
        ) : (
          myReports.map(report => (
            <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              {report.imageUrl && (
                <div className="h-40 w-full overflow-hidden">
                  <img 
                    src={report.imageUrl} 
                    alt={report.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    {report.status}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {format(new Date(report.date), 'dd MMM yyyy', { locale: fr })}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{report.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{report.description}</p>
                
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <div className="flex items-center max-w-[70%]">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0 text-slate-400" />
                    <span className="truncate">{report.location}</span>
                  </div>
                  <span className="bg-slate-100 px-2 py-1 rounded-md font-medium text-slate-600 truncate max-w-[30%]">
                    {report.category}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
