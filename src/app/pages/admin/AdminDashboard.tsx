import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, Clock, CheckCircle2, TrendingUp, Users, Sparkles, MapPin, Zap } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const { reports } = useAppContext();

  // Statistics Calculation
  const totalReports = reports.length;
  const pending = reports.filter(r => r.status === 'En attente').length;
  const inProgress = reports.filter(r => r.status === 'En cours').length;
  const resolved = reports.filter(r => r.status === 'Résolu').length;

  const categoryCount = reports.reduce((acc, report) => {
    acc[report.category] = (acc[report.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.keys(categoryCount).map(key => ({
    name: key,
    value: categoryCount[key]
  }));

  // Mock data for weekly trend
  const trendData = [
    { name: 'Lun', reports: 4, id: 'mon' },
    { name: 'Mar', reports: 7, id: 'tue' },
    { name: 'Mer', reports: 5, id: 'wed' },
    { name: 'Jeu', reports: 8, id: 'thu' },
    { name: 'Ven', reports: 12, id: 'fri' },
    { name: 'Sam', reports: 6, id: 'sat' },
    { name: 'Dim', reports: Math.max(1, reports.length % 5), id: 'sun' },
  ];

  const StatCard = ({ title, value, icon: Icon, colorClass, bgColor }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 ${bgColor} ${colorClass}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 leading-none">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 mt-2">Suivi en temps réel et analyse intelligente des signalements.</p>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-2">
            <Sparkles className="w-6 h-6 text-indigo-200 mr-2" />
            <h2 className="text-xl font-bold">Assistant IA Sign.Ci</h2>
          </div>
          <p className="text-indigo-100 max-w-2xl">
            L'IA analyse automatiquement les signalements pour classer les problèmes, détecter les priorités, identifier les zones critiques et vous aider à intervenir plus vite.
          </p>
        </div>
        <div className="flex gap-4 relative z-10 w-full md:w-auto">
          <div className="bg-indigo-800/50 rounded-xl p-4 flex-1 md:flex-none border border-indigo-500/30">
            <div className="flex items-center text-indigo-200 mb-1 text-sm font-medium">
              <Zap className="w-4 h-4 mr-1" /> Priorité Haute
            </div>
            <p className="text-2xl font-bold">{reports.filter(r => r.priority === 'Haute' && r.status === 'En attente').length}</p>
          </div>
          <div className="bg-indigo-800/50 rounded-xl p-4 flex-1 md:flex-none border border-indigo-500/30">
            <div className="flex items-center text-indigo-200 mb-1 text-sm font-medium">
              <MapPin className="w-4 h-4 mr-1" /> Zones critiques
            </div>
            <p className="text-2xl font-bold">2</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Signalements" value={totalReports} icon={AlertCircle} colorClass="text-slate-700" bgColor="bg-slate-100" />
        <StatCard title="En attente" value={pending} icon={Clock} colorClass="text-amber-600" bgColor="bg-amber-100" />
        <StatCard title="En cours" value={inProgress} icon={Users} colorClass="text-blue-600" bgColor="bg-blue-100" />
        <StatCard title="Résolus" value={resolved} icon={CheckCircle2} colorClass="text-emerald-600" bgColor="bg-emerald-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Weekly Trend Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Signalements de la semaine</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="reports" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Analyses par catégorie</h2>
          <div className="h-64 flex justify-center items-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400">Aucune donnée</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((item, index) => (
              <div key={`category-${item.name}-${index}`} className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
