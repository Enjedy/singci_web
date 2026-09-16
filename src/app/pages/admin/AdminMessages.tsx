import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search, Phone, Video, Send, Paperclip, Navigation, AlertTriangle, ArrowLeft, MoreVertical, CheckCheck, Image as ImageIconG, MapPin, MessageSquare, Sparkles, CircleUser, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppContext } from '../../context/AppContext';

// L'administrateur (Sign.Ci) répond ici aux messages des citoyens.
// Les "contacts" sont donc des citoyens qui écrivent à la commune.
// Un signalement ouvert dans /admin/reports peut ouvrir directement
// une discussion avec son auteur via ?report=REP-XXX.

interface Contact {
  id: string;
  name: string;
  district: string;
  avatar: string;
  gradient: string;
  online: boolean;
  lastMessage: string;
  time: string;
  unread?: number;
}

interface Message {
  id: string;
  contactId: string;
  fromMe: boolean; // true = réponse de l'administration (l'admin connecté)
  text: string;
  time: string;
  day: string;
  attachment?: { type: 'photo' | 'position' | 'alert'; label: string };
  read?: boolean;
}

const contacts: Contact[] = [
  { id: 'CIT-01', name: 'Jean Rakoto', district: 'Quartier Antanimena', avatar: '👤', gradient: 'from-violet-500 to-blue-500', online: true, lastMessage: 'Fuite d\'eau devant chez moi depuis 3 jours. Comment faire ?', time: '09:12', unread: 2 },
  { id: 'CIT-02', name: 'Hanta Andrianina', district: 'Rue des Fleurs', avatar: '👩', gradient: 'from-rose-500 to-pink-500', online: true, lastMessage: 'Le lampadaire de ma rue est en panne depuis lundi.', time: '08:47' },
  { id: 'CIT-03', name: 'Tovo Rasoamanana', district: 'Marché Behoririka', avatar: '👨', gradient: 'from-amber-500 to-orange-500', online: false, lastMessage: 'Dépôt sauvage d\'ordures près du marché.', time: 'Hier' },
  { id: 'CIT-04', name: 'Sarah Rabe', district: 'Avenue de la République', avatar: '👩‍🦱', gradient: 'from-sky-400 to-blue-600', online: true, lastMessage: 'Un nid de poule dangereux sur la voie principale.', time: 'Hier', unread: 1 },
  { id: 'CIT-05', name: 'Mamy Randria', district: 'Ivandry', avatar: '🧔', gradient: 'from-emerald-500 to-teal-600', online: false, lastMessage: 'La borne à incendie du coin fuit sans arrêt.', time: 'Lun' },
];

// Réaction automatique du citoyen quand l'administration répond
const citizenReplies: Record<string, string> = {
  'CIT-01': 'Merci beaucoup pour votre réponse ! Je reste disponible si besoin.',
  'CIT-02': 'C\'est noté, merci pour la prise en charge 🙏',
  'CIT-03': 'Parfait, je vous remercie pour l\'information.',
  'CIT-04': 'Très bien, j\'attends la suite. Merci !',
  'CIT-05': 'D\'accord, je transmets l\'information au voisinage. Merci !',
  DEFAULT: 'Merci pour votre réponse !',
};

const DAY_LABEL = (d: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Aujourd\'hui';
  if (same(d, yesterday)) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const getInitials = (name: string) => name.replace(/[^a-zA-ZÀ-ÿ ]/g, '').trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const AUTHOR_GRADIENTS = ['from-violet-500 to-blue-500', 'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500', 'from-sky-400 to-blue-600', 'from-emerald-500 to-teal-600'];
const authorGradient = (key: string) => AUTHOR_GRADIENTS[Math.abs([...key].reduce((a, c) => a + c.charCodeAt(0), 0)) % AUTHOR_GRADIENTS.length];

const authorName = (citizenId: string, reportId: string) => {
  const known = contacts.find(c => c.id === citizenId);
  if (known) return known.name;
  const num = citizenId.replace(/\D/g, '').slice(-4);
  return num ? `Citoyen · ${num}` : `Auteur du signalement`;
};

export default function AdminMessages() {
  const { reports } = useAppContext();
  const [searchParams] = useSearchParams();
  const [activeContactId, setActiveContactId] = useState<string>('CIT-01');
  const [searchTerm, setSearchTerm] = useState('');
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Record<string, Message[]>>({
    'CIT-01': [
      { id: 'M1', contactId: 'CIT-01', fromMe: false, text: 'Bonjour, y\'a une fuite d\'eau devant chez moi depuis 3 jours. Comment est-ce que je fais pour que la commune intervienne ?', time: '09:02', day: DAY_LABEL(new Date()) },
      { id: 'M2', contactId: 'CIT-01', fromMe: true, text: 'Bonjour, merci pour votre signalement. J\'ai transmis votre demande au service des eaux — un technicien passera sous 24h.', time: '09:07', day: DAY_LABEL(new Date()), read: true },
      { id: 'M3', contactId: 'CIT-01', fromMe: false, text: 'Super, merci beaucoup ! Quel numéro dois-je appeler en cas d\'urgence ?', time: '09:10', day: DAY_LABEL(new Date()) },
    ],
    'CIT-02': [
      { id: 'G1', contactId: 'CIT-02', fromMe: false, text: 'Le lampadaire de la rue des Fleurs est en panne depuis lundi. C\'est sombre le soir, c\'est dangereux pour les enfants.', time: '08:47', day: DAY_LABEL(new Date()) },
    ],
  });

  const requestedReportId = searchParams.get('report');
  const report = useMemo(
    () => (requestedReportId ? reports.find(r => r.id === requestedReportId) : undefined),
    [reports, requestedReportId]
  );

  // Contact virtuel créé pour l'auteur du signalement demandé
  const reportContact = useMemo(() => {
    if (!report) return null;
    const cid = report.citizenId || `SRC-${report.id}`;
    return {
      id: cid,
      name: authorName(cid, report.id),
      district: report.location || 'Quartier',
      avatar: '👤',
      gradient: authorGradient(cid),
      online: true,
      lastMessage: report.title,
      time: formatTime(report.date),
    };
  }, [report]);

  // Le contact dynamique s'ajoute aux contacts statiques
  const allContacts = useMemo(() => {
    if (!reportContact) return contacts;
    if (contacts.some(c => c.id === reportContact.id)) return contacts;
    return [reportContact, ...contacts];
  }, [reportContact]);

  // Ouvre automatiquement la discussion avec l'auteur du signalement
  useEffect(() => {
    if (!report || !reportContact) return;
    const cid = reportContact.id;
    setActiveContactId(cid);
    setConversations(prev => {
      if (prev[cid]) return prev;
      return {
        ...prev,
        [cid]: [
          {
            id: `${report.id}-ctx`,
            contactId: cid,
            fromMe: false,
            text: `Bonjour, concernant mon signalement « ${report.title} » (${report.category}${report.subCategory ? ' · ' + report.subCategory : ''}).\n\n${report.description}`,
            time: formatTime(report.date),
            day: DAY_LABEL(new Date(report.date)),
          } as Message,
        ],
      };
    });
  }, [report, reportContact]);

  const activeContact = allContacts.find(c => c.id === activeContactId);
  const messages = activeContact ? (conversations[activeContact.id] || []) : [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, activeContactId]);

  const filteredContacts = allContacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const aLast = conversations[a.id]?.length || 0;
    const bLast = conversations[b.id]?.length || 0;
    const aUnread = a.unread || 0;
    const bUnread = b.unread || 0;
    const aIdx = aUnread === 0 ? 1 : (aLast > 0 ? -1 : 1);
    const bIdx = bUnread === 0 ? 1 : (bLast > 0 ? -1 : 1);
    return aIdx - bIdx || (bUnread - aUnread);
  });

  const sendMessage = (text?: string, attachment?: Message['attachment']) => {
    const finalText = (text ?? draft).trim();
    if (!finalText && !attachment) return;
    if (!activeContact) return;

    const now = new Date();
    const adminMsg: Message = {
      id: `U${Date.now()}`,
      contactId: activeContact.id,
      fromMe: true,
      text: finalText,
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      day: DAY_LABEL(now),
      attachment,
      read: false,
    };

    setConversations(prev => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), adminMsg],
    }));
    setDraft('');

    // Le citoyen "tape..." puis accuse réception de la réponse
    setTimeout(() => setTyping(true), 500);
    setTimeout(() => {
      const reply: Message = {
        id: `R${Date.now()}`,
        contactId: activeContact.id,
        fromMe: false,
        text: citizenReplies[activeContact.id] || citizenReplies.DEFAULT,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        day: DAY_LABEL(new Date()),
      };
      setTyping(false);
      setConversations(prev => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), reply],
      }));
    }, 1800);
  };

  const groups = useMemo(() => {
    const g: { day: string; items: Message[] }[] = [];
    messages.forEach(msg => {
      const last = g[g.length - 1];
      if (last && last.day === msg.day) last.items.push(msg);
      else g.push({ day: msg.day, items: [msg] });
    });
    return g;
  }, [messages]);

  const attachmentChip = (a: Message['attachment']) => a && (
    <div className={clsx(
      "flex items-center gap-2 rounded-lg px-2.5 py-2 mb-1.5 text-xs font-bold",
      a.type === 'photo' && "bg-slate-100 text-slate-700",
      a.type === 'position' && "bg-blue-50 text-blue-700",
      a.type === 'alert' && "bg-red-50 text-red-700"
    )}>
      {a.type === 'photo' && <ImageIconG className="w-4 h-4" />}
      {a.type === 'position' && <MapPin className="w-4 h-4" />}
      {a.type === 'alert' && <AlertTriangle className="w-4 h-4" />}
      <span>{a.label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messagerie citoyenne</h1>
        <p className="text-sm text-slate-500 mt-1">
          Vous répondez aux questions des citoyens au nom de la commune.
          {report && (
            <span className="ml-2 text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center">
              <FileText className="w-3 h-3 mr-1" /> Discussion sur « {report.title} »
            </span>
          )}
          <span className="ml-2 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full text-[11px] font-semibold">● {allContacts.filter(c => c.online).length} citoyens en ligne</span>
        </p>
      </div>

      <div className="h-[calc(100vh-14rem)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex">
        {/* Conversations List */}
        <aside className={clsx("w-full sm:w-80 lg:w-96 flex flex-col border-r border-slate-100", groups.length === 0 ? "flex" : "hidden sm:flex")}>
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un citoyen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {sortedContacts.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">Aucun citoyen trouvé.</div>
            )}
            {sortedContacts.map(contact => {
              const isActive = contact.id === activeContactId;
              const msgs = conversations[contact.id] || [];
              const lastMsg = msgs[msgs.length - 1];
              const unread = contact.unread && !isActive ? contact.unread : undefined;
              return (
                <button
                  key={contact.id}
                  onClick={() => setActiveContactId(contact.id)}
                  className={clsx(
                    "w-full flex items-center px-4 py-3 hover:bg-slate-50 transition-colors text-left border-l-[3px]",
                    isActive ? "border-violet-500 bg-violet-50/60" : "border-transparent"
                  )}
                >
                  <div className="relative flex-shrink-0 mr-3">
                    <div className={clsx("w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-lg shadow-sm", contact.gradient)}>
                      <span>{contact.avatar}</span>
                    </div>
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-slate-800 truncate">{contact.name}</p>
                      <span className="text-[10px] text-slate-400 font-medium flex-shrink-0 ml-2">
                        {lastMsg ? lastMsg.time : contact.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-px">{contact.district}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className={clsx("text-xs truncate max-w-[70%]", unread ? "font-semibold text-slate-700" : "text-slate-400")}>
                        {lastMsg ? (lastMsg.fromMe ? 'Vous : ' : '') + lastMsg.text : contact.lastMessage}
                        {lastMsg?.fromMe && !lastMsg.read && ' · envoyé'}
                      </p>
                      {unread ? (
                        <span className="w-5 h-5 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">{unread}</span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Chat Panel */}
        <section className={clsx("flex-1 flex flex-col min-w-0", groups.length === 0 ? "hidden sm:flex" : "flex")}>
          {activeContact ? (
            <>
              {/* Chat Header */}
              <header className="flex items-center px-4 py-3 border-b border-slate-100 bg-white">
                <button onClick={() => setActiveContactId('')} className="sm:hidden mr-2 text-slate-500">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className={clsx("w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-base shadow-sm mr-3", activeContact.gradient)}>
                  <span>{activeContact.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{activeContact.name}</p>
                  <p className={clsx("text-xs font-medium flex items-center", activeContact.online ? "text-emerald-600" : "text-slate-400")}>
                    {activeContact.online
                      ? <><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 inline-block"></span> En ligne · {activeContact.district}</>
                      : activeContact.district}
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-slate-400">
                  <Phone className="w-5 h-5 hover:text-violet-600 cursor-pointer transition-colors" />
                  <Video className="w-5 h-5 hover:text-violet-600 cursor-pointer transition-colors" />
                  <MoreVertical className="w-5 h-5 hover:text-violet-600 cursor-pointer transition-colors" />
                </div>
              </header>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 bg-slate-50/60">
                {groups.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
                    <p className="text-sm font-medium">Sélectionnez un citoyen pour répondre à sa demande.</p>
                  </div>
                )}
                {groups.map(group => (
                  <div key={group.day} className="mb-4">
                    <div className="text-center mb-4">
                      <span className="text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">{group.day}</span>
                    </div>
                    <div className="space-y-3">
                      {group.items.map((msg, idx) => {
                        const showAvatar = !msg.fromMe && (idx === 0 || group.items[idx - 1].fromMe);
                        return (
                          <div key={msg.id} className={clsx("flex items-end", msg.fromMe ? "justify-end" : "justify-start")}>
                            {!msg.fromMe && (
                              <div className={clsx("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shadow-sm mr-2 flex-shrink-0", activeContact.gradient, !showAvatar && "opacity-0")}>
                                {getInitials(activeContact.name).slice(0, 2)}
                              </div>
                            )}
                            <div className={clsx("max-w-[78%]", msg.fromMe && "order-1")}>
                              <div className={clsx(
                                "rounded-2xl px-4 py-2.5 shadow-sm",
                                msg.fromMe
                                  ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-br-md"
                                  : "bg-white border border-slate-100 text-slate-700 rounded-bl-md",
                                msg.attachment?.type === 'alert' && !msg.fromMe && "border-red-200"
                              )}>
                                {attachmentChip(msg.attachment)}
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                                <p className={clsx("text-[10px] mt-1 flex items-center justify-end gap-1", msg.fromMe ? "text-emerald-100" : "text-slate-400")}>
                                  {msg.fromMe && <span className="font-semibold">Vous · </span>}
                                  {msg.time}
                                  {msg.fromMe && <CheckCheck className={clsx("w-3 h-3", msg.read ? "text-emerald-100" : "text-emerald-100/60")} />}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex items-end">
                    <div className={clsx("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shadow-sm mr-2 flex-shrink-0", activeContact.gradient)}>
                      {getInitials(activeContact.name).slice(0, 2)}
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                      <span className="text-[10px] text-slate-400 ml-1.5">est en train d'écrire...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Composer */}
              <footer className="border-t border-slate-100 bg-white p-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1 flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-3 py-1 focus-within:ring-2 focus-within:ring-emerald-500">
                    <input
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                      placeholder={`Répondre à ${activeContact.name} au nom de la commune...`}
                      className="flex-1 bg-transparent outline-none text-sm py-2"
                    />
                    <div className="flex items-center gap-1 text-slate-400">
                      <button title="Joindre une réponse photo" onClick={() => sendMessage('', { type: 'photo', label: 'Photo transmise.jpg' })} className="p-1.5 hover:bg-slate-100 hover:text-emerald-600 rounded-lg transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button title="Partager ma position" onClick={() => sendMessage('', { type: 'position', label: '18.8792°S, 47.5079°E' })} className="p-1.5 hover:bg-slate-100 hover:text-emerald-600 rounded-lg transition-colors">
                        <Navigation className="w-5 h-5" />
                      </button>
                      <button title="Envoyer un accusé de traitement" onClick={() => sendMessage('', { type: 'alert', label: 'Accusé : message transmis aux services' })} className="p-1.5 hover:bg-slate-100 hover:text-red-500 rounded-lg transition-colors">
                        <AlertTriangle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => sendMessage()}
                    disabled={!draft.trim()}
                    className="w-11 h-11 bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 transition-all active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <CircleUser className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-600">Messagerie citoyenne</h3>
              <p className="text-sm mt-1 max-w-sm">Sélectionnez un citoyen à gauche pour consulter sa demande et y répondre au nom de la commune.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}