import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import { Report, ReportStatus, ReportPriority, SignalType } from '../context/AppContext';

// Field mapping helpers between the Flutter app (Supabase table "signalement")
// and the web admin Report interface.

interface SignalementRow {
  id: number | string;
  type?: string;
  categorie?: string;
  probleme?: string;
  description?: string;
  adresse?: string;
  image?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  priorite?: string;
  confidenceScore?: number;
  keywords?: string;
  upvotesCount?: number;
  isDuplicate?: number;
  duplicateOfId?: string;
  isCriticalZone?: number;
  createdAt?: string;
  userId?: string;
  userPseudo?: string;
  assignedTeam?: string | null;
}

const getSignalType = (type?: string): SignalType =>
  type === 'Bâtiment communal' ? 'Bâtiment communal' : 'Espace public';

const buildTitle = (row: SignalementRow): string => {
  const words = (row.description || '').split(' ').slice(0, 5).join(' ');
  return `Signalement ${row.categorie || 'divers'}${words ? ` : ${words}...` : ''}`;
};

export const mapRowToReport = (row: SignalementRow): Report => ({
  id: String(row.id),
  title: buildTitle(row),
  description: row.description || '',
  category: row.categorie || 'Divers',
  subCategory: row.probleme || undefined,
  signalType: getSignalType(row.type),
  status: (row.status as ReportStatus) || 'En attente',
  priority: (row.priorite as ReportPriority) || 'Moyenne',
  location: row.adresse || '',
  date: row.createdAt || new Date().toISOString(),
  imageUrl: row.image || undefined,
  assignedTeam: row.assignedTeam || undefined,
  citizenId: row.userId || '',
  aiAnalyzed: (row.confidenceScore ?? 0.8) > 0.3,
});

export const mapReportToRow = (report: Report): Partial<SignalementRow> => ({
  type: report.signalType,
  categorie: report.category,
  probleme: report.subCategory,
  description: report.description,
  adresse: report.location,
  image: report.imageUrl,
  status: report.status,
  priorite: report.priority,
  createdAt: report.date,
  userId: report.citizenId,
  assignedTeam: report.assignedTeam || null,
});

// ---- Initial fetch -------------------------------------------------------

export const fetchSignalements = async (): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('signalement')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Supabase fetch error:', error.message);
    return [];
  }
  return (data as SignalementRow[]).map(mapRowToReport);
};

// ---- Mutations (writes back so the Flutter app sees the change too) ------

export const updateReportStatus = async (id: string, status: ReportStatus) => {
  const { error } = await supabase
    .from('signalement')
    .update({ status })
    .eq('id', id);
  if (error) console.error('Supabase update status error:', error.message);
};

export const updateReportPriority = async (id: string, priority: ReportPriority) => {
  const { error } = await supabase
    .from('signalement')
    .update({ priorite: priority })
    .eq('id', id);
  if (error) console.error('Supabase update priority error:', error.message);
};

export const assignTeamToReport = async (id: string, team: string | null) => {
  const { error } = await supabase
    .from('signalement')
    .update({ assignedTeam: team })
    .eq('id', id);
  if (error) console.error('Supabase assign team error:', error.message);
};

export const deleteReport = async (id: string) => {
  const { error } = await supabase
    .from('signalement')
    .delete()
    .eq('id', id);
  if (error) console.error('Supabase delete error:', error.message);
};

// ---- Realtime subscription ----------------------------------------------

export type ReportChangeEvent = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  newReport?: Report;
  oldId?: string | number;
};

export const subscribeToSignalements = (
  onEvent: (event: ReportChangeEvent) => void
) => {
  const channel = supabase
    .channel('signalement-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'signalement' },
      (payload) => {
        const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
        if (eventType === 'DELETE') {
          onEvent({ eventType, oldId: payload.old?.id });
        } else {
          onEvent({ eventType, newReport: mapRowToReport(payload.new as SignalementRow) });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const isSupabaseConfigured = () =>
  SUPABASE_URL.includes('YOUR-PROJECT') === false &&
  SUPABASE_ANON_KEY.includes('YOUR_ANON') === false;