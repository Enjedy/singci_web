import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Send, Bot, Sparkles, MapPin, Building, Map as MapIcon, ShoppingCart, Wrench, Timer, Banknote,
  ArrowRight, RotateCcw
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAppContext } from '../../context/AppContext';
import { estimateQuote, formatAR, Quote, QuoteLine } from '../../services/QuoteService';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  quote?: Quote;
  category?: string;
  reportId?: string;
}

const CATEGORIES: { name: string; emoji: string; desc: string }[] = [
  { name: 'Gestion de l\'eau', emoji: '💧', desc: 'Fuite, coupure, canalisation…' },
  { name: 'Voirie', emoji: '🛣️', desc: 'Nid de poule, trottoirs, routes…' },
  { name: 'Éclairage public', emoji: '💡', desc: 'Lampadaires, extinctions…' },
  { name: 'Propreté', emoji: '🗑️', desc: 'Déchets, dépôts sauvages…' },
  { name: 'École & bâtiment communal', emoji: '🏫', desc: 'Écoles, mairie, bureaux…' },
  { name: 'Complexe sportif', emoji: '⚽', desc: 'Stades, vestiaires, terrains…' },
];

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text:
    "Bonjour ! 👋 Je suis **DeviSAR**, votre agent d'estimation de devis.\n\nJe peux estimer le coût d'intervention pour chaque signalement selon sa catégorie (moyenne en Ariary).\n\nChoisissez une **catégorie** à gauche, ou sélectionnez un **signalement existant** depuis le menu ci-dessous.",
};

function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <div className="mt-2 bg-white border border-emerald-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-emerald-600 text-white px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-bold flex items-center">
          <Banknote className="w-4 h-4 mr-1.5" /> DEVIS DÉTAILLÉ
        </span>
        <span className="text-[10px] opacity-80">{quote.category}{quote.subCategory ? ' · ' + quote.subCategory : ''}</span>
      </div>

      <div className="divide-y divide-slate-100">
        {quote.lines.map((line: QuoteLine, i: number) => (
          <div key={i} className="flex justify-between px-3 py-2 text-xs">
            <span className="flex items-center text-slate-600">
              <ShoppingCart className="w-3.5 h-3.5 mr-2 text-slate-400" /> {line.label}
            </span>
            <span className="font-bold text-slate-700">{formatAR(line.amount)}</span>
          </div>
        ))}
        <div className="flex justify-between px-3 py-2 text-xs bg-amber-50">
          <span className="flex items-center text-amber-700 font-semibold">
            <Wrench className="w-3.5 h-3.5 mr-2" /> {quote.mainLabor.label}
          </span>
          <span className="font-bold text-amber-700">{formatAR(quote.mainLabor.amount)}</span>
        </div>
        <div className="flex justify-between px-3 py-2.5 bg-emerald-50">
          <span className="flex items-center text-emerald-800 font-bold text-sm">
            <Banknote className="w-4 h-4 mr-2" /> TOTAL ESTIMÉ
          </span>
          <span className="font-extrabold text-emerald-700 text-sm">{formatAR(quote.total)}</span>
        </div>
      </div>
      <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center text-[11px] text-slate-500">
        <Timer className="w-3.5 h-3.5 mr-1.5" /> {quote.delay}
      </div>
      <div className="px-3 py-1.5 bg-slate-50 text-[10px] text-slate-400 italic">{quote.disclaimer}</div>
    </div>
  );
}

export default function AdminQuoteAgent() {
  const { reports } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showReportPicker, setShowReportPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pendingReports = useMemo(
    () => reports.filter(r => r.status !== 'Résolu'),
    [reports]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const pushMessage = (msg: ChatMessage) => setMessages(prev => [...prev, msg]);

  const addBotReply = (text: string, quote?: Quote, category?: string) =>
    pushMessage({ id: `b${Date.now()}`, role: 'bot', text, quote, category });

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    const quote = estimateQuote(category);
    addBotReply(
      `Parfait ! Voici l'estimation pour la catégorie **${category}**.`,
      quote,
      category
    );
  };

  const handleReportSelect = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    setShowReportPicker(false);
    const quote = estimateQuote(report.category, report.subCategory);
    addBotReply(
      `J'ai analysé le signalement **${report.title}** (${report.category}${report.subCategory ? ' · ' + report.subCategory : ''}).\n\nVoici le devis estimatif :`,
      quote,
      report.category
    );
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');

    pushMessage({ id: `u${Date.now()}`, role: 'user', text });

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply: string;
      let quote: Quote | undefined;

      if (lower.includes('devis') || lower.includes('estim') || lower.includes('prix') || lower.includes('coût') || lower.includes('cout')) {
        const matched = CATEGORIES.find(c => lower.includes(c.name.toLowerCase().split(' ')[0]) || lower.includes(c.emoji));
        if (matched) {
          quote = estimateQuote(matched.name);
          reply = `Voici l'estimation pour la catégorie **${matched.name}** :`;
        } else {
          reply = "Pour quelle catégorie souhaitez-vous un devis ? Choisissez parmi les catégories à gauche 👈 ou sélectionnez un signalement existant ci-dessous.";
        }
      } else if (lower.includes('merci') || lower.includes("d'accord") || lower.includes('parfait')) {
        reply = "Avec plaisir ! 💚 Envoyez-moi un autre signalement dès que besoin. Tarifs indicatifs en Ariary (Ar).";
      } else if (lower.includes('bonjour') || lower.includes('salut')) {
        reply = "Bonjour ! Je peux estimer un devis par catégorie de signalement. Tapez par exemple « devis eau » ou choisissez une catégorie à gauche.";
      } else {
        reply = "Je suis spécialisé dans l'estimation des coûts d'intervention (matériel + main d'œuvre). Essayez « devis voirie » ou « devis éclairage », ou sélectionnez une catégorie.";
      }

      addBotReply(reply, quote);
    }, 500);
  };

  const DAY = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Assistant Devis (Agent IA)</h1>
        <p className="text-slate-500 mt-2">
          Estimez instantanément le coût d'un signalement : matériel + main d'œuvre, par catégorie, en Ariary.
        </p>
      </div>

      <div className="flex gap-5 h-[calc(100vh-16rem)]">
        {/* Catégories panel */}
        <aside className="hidden lg:flex w-72 flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Par catégorie</p>
            <p className="text-sm font-bold text-slate-800 flex items-center">
              <Sparkles className="w-4 h-4 text-emerald-500 mr-1.5" /> Estimer un devis
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={clsx(
                    "w-full text-left px-3 py-3 rounded-xl border transition-all",
                    active
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-100 bg-slate-50/60 hover:border-emerald-200 hover:bg-emerald-50/60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">{cat.emoji} {cat.name}</span>
                    <ArrowRight className={clsx("w-4 h-4", active ? "text-emerald-500" : "text-slate-300")} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{cat.desc}</p>
                </button>
              );
            })}

            <button
              onClick={() => setShowReportPicker(v => !v)}
              className="w-full text-left px-3 py-3 rounded-xl border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-50 transition-all mt-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-indigo-700 flex items-center">
                  <Bot className="w-4 h-4 mr-1.5" /> Depuis signalement
                </span>
                <RotateCcw className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-[11px] text-indigo-400 mt-0.5">Générer le devis d'un signalement réel</p>
            </button>
          </div>
        </aside>

        {/* Chat panel */}
        <section className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Chat header */}
          <header className="flex items-center px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">DeviSAR — Agent Devis</p>
              <p className="text-[11px] text-emerald-50">En ligne · Estimation matériel + main d'œuvre</p>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-100" />
          </header>

          {/* Report picker */}
          {showReportPicker && (
            <div className="border-b border-slate-100 p-3 bg-slate-50/70 max-h-48 overflow-y-auto">
              <p className="text-xs font-bold text-slate-500 mb-2">Sélectionnez un signalement en attente :</p>
              <div className="space-y-2">
                {pendingReports.length === 0 && (
                  <p className="text-sm text-slate-400">Aucun signalement en attente.</p>
                )}
                {pendingReports.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleReportSelect(r.id)}
                    className="w-full flex items-center text-left bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-2 flex-shrink-0">
                      {r.signalType === 'Bâtiment communal'
                        ? <Building className="w-4 h-4 text-indigo-500" />
                        : <MapIcon className="w-4 h-4 text-teal-500" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{r.title}</p>
                      <p className="text-[10px] text-slate-400 truncate flex items-center">
                        <MapPin className="w-3 h-3 mr-0.5" /> {r.location} · {r.category}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/70 to-white">
            <div className="text-center">
              <span className="text-[10px] font-semibold capitalize text-slate-400 bg-white border border-slate-100 rounded-full px-3 py-1">
                {DAY}
              </span>
            </div>
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={clsx("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                      {msg.role === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mr-2 mt-0.5 flex-shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      <div className={clsx("max-w-[82%]", msg.role === 'user' && "order-1")}>
                        <div
                          className={clsx(
                            "px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm shadow-sm",
                            msg.role === 'user'
                              ? "bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-br-md"
                              : "bg-white border border-slate-100 text-slate-700 rounded-bl-md"
                          )}
                        >
                          {msg.text.split('\n').map((line, i) => (
                            <p key={i} className={clsx(
                              line.startsWith('#') && "text-base font-extrabold text-slate-800",
                              /^\*\*/.test(line) && "font-bold",
                              /^_/.test(line) && "italic text-slate-400 text-xs",
                              line.trim() === '' && "h-2"
                            )}>
                              {line.replace(/^#+\s/, '').replace(/\*\*/g, '').replace(/^_/, '').replace(/_$/, '')}
                            </p>
                          ))}
                        </div>
                        {msg.quote && <QuoteCard quote={msg.quote} />}
                        <p className="text-[9px] text-slate-300 mt-1 px-1">
                          {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="px-4 pb-1 border-t border-slate-100 bg-white pt-3 flex gap-2 overflow-x-auto">
            {['💧 Eau', '🛣️ Voirie', '💡 Éclairage', '🗑️ Propreté', '🏫 Bâtiment'].map(s => (
              <button
                key={s}
                onClick={() => {
                  setSelectedCategory(s.split(' ')[1]);
                  handleCategorySelect(s.split(' ')[1]);
                }}
                className="flex-shrink-0 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 hover:border-emerald-200 rounded-full px-3 py-1.5 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Composer */}
          <footer className="border-t border-slate-100 bg-white p-3">
            <div className="flex items-end gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Ex : devis pour coupure d'eau, estimation voirie..."
                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}