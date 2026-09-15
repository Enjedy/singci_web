import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../../context/AppContext';
import L from 'leaflet';
import { Search, Navigation, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

// Custom icons using Lucide SVGs wrapped in divIcon
const createCustomIcon = (colorClass: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div class="w-8 h-8 rounded-full ${colorClass} flex items-center justify-center shadow-lg border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const iconPending = createCustomIcon('bg-amber-500');
const iconInProgress = createCustomIcon('bg-blue-500');
const iconResolved = createCustomIcon('bg-emerald-500');

// Mock coordinates for Abidjan/Paris since locations are strings in AppContext
const MOCK_COORDS: Record<string, [number, number]> = {
  'REP-001': [48.8566, 2.3522],
  'REP-002': [48.8584, 2.3488],
  'REP-003': [48.8606, 2.3376],
};

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export default function AdminMap() {
  const { reports } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [center, setCenter] = useState<[number, number]>([48.8566, 2.3522]); // Default center (Paris)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'En attente': return iconPending;
      case 'En cours': return iconInProgress;
      case 'Résolu': return iconResolved;
      default: return iconPending;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En attente': return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> {status}</span>;
      case 'En cours': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><Navigation className="w-3 h-3" /> {status}</span>;
      case 'Résolu': return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {status}</span>;
      default: return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">{status}</span>;
    }
  };

  const reportsWithCoords = reports.map((r, i) => {
    // Only randomize if we don't already have it in MOCK_COORDS to maintain stable keys/coords
    return {
      ...r,
      coords: MOCK_COORDS[r.id] || [
        center[0] + (Math.random() - 0.5) * 0.05,
        center[1] + (Math.random() - 0.5) * 0.05
      ] as [number, number]
    };
  });

  const filteredReports = reportsWithCoords.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Carte Interactive</h1>
          <p className="text-sm text-slate-500">Localisez les incidents et les équipes sur le terrain.</p>
        </div>
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un lieu, une adresse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 z-0 bg-slate-100">
        <MapContainer 
          center={center} 
          zoom={13} 
          zoomControl={false}
          className="w-full h-full"
        >
          <ChangeView center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="bottomright" />

          {filteredReports.map((report) => (
            <Marker 
              key={`marker-${report.id}`} 
              position={report.coords}
              icon={getStatusIcon(report.status)}
            >
              <Popup className="rounded-xl overflow-hidden shadow-lg border-0">
                <div className="p-1 min-w-[200px]">
                  <div className="flex justify-between items-start mb-2">
                    {getStatusBadge(report.status)}
                    {report.priority === 'Haute' && <span className="text-red-600"><AlertCircle className="w-4 h-4" /></span>}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">{report.title}</h3>
                  <p className="text-xs text-slate-500 mb-2 font-medium">{report.location}</p>
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">{report.description}</p>
                  
                  {report.assignedTeam && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Équipe assignée</p>
                      <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block">
                        {report.assignedTeam}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 bg-slate-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-slate-800 transition-colors">
                      Détails
                    </button>
                    <button className="flex-1 bg-emerald-50 text-emerald-700 text-xs font-bold py-2 rounded-lg hover:bg-emerald-100 transition-colors">
                      Itinéraire
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-100 z-[400]">
          <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">Légende</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></span> En attente
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></span> En cours
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></span> Résolu
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
