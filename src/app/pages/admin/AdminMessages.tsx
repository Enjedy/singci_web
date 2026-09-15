import { useState } from 'react';
import { Search, Phone, Video, Send, Paperclip, Navigation, AlertTriangle, ArrowLeft, MoreVertical, CheckCheck, Image as ImageIconG, MapPin, Zap } from 'lucide-react';
import { clsx } from 'clsx';

interface Contact {
  id: string;
  name: string;
  role: string;
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
  fromMe: boolean;
  text: string;
  time: string;
  attachment?: { type: 'photo' | 'position' | 'alert'; label: string };
}

const contacts: Contact[] = [
  { id: 'MAIRIE', name: 'Mairie de la ville', role: 'Secrétariat Général', avatar: '🏛️', gradient: 'from-violet-500 to-blue-500', online: true, lastMessage: 'Votre demande a été transmise au service concerné.', time: '09:12', unread: 2 },
  { id: 'GEND', name: 'Gendarmerie Nationale', role: 'Brigade locale', avatar: '👮', gradient: 'from-blue-600 to-indigo-600', online: true, lastMessage: 'Merci pour le signalement, nous envoyons un véhicule sur place.', time: '08:47' },
  { id: 'SANTE', name: 'Centre de Santé', role: 'Infirmerie municipale', avatar: '🏥', gradient: 'from-rose-500 to-violet-500', online: false, lastMessage: 'Vaccination : ouverte ce mercredi de 8h à 14h.', time: 'Hier' },
  { id: 'ECOLE', name: 'École Élémentaire', role: 'Direction des écoles', avatar: '🏫', gradient: 'from-amber-500 to-orange-500', online: true, lastMessage: 'La rentrée se fera normalement lundi.', time: 'Hier', unread: 1 },
  { id: 'JIRAMA', name: 'Jirama (Eau & Élec.)', role: 'Service technique', avatar: '💡', gradient: 'from-sky-400 to-blue-600', online: false, lastMessage: 'Le rétablissement de l\u0027eau est prévu à 15h.', time: 'Lun' },
  { id: 'CUA', name: 'CUA Propreté', role: 'Collecte des déchets', avatar: '🚮', gradient: 'from-emerald-500 to-teal-600', online: true, lastMessage: 'La collecte passera demain matin dans votre quartier.', time: 'Lun' },
];

const mockReplies: Record<string, { auto: string }> = {
  MAIRIE: { auto: 'Merci pour votre message. Notre secrétariat accuse réception de votre demande et transmettra à l\u0027équipe concernée dans les plus brefs délais.' },
  GEND: { auto: 'Nous avons bien noté votre alerte. Un agent va être dépêché sur place pour vérification. Restez à disposition.' },
  SANTE: { auto: 'Le centre de santé est ouvert du lundi au vendredi de 8h à 17h. En cas d\u0027urgence vitale, composez le 913.' },
  ECOLE: { auto: 'Merci de votre retour. La direction de l\u0027école prendra les mesures nécessaires dès cette semaine.' },
  JIRAMA: { auto: 'Votre panne a été enregistrée. Notre techicien interviendra sous 24h pour diagnostiquer le problème.' },
  CUA: { auto: 'Nous avons inscrit votre adresse dans la tournée de collecte. Merci de déposer vos ordures avant 6h du matin.' },
};

export default function AdminMessages() {
  const [activeContactId, setActiveContactId] = useState<string>('MAIRIE');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState<Record<string, Message[]>>({
    MAIRIE: [
      { id: 'M1', contactId: 'MAIRIE', fromMe: false, text: 'Bonjour ! Votre signalement « Nid de poule Avenue République » a bien été reçu et enregistré sous le n° REP-001.', time: '09:02' },
      { id: 'M2', contactId: 'MAIRIE', fromMe: true, text: 'Bonjour, pouvez-vous m\u0027indiquer un délai d\u0027intervention ?', time: '09:05' },
      { id: 'M3', contactId: 'MAIRIE', fromMe: false, text: 'L\u0027équipe Voirie N1 intervient cette semaine. Je vous tiens au courant.', time: '09:12' },
    ],
    GEND: [
      { id: 'G1', contactId: 'GEND', fromMe: false, text: 'Merci pour le signalement, nous envoyons un véhicule sur place.', time: '08:47' },
    ],
  });

  const [currentDraft, setCurrentDraft] = useState('');

  const activeContact = contacts.find(c => c.id === activeContactId)!;
  const messages = conversations[activeContactId] || [];

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => name.replace(/[^a-zA-ZÀ-ÿ ]/g, '').trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const sendMessage = (text?: string, attachment?: Message['attachment']) => {
    const finalText = text ?? '';
    if (!finalText.trim() && !attachment) return;

    const userMsg: Message = {
      id: `U${Date.now()}`,
      contactId: activeContactId,
      fromMe: true,
      text: finalText,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      attachment,
    };

    setConversations(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), userMsg],
    }));
    setCurrentDraft('');

    // Réponse automatique du contact (simulation de l'APK SignCi)
    setTimeout(() => {
      const reply: Message = {
        id: `R${Date.now()}`,
        contactId: activeContactId,
        fromMe: false,
        text: mockReplies[activeContactId]?.auto || 'Merci, votre message a bien été transmis.',
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        attachment: attachment?.type === 'position' ? { type: 'position', label: 'Position reçue (18.8792°S, 47.5079°E)' } : undefined,
      };
      setConversations(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), reply],
      }));
    }, 1200);
  };

  // Sort conversations by unread first, keep multiple recent first
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const aLast = conversations[a.id]?.length || 0;
    const aUnread = a.unread || 0;
    const bUnread = b.unread || 0;
    const aIdx = aUnread === 0 ? 1 : (aLast > 0 ? -1 : 1);
    const bIdx = bUnread === 0 ? 1 : (bLast > 0 ? -1 : 1);
    return aIdx - bIdx || (bUnread - aUnread);
  });

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Messagerie</h1>
          <p className="text-sm text-slate-500 mt-1">Échangez avec la Mairie, les services municipaux et les partenaires.</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex">
        {/* Conversations List */}
        <aside className={clsx("w-full sm:w-80 md:w-96 flex flex-col border-r border-slate-100", messages.length === 0 ? "flex" : "hidden sm:flex")}>
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sortedContacts.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">Aucun contact trouvé.</div>
            )}
            {sortedContacts.map(contact => {
              const isActive = contact.id === activeContactId;
              const msgs = conversations[contact.id] || [];
              const lastMsg = msgs[msgs.length - 1];
              return (
                <button
                  key={contact.id}
                  onClick={() => setActiveContactId(contact.id)}
                  className={clsx(
                    "w-full flex items-center px-3 py-3 hover:bg-slate-50 transition-colors text-left border-l-[3px]",
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
                      <span className="text-[10px] text-slate-400 font-medium flex-shrink-0 ml-2">{contact.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{contact.role}</p>
                    <div className="flex justify-between items-center mt-0.5">
                      <p className={clsx("text-xs truncate max-w-[70%]", contact.unread ? "font-semibold text-slate-700" : "text-slate-400")}>
                        {lastMsg ? (lastMsg.fromMe ? 'Vous : ' : '') + lastMsg.text : contact.lastMessage}
                      </p>
                      {contact.unread ? (
                        <span className="w-5 h-5 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">{contact.unread}</span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Chat Panel */}
        <section className={clsx("flex-1 flex flex-col min-w-0", messages.length === 0 ? "hidden sm:flex" : "flex")}>
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
              <p className={clsx("text-xs font-medium", activeContact.online ? "text-emerald-600" : "text-slate-400")}>
                {activeContact.online ? 'En ligne' : 'Hors ligne'}
              </p>
            </div>
            <div className="flex items-center space-x-3 text-slate-400">
              <Phone className="w-5 h-5 hover:text-violet-600 cursor-pointer transition-colors" />
              <Video className="w-5 h-5 hover:text-violet-600 cursor-pointer transition-colors" />
              <MoreVertical className="w-5 h-5 hover:text-violet-600 cursor-pointer transition-colors" />
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
                <p className="text-sm font-medium">Sélectionnez un contact pour commencer la conversation.</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={clsx("flex", msg.fromMe ? "justify-end" : "justify-start")}>
                <div className={clsx(
                  "max-w-[78%] rounded-2xl px-4 py-2.5 shadow-sm",
                  msg.fromMe
                    ? "bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-br-md"
                    : "bg-white border border-slate-100 text-slate-700 rounded-bl-md"
                )}>
                  {msg.attachment && (
                    <div className={clsx(
                      "flex items-center gap-2 rounded-lg px-2.5 py-2 mb-1.5 text-xs font-bold",
                      msg.attachment.type === 'photo' && "bg-slate-100 text-slate-700",
                      msg.attachment.type === 'position' && "bg-blue-50 text-blue-700",
                      msg.attachment.type === 'alert' && "bg-red-50 text-red-700"
                    )}>
                      {msg.attachment.type === 'photo' && <ImageIconG className="w-4 h-4" />}
                      {msg.attachment.type === 'position' && <MapPin className="w-4 h-4" />}
                      {msg.attachment.type === 'alert' && <AlertTriangle className="w-4 h-4" />}
                      <span>{msg.attachment.label}</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                  <p className={clsx("text-[10px] mt-1 text-right", msg.fromMe ? "text-violet-100" : "text-slate-400")}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <footer className="border-t border-slate-100 bg-white p-3">
            <div className="flex items-end gap-2">
              <div className="flex-1 flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-3 py-1">
                <input
                  type="text"
                  value={currentDraft}
                  onChange={(e) => setCurrentDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                  placeholder="Écrivez votre message..."
                  className="flex-1 bg-transparent outline-none text-sm py-2"
                />
                <div className="flex items-center gap-1 text-slate-400">
                  <button title="Joindre une photo" onClick={() => sendMessage('', { type: 'photo', label: 'Photo jointe.jpg' })} className="p-1.5 hover:bg-slate-100 hover:text-violet-600 rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button title="Partager ma position" onClick={() => sendMessage('', { type: 'position', label: '18.8792°S, 47.5079°E' })} className="p-1.5 hover:bg-slate-100 hover:text-violet-600 rounded-lg transition-colors">
                    <Navigation className="w-5 h-5" />
                  </button>
                  <button title="Envoiyer une alerte signalement" onClick={() => sendMessage('', { type: 'alert', label: 'Alerte : Signalement urgent' })} className="p-1.5 hover:bg-slate-100 hover:text-red-500 rounded-lg transition-colors">
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!currentDraft.trim()}
                className="w-11 h-11 bg-gradient-to-br from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200 transition-all active:scale-95"
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
