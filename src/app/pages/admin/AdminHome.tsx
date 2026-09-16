import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight, Zap, ShieldCheck, BarChart3, AlertTriangle, MessageSquare, Bot,
  Users, Map, Sparkles, Clock, CheckCircle2, TrendingUp, MapPin, Send, ChevronRight
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import ReportImage, { REPORT_PLACEHOLDER_IMG } from '../../components/figma/ReportImage';
import { clsx } from 'clsx';

/* ---------- Compteur animé ---------- */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); prevRef.current = target; };
  }, [target, duration]);

  return value;
}

type Slide = { label: string; gradient: string; image?: string };

export default function AdminHome() {
  const { reports, user } = useAppContext();
  const navigate = useNavigate();

  const resolved = reports.filter(r => r.status === 'Résolu').length;
  const pending = reports.filter(r => r.status === 'En attente').length;
  const inProgress = reports.filter(r => r.status === 'En cours').length;

  const countResolved = useCountUp(resolved);
  const countTotal = useCountUp(reports.length);
  const countPending = useCountUp(pending);

  const adminName = user?.email?.split('@')[0] || 'Administrateur';

  // Signalement "action prioritaire" affiché dans la carte interactive
  const featuredReport = useMemo(
    () =>
      reports.find(r => r.priority === 'Haute' && r.status === 'En attente') ||
      reports[0],
    [reports]
  );

  const slides: Slide[] = useMemo(() => {
    const reportSlides: Slide[] = reports.slice(0, 8).map(r => ({
      label: r.title,
      gradient: 'from-slate-200 to-slate-400',
      image: r.imageUrl || REPORT_PLACEHOLDER_IMG,
    }));
    const staticSlides: Slide[] = [
      { label: 'Sécurité des quartiers', gradient: 'from-violet-500 to-blue-500' },
      { label: 'Eau & électricité rétablies', gradient: 'from-sky-400 to-cyan-500' },
      { label: 'Voirie rénovée', gradient: 'from-amber-400 to-orange-500' },
      { label: 'Espaces verts entretenus', gradient: 'from-emerald-400 to-teal-500' },
    ];
    return reportSlides.length > 0 ? reportSlides : staticSlides;
  }, [reports]);

  const doubledSlides = useMemo(() => [...slides, ...slides], [slides]);

  const quickActions = [
    { name: 'Signalements', desc: `${pending} en attente d'action`, path: '/admin/reports', icon: AlertTriangle, color: 'text-amber-300' },
    { name: 'Tableau de bord', desc: 'Statistiques en temps réel', path: '/admin/dashboard', icon: BarChart3, color: 'text-sky-300' },
    { name: 'Messagerie', desc: 'Répondre aux citoyens', path: '/admin/messages', icon: MessageSquare, color: 'text-violet-300' },
    { name: 'Assistant Devis', desc: 'Estimer un coût d\'intervention', path: '/admin/assistant', icon: Bot, color: 'text-emerald-300' },
    { name: 'Équipes', desc: 'Gérer vos équipes terrain', path: '/admin/teams', icon: Users, color: 'text-rose-300' },
    { name: 'Carte', desc: 'Visualiser les zones critiques', path: '/admin/map', icon: Map, color: 'text-cyan-300' },
  ];

  const stats = [
    { icon: CheckCircle2, label: 'Signalements résolus', value: countResolved, suffix: '', color: 'from-emerald-400 to-teal-500', glow: 'shadow-emerald-500/20' },
    { icon: Zap, label: 'Temps de réaction moyen', value: 5, suffix: ' min', color: 'from-violet-400 to-blue-500', glow: 'shadow-violet-500/20' },
    { icon: TrendingUp, label: 'Signalements traités', value: countTotal, suffix: '', color: 'from-sky-400 to-cyan-500', glow: 'shadow-sky-500/20' },
    { icon: Clock, label: 'En attente', value: countPending, suffix: '', color: 'from-amber-400 to-orange-500', glow: 'shadow-amber-500/20' },
  ];

  return (
    <div className="relative min-h-full overflow-hidden bg-slate-950 text-white -m-4 md:-m-8">
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 45s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        .animate-floaty { animation: floaty 6s ease-in-out infinite; }
      `}</style>

      {/* ------- Fond : halos dégradés flous ------- */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-32 -left-24 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -right-32 w-[28rem] h-[28rem] bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Contenu : marges intérieures généreuses sur mobile */}
      <div className="relative z-10 space-y-10 pb-16 px-4 sm:px-6 lg:px-8">
        {/* ================= HERO — 1 colonne mobile / 2 colonnes desktop ================= */}
        <section className="grid gap-10 md:grid-cols-2 items-center pt-10 md:pt-14">
          {/* Colonne texte (gauche sur desktop, centrée sur mobile) */}
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start mb-5">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-xs font-semibold text-slate-300">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                Sign.Ci · Espace administrateur — {adminName.charAt(0).toUpperCase() + adminName.slice(1)}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-violet-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
                Pilotez votre ville,
              </span>
              <br />
              <span className="text-white">agissez en temps réel.</span>
            </h1>

            <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto md:mx-0 leading-relaxed">
              Chaque signalement est une opportunité de prouver que la commune agit.
              Traitez, assignez, anticipez — {pending} dossiers attendent votre décision aujourd'hui.
            </p>

            {/* CTA : plein largeur mobile, côte à côte desktop */}
            <div className="mt-8 flex flex-col w-full sm:flex-row sm:w-auto gap-4 justify-center md:justify-start">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-base shadow-xl shadow-violet-600/25 hover:shadow-[0_0_40px_rgba(139,92,246,0.55)] hover:scale-105 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
              >
                Suivre l'action
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate('/admin/reports?status=En attente')}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl text-slate-200 font-bold text-base hover:bg-white/10 hover:scale-105 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
              >
                {pending} signalements en attente
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Colonne illustration / carte interactive (droite sur desktop) */}
          <div className="w-full max-w-md mx-auto md:max-w-none">
            <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl shadow-violet-900/30 p-5 sm:p-6 hover:scale-[1.02] hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-violet-400" /> Action prioritaire
                </p>
                <span className="text-[10px] font-bold text-red-300 bg-red-500/10 border border-red-500/20 rounded-full px-2.5 py-1">
                  Priorité haute
                </span>
              </div>

              {featuredReport ? (
                <>
                  <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden">
                    <ReportImage src={featuredReport.imageUrl} alt={featuredReport.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-4 pt-12">
                      <p className="text-sm font-bold text-white truncate">{featuredReport.title}</p>
                      <p className="text-[11px] text-slate-300 flex items-center mt-0.5">
                        <MapPin className="w-3 h-3 mr-1" /> {featuredReport.location}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={clsx(
                      "text-[10px] font-bold px-2.5 py-1 rounded-full border",
                      featuredReport.status === 'En attente' && "bg-amber-500/10 text-amber-300 border-amber-500/30",
                      featuredReport.status === 'En cours' && "bg-sky-500/10 text-sky-300 border-sky-500/30",
                      featuredReport.status === 'Résolu' && "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    )}>
                      {featuredReport.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                      {featuredReport.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                      {featuredReport.assignedTeam || 'Non assigné'}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate('/admin/reports')}
                      className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105 py-2.5 rounded-xl transition-all duration-300"
                    >
                      <ShieldCheck className="w-4 h-4" /> Traiter ce dossier
                    </button>
                    <button
                      onClick={() => featuredReport && navigate(`/admin/messages?report=${featuredReport.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-200 bg-white/5 border border-white/15 hover:bg-white/10 hover:scale-105 py-2.5 rounded-xl transition-all duration-300"
                    >
                      <Send className="w-4 h-4" /> Répondre à l'auteur
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-52 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 text-sm">
                  Aucun signalement pour le moment.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= BANDEAU IMAGES DÉFILANT ================= */}
        <section className="relative">
          <div className="flex items-center justify-between px-1 mb-4">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-violet-400" /> Derniers signalements — action en cours
            </h2>
          </div>
          <div className="relative overflow-hidden rounded-3xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-14 sm:w-24 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-14 sm:w-24 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>

            <div className="flex gap-5 animate-marquee w-max py-2">
              {doubledSlides.map((slide, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/admin/reports')}
                  className="group relative w-52 sm:w-64 shrink-0 rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg hover:scale-[1.04] hover:border-white/20 transition-all duration-300 cursor-pointer"
                >
                  <div className="h-32 sm:h-36 bg-gradient-to-br overflow-hidden">
                    {slide.image ? (
                      <ReportImage src={slide.image} alt={slide.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center`}>
                        <ShieldCheck className="w-12 h-12 text-white/80" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-200 truncate">{slide.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> Mis à jour en continu
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= STATISTIQUES / CONFIANCE ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`rounded-2xl p-5 bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg ${s.glow} hover:scale-105 hover:bg-white/[0.07] transition-all duration-300`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-lg`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl md:text-4xl font-extrabold text-white">
                {s.value?.toLocaleString('fr-FR') || s.value}{s.suffix}
              </p>
              <p className="text-xs font-medium text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl px-5 py-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-500/20 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left hover:scale-[1.01] transition-transform duration-300">
          <p className="text-sm text-slate-300 flex flex-col sm:flex-row sm:items-center gap-1">
            <span>
              <strong className="text-white mr-1">{resolved}</strong> dossiers déjà résolus · <strong className="text-white ml-1">{inProgress}</strong> en cours
            </span>
            <span className="text-slate-400">— objectif : 0 signalement oublié.</span>
          </p>
          <span className="shrink-0 inline-flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
            <Zap className="w-3.5 h-3.5" /> Réaction moyenne : 5 min
          </span>
        </section>

        {/* ================= ACCÈS RAPIDES ================= */}
        <section>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Accès rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((qa, i) => (
              <button
                key={qa.name}
                onClick={() => navigate(qa.path)}
                style={{ animationDelay: `${i * 60}ms` }}
                className="group rounded-2xl p-5 text-left bg-white/5 border border-white/10 backdrop-blur-xl hover:scale-[1.05] hover:-translate-y-1 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <qa.icon className={`w-6 h-6 ${qa.color}`} />
                  <ArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <p className="font-bold text-white mt-4 text-sm">{qa.name}</p>
                <p className="text-xs text-slate-400 mt-1">{qa.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ================= BANNIÈRE MOTIVATION ================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-blue-700 to-emerald-600 p-6 sm:p-8 md:p-10 hover:scale-[1.01] transition-transform duration-300">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 left-10 w-72 h-72 bg-slate-900/20 rounded-full blur-3xl animate-floaty"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
                Chaque clic peut changer la vie d'un citoyen.
              </h3>
              <p className="text-sm text-white/80 mt-2 max-w-xl">
                Merci pour votre engagement {adminName.charAt(0).toUpperCase() + adminName.slice(1)}. Revenez dans quelques minutes : un nouveau signalement peut attendre votre action dès maintenant.
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/reports')}
              className="shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:scale-105 hover:shadow-[0_0_35px_rgba(255,255,255,0.4)] active:scale-[0.98] transition-all duration-300"
            >
              Agir maintenant <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}