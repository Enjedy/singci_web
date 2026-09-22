import { useEffect, useMemo, useRef, useState, Fragment } from 'react';
import {
  Send, Bot, Sparkles, MapPin, Map as MapIcon, Wrench, Timer, Zap,
  ArrowRight, RotateCcw, BrainCircuit, ServerOff, Cpu, Check
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAppContext } from '../../context/AppContext';
import { estimateWork, WorkEstimate, formatEstimateReply } from '../../services/QuoteService';
import {
  askAssistant,
  checkAssistantHealth,
  AssistantReply,
  ASSISTANT_API_URL,
} from '../../services/AssistantService';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  estimate?: WorkEstimate;
  category?: string;
  reportId?: string;
}

type BackendStatus = 'checking' | 'online' | 'offline';

const CATEGORIES: { name: string; desc: string }[] = [
  { name: 'Panne d\'éclairage', desc: 'Ampoule, module LED, circuit…' },
  { name: 'Lampadaire éteint', desc: 'Capteur, ligne d\'alimentation…' },
  { name: 'Lampadaire clignotant', desc: 'Ballast, contacts, condensateur…' },
  { name: 'Lampadaire cassé', desc: 'Mât, luminaire, balisage…' },
  { name: 'Colonne / câblage défectueux', desc: 'Câble, colonne, coffret, fusible…' },
  { name: 'Autre anomalie', desc: 'Situation non couverte…' },
];

const matchCategory = (text: string): string | undefined => {
  const lower = text.toLowerCase();
  const rules: [RegExp, string][] = [
    [/clignot|scintill/, 'Lampadaire clignotant'],
    [/cass|bris|fracass/, 'Lampadaire cassé'],
    [/éteint|eteint|ne fonctionne|sallume|allume plus|ne marche/, 'Lampadaire éteint'],
    [/câble|cable|cablage|colonne|coffret|fusible|disjoncteur/, 'Colonne / câblage défectueux'],
    [/panne|lumière|lumiere|éclairage|ampoule/, 'Panne d\'éclairage'],
    [/autre/, 'Autre anomalie'],
  ];
  return rules.find(([re]) => re.test(lower))?.[1];
};

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text:
    "Bonjour ! Je suis **LumaCI**, votre agent d'assistance éclairage public.\n\nJe vous **conseille** les travaux à prévoir pour chaque anomalie : étapes, moyens et délai — sans jamais communiquer de tarif.\n\nChoisissez une **anomalie** à gauche, sélectionnez un **signalement existant**, ou décrivez simplement le problème ci-dessous.",
};

// ---- Mini-lecteur markdown (graisse, puces, titres, italique) -------------

function renderInline(line: string, key: number): JSX.Element {
  const nodes: JSX.Element[] = [];
  const regex = /(\*\*[^*]+\*\*)/g;
  const parts = line.split(regex);
  parts.forEach((part, i) => {
    if (/^\*\*.*\*\*$/.test(part)) {
      nodes.push(<strong key={key + '-' + i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>);
    } else {
      nodes.push(<Fragment key={key + '-' + i}>{part}</Fragment>);
    }
  });
  return <>{nodes}</>;
}

function MessageBody({ text }: { text: string }) {
  const lines = text.split('\n');
  const renderLines: JSX.Element[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = (buf: string[]) => {
    if (buf.length === 0) return;
    renderLines.push(
      <ul key={'ul-' + renderLines.length} className="my-1 space-y-0.5">
        {buf.map((b, i) => (
          <li key={i} className="flex items-start">
            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-sm text-slate-700">{b}</span>
          </li>
        ))}
      </ul>
    );
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    const isBullet = /^[-*•]\s/.test(line);

    if (isBullet) {
      bulletBuffer.push(line.replace(/^[-*•]\s/, ''));
      return;
    }
    flushBullets(bulletBuffer);
    bulletBuffer = [];

    if (!line) {
      renderLines.push(<div key={'gap-' + idx} className="h-2" />);
    } else if (line.startsWith('### ')) {
      renderLines.push(<p key={'h3-' + idx} className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mt-1">{line.replace(/^###\s/, '')}</p>);
    } else if (line.startsWith('**') && line.endsWith('**')) {
      renderLines.push(<p key={'h-' + idx} className="text-sm font-bold text-slate-900 mt-1.5">{line.slice(2, -2)}</p>);
    } else if (line.startsWith('_') && line.endsWith('_')) {
      renderLines.push(<p key={'i-' + idx} className="text-xs italic text-slate-500">{line.slice(1, -1)}</p>);
    } else {
      renderLines.push(<p key={'p-' + idx} className="text-sm leading-relaxed">{renderInline(line, idx)}</p>);
    }
  });
  flushBullets(bulletBuffer);

  return <>{renderLines}</>;
}

// ---- Carte d'estimation ---------------------------------------------------

function EstimateCard({ estimate }: { estimate: WorkEstimate }) {
  return (
    <div className="mt-2.5 bg-white border border-emerald-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-bold flex items-center">
          <Wrench className="w-4 h-4 mr-1.5" /> CONSEIL D'INTERVENTION
        </span>
        <span className="text-[10px] opacity-90 bg-white/20 rounded-full px-2 py-0.5">
          {estimate.category}{estimate.subCategory ? ' · ' + estimate.subCategory : ''}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {estimate.lines.map((line, i) => (
          <div key={i} className="flex items-start px-3 py-2 text-xs">
            <span className="flex items-center text-slate-700">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] font-bold mr-2 flex-shrink-0 mt-px">{i + 1}</span>
              {line.label}
            </span>
          </div>
        ))}
        <div className="flex justify-between px-3 py-2 text-xs bg-amber-50">
          <span className="flex items-center text-amber-700 font-semibold">
            <Zap className="w-3.5 h-3.5 mr-2" /> Moyens / main d'œuvre
          </span>
          <span className="font-bold text-amber-700 text-right max-w-[60%]">{estimate.mainWork}</span>
        </div>
        <div className="flex justify-between px-3 py-2 text-xs bg-emerald-50">
          <span className="font-semibold text-emerald-800">Complexité estimée</span>
          <span className="font-bold text-emerald-700">{estimate.complexity}</span>
        </div>
      </div>
      <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center text-[11px] text-slate-500">
        <Timer className="w-3.5 h-3.5 mr-1.5" /> {estimate.delay}
      </div>
      <div className="px-3 py-1.5 bg-slate-50 text-[10px] text-slate-400 italic">{estimate.disclaimer}</div>
    </div>
  );
}

// ---- Composant principal --------------------------------------------------

export default function AdminQuoteAgent() {
  const { reports } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showReportPicker, setShowReportPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');
  const scrollRef = useRef<HTMLDivElement>(null);

  const pendingReports = useMemo(
    () => reports.filter(r => r.status !== 'Résolu'),
    [reports]
  );

  useEffect(() => {
    let mounted = true;
    checkAssistantHealth().then(ok => {
      if (mounted) setBackendStatus(ok ? 'online' : 'offline');
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const pushMessage = (msg: ChatMessage) => setMessages(prev => [...prev, msg]);

  const pushLocalReply = (reply: AssistantReply & { reply: string; estimate?: WorkEstimate }) => {
    pushMessage({ id: `b${Date.now()}`, role: 'bot', text: reply.reply, estimate: reply.estimate });
  };

  const applyReply = (reply: AssistantReply) => {
    pushMessage({
      id: `b${Date.now()}`,
      role: 'bot',
      text: reply.reply,
      estimate: reply.estimate ?? undefined,
      category: reply.category ?? undefined,
    });
  };

  const localEstimateReply = (category: string, reportTitle?: string): AssistantReply => {
    const estimate = estimateWork('Éclairage public', category);
    const prefix = reportTitle
      ? `J'ai analysé le signalement **${reportTitle}** (${category}).\n\n`
      : '';
    return {
      reply: prefix + formatEstimateReply(category, estimate),
      intent: 'estimate',
      category,
      estimate,
    };
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    setIsTyping(true);
    try {
      const reply = await askAssistant(`J'aimerais une estimation pour ${category}`, []);
      applyReply(reply);
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
      pushLocalReply(localEstimateReply(category));
    } finally {
      setIsTyping(false);
    }
  };

  const handleReportSelect = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    setShowReportPicker(false);
    setIsTyping(true);
    try {
      const reply = await askAssistant(
        `Analyser le signalement`,
        [],
        { title: report.title, category: report.category, subCategory: report.subCategory }
      );
      applyReply(reply);
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
      pushLocalReply(localEstimateReply(report.subCategory || report.category, report.title));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    pushMessage({ id: `u${Date.now()}`, role: 'user', text });
    setIsTyping(true);

    try {
      const reply = await askAssistant(text, []);
      applyReply(reply);
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
      const lower = text.toLowerCase();

      if (lower.includes('merci') || lower.includes("d'accord") || lower.includes('parfait')) {
        pushLocalReply({ reply: 'Avec plaisir ! Je reste disponible pour vous conseiller sur toute autre anomalie d\'éclairage.', intent: 'thanks' });
      } else if (lower.includes('bonjour') || lower.includes('salut')) {
        pushLocalReply({ reply: 'Bonjour ! Décrivez-moi l\'anomalie d\'éclairage (ex. « lampadaire clignotant ») et je vous conseille les travaux à prévoir.', intent: 'greeting' });
      } else if (lower.includes('prix') || lower.includes('tarif') || lower.includes('coût') || lower.includes('cout') || lower.includes('combien')) {
        pushLocalReply({ reply: 'Je ne donne pas de tarif : mon rôle est de vous **conseiller** sur les travaux à prévoir. L\'équipe électrique confirmera le périmètre exact lors de sa visite.', intent: 'price' });
      } else {
        const matched = matchCategory(text);
        pushLocalReply(
          matched
            ? localEstimateReply(matched)
            : {
                reply: formatEstimateReplyFallback(),
                intent: 'fallback',
              }
        );
      }
    } finally {
      setIsTyping(false);
    }
  };

  const formatEstimateReplyFallback = () => [
    'Merci pour la précision. Pour bien vous conseiller, j\'ai besoin de connaître la nature exacte de l\'anomalie.',
    '',
    '- **Lampadaire clignotant** : s\'allume et s\'éteint par intermittence',
    '- **Lampadaire éteint** : ne s\'allume plus du tout',
    '- **Lampadaire cassé** : mât, luminaire ou verre endommagé',
    '- **Colonne / câblage défectueux** : coffret, câbles, fusibles ou odeurs',
    '- **Panne d\'éclairage** : ampoule ou module LED en cause',
    '',
    'Choisissez une anomalie à gauche ou sélectionnez un signalement existant ci-dessous.',
  ].join('\n');

  const DAY = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Assistant Éclairage (Agent IA)</h1>
        <p className="text-slate-500 mt-2">
          LumaCI vous <strong className="text-slate-700">conseille</strong> les travaux à prévoir pour chaque anomalie d'éclairage public : étapes, moyens et délai — sans aucun tarif. Les signalements partent directement à l'équipe électrique.
        </p>
      </div>

      <div className="flex gap-5 h-[calc(100vh-16rem)]">
        {/* Catégories panel */}
        <aside className="hidden lg:flex w-72 flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Éclairage public</p>
            <p className="text-sm font-bold text-slate-800 flex items-center">
              <Sparkles className="w-4 h-4 text-emerald-500 mr-1.5" /> Les anomalies fréquentes
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
                    <span className="text-sm font-bold text-slate-800">{cat.name}</span>
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
              <p className="text-[11px] text-indigo-400 mt-0.5">Conseiller sur un signalement réel</p>
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
              <p className="text-sm font-bold">LumaCI — Agent Éclairage</p>
              <p className="text-[11px] text-emerald-50">Conseils d'intervention · sans tarif</p>
            </div>
            <div className="flex items-center gap-2">
              {backendStatus === 'checking' && (
                <span className="flex items-center text-[10px] bg-white/15 rounded-full px-2.5 py-1">
                  <Cpu className="w-3 h-3 mr-1 animate-pulse" /> Connexion…
                </span>
              )}
              {backendStatus === 'online' && (
                <span title={`Moteur Python : ${ASSISTANT_API_URL}`} className="flex items-center text-[10px] bg-white/20 rounded-full px-2.5 py-1">
                  <BrainCircuit className="w-3 h-3 mr-1" /> Moteur Python en ligne
                </span>
              )}
              {backendStatus === 'offline' && (
                <span className="flex items-center text-[10px] bg-amber-400/90 text-amber-950 rounded-full px-2.5 py-1">
                  <ServerOff className="w-3 h-3 mr-1" /> Mode local
                </span>
              )}
              <Sparkles className="w-5 h-5 text-emerald-100" />
            </div>
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
                      <MapIcon className="w-4 h-4 text-teal-500" />
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
            <div className="space-y-4">
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
                        "px-4 py-3 rounded-2xl shadow-sm",
                        msg.role === 'user'
                          ? "bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-br-md"
                          : "bg-white border border-slate-100 text-slate-700 rounded-bl-md"
                      )}
                    >
                      <MessageBody text={msg.text} />
                    </div>
                    {msg.estimate && <EstimateCard estimate={msg.estimate} />}
                    <p className="text-[9px] text-slate-300 mt-1 px-1">
                      {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mr-2 mt-0.5 flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-100 text-slate-500 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[11px] ml-1 text-slate-400">LumaCI réfléchit…</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="px-4 pb-1 border-t border-slate-100 bg-white pt-3 flex gap-2 overflow-x-auto">
            {['Panne d\'éclairage', 'Lampadaire éteint', 'Lampadaire clignotant', 'Lampadaire cassé', 'Câblage'].map(name => (
              <button
                key={name}
                onClick={() => handleCategorySelect(name)}
                className="flex-shrink-0 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 hover:border-emerald-200 rounded-full px-3 py-1.5 transition-colors"
              >
                {name}
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
                placeholder="Décrivez l'anomalie : ex. « lampadaire éteint avenue de la République »..."
                disabled={isTyping}
                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
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