import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import {
  fetchSignalements,
  subscribeToSignalements,
  updateReportStatus as supabaseUpdateStatus,
  updateReportPriority as supabaseUpdatePriority,
  assignTeamToReport as supabaseAssignTeam,
  isSupabaseConfigured,
} from '../services/SupabaseService';

export type ReportStatus = 'En attente' | 'En cours' | 'Résolu';
export type ReportPriority = 'Basse' | 'Moyenne' | 'Haute';
export type SignalType = 'Espace public' | 'Bâtiment communal';

export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  signalType: SignalType;
  status: ReportStatus;
  priority: ReportPriority;
  location: string;
  date: string;
  imageUrl?: string;
  assignedTeam?: string;
  citizenId: string;
  aiAnalyzed?: boolean;
}

const initialReports: Report[] = [
  {
    id: 'REP-001',
    title: 'Nid de poule dangereux',
    description: 'Un grand nid de poule sur la voie de droite qui endommage les pneus des voitures.',
    category: 'Voirie',
    subCategory: 'Nid de poule',
    signalType: 'Espace public',
    status: 'En attente',
    priority: 'Haute',
    location: 'Avenue de la République',
    date: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400',
    citizenId: 'CIT-123',
    aiAnalyzed: true,
    assignedTeam: 'Équipe Voirie N1'
  },
  {
    id: 'REP-002',
    title: 'Lampadaire cassé',
    description: 'Le lampadaire clignote sans arrêt depuis 3 jours, rendant le trottoir très sombre la nuit.',
    category: 'Éclairage public',
    subCategory: 'Panne d\'éclairage',
    signalType: 'Espace public',
    status: 'En cours',
    priority: 'Moyenne',
    location: 'Rue des Fleurs, angle Victor Hugo',
    date: new Date().toISOString(),
    assignedTeam: 'Équipe Électrique Nord',
    citizenId: 'CIT-123',
    aiAnalyzed: true
  },
];

interface AppContextType {
  reports: Report[];
  connectingToSupabase: boolean;
  supabaseError: string | null;
  addReport: (report: Pick<Report, 'description' | 'location' | 'imageUrl' | 'citizenId' | 'category' | 'subCategory' | 'signalType'>) => void;
  updateReportStatus: (id: string, status: ReportStatus) => void;
  updateReportPriority: (id: string, priority: ReportPriority) => void;
  assignTeam: (id: string, team: string) => void;
  refreshReports: () => Promise<void>;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getTeamForCategory = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('voirie') || cat.includes('route')) return 'Équipe Voirie N1';
  if (cat.includes('éclairage') || cat.includes('électricité')) return 'Équipe Électrique Nord';
  if (cat.includes('eau') || cat.includes('plomberie')) return 'Service Plomberie';
  if (cat.includes('propreté') || cat.includes('déchet')) return 'Service Nettoyage';
  if (cat.includes('école') || cat.includes('bâtiment')) return 'Maintenance Bâtiments';
  return 'Équipe Polyvalente';
};

const simulateAIAnalysis = (description: string, category: string) => {
  const descLower = description.toLowerCase();
  let priority: ReportPriority = 'Basse';

  if (descLower.includes('danger') || descLower.includes('urgence') || descLower.includes('fuite') || descLower.includes('trou') || descLower.includes('accident')) {
    priority = 'Haute';
  } else if (descLower.includes('panne') || descLower.includes('cassé') || descLower.includes('lumière')) {
    priority = 'Moyenne';
  }

  const words = description.split(' ').slice(0, 4).join(' ');
  const title = `Signalement ${category} : ${words}...`;

  return { title, priority };
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [connectingToSupabase, setConnectingToSupabase] = useState(isSupabaseConfigured());
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshReports = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setConnectingToSupabase(false);
      setSupabaseError('Supabase n\'est pas configuré : renseignez SUPABASE_URL et SUPABASE_ANON_KEY dans src/app/config/supabase.ts');
      return;
    }
    try {
      const data = await fetchSignalements();
      if (data.length > 0) {
        setReports(data);
      }
      setSupabaseError(null);
    } catch (err: any) {
      setSupabaseError(err?.message || 'Erreur de connexion à Supabase');
    } finally {
      setConnectingToSupabase(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribeRealtime: (() => void) | undefined;

    const init = async () => {
      if (isSupabaseConfigured()) {
        await refreshReports();

        // Realtime : le dashboard se met à jour instantanément
        // lorsqu'un citoyen insère/modifie/suppré un signalement
        // depuis l'application Flutter (dispositif == 'desktop'
        // limite volontairement aux navigateurs desktop).
        unsubscribeRealtime = subscribeToSignalements(({ eventType, newReport, oldId }) => {
          setReports(prev => {
            switch (eventType) {
              case 'INSERT':
                if (newReport && !prev.some(r => r.id === newReport.id)) {
                  return [newReport, ...prev];
                }
                return prev;
              case 'UPDATE':
                if (newReport) {
                  return prev.map(r => r.id === newReport.id ? newReport : r);
                }
                return prev;
              case 'DELETE':
                return prev.filter(r => r.id !== String(oldId));
              default:
                return prev;
            }
          });
        });
      } else {
        setConnectingToSupabase(false);
      }
    };

    init();

    return () => {
      if (unsubscribeRealtime) unsubscribeRealtime();
    };
  }, [refreshReports]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubAuth();
  }, []);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      const msg = getFirebaseErrorMessage(error.code);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const register = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      const msg = getFirebaseErrorMessage(error.code);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const clearAuthError = () => setAuthError(null);

  const addReport = (reportData: Pick<Report, 'description' | 'location' | 'imageUrl' | 'citizenId' | 'category' | 'subCategory' | 'signalType'>) => {
    const aiResult = simulateAIAnalysis(reportData.description, reportData.category);
    const assignedTeam = getTeamForCategory(reportData.category);

    const newReport: Report = {
      ...reportData,
      id: `REP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      title: aiResult.title,
      status: 'En attente',
      priority: aiResult.priority,
      date: new Date().toISOString(),
      aiAnalyzed: true,
      assignedTeam
    };

    setReports(prev => [newReport, ...prev]);
  };

  // Les mises à jour écrivent dans Supabase : le client Flutter
  // (Realtime) et toutes les pages admin connectées se synchronisent.
  const updateReportStatus = (id: string, status: ReportStatus) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (isSupabaseConfigured()) supabaseUpdateStatus(id, status);
  };

  const updateReportPriority = (id: string, priority: ReportPriority) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, priority } : r));
    if (isSupabaseConfigured()) supabaseUpdatePriority(id, priority);
  };

  const assignTeam = (id: string, team: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, assignedTeam: team } : r));
    const dbTeam = team === 'Non assigné' ? null : team;
    if (isSupabaseConfigured()) supabaseAssignTeam(id, dbTeam);
  };

  return (
    <AppContext.Provider value={{
      reports,
      connectingToSupabase,
      supabaseError,
      addReport,
      updateReportStatus,
      updateReportPriority,
      assignTeam,
      refreshReports,
      isAuthenticated,
      user,
      login,
      register,
      logout,
      authLoading,
      authError,
      clearAuthError
    }}>
      {children}
    </AppContext.Provider>
  );
};

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
      return 'Aucun compte trouvé avec cet email.';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect.';
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet email.';
    case 'auth/invalid-email':
      return 'Adresse email invalide.';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    case 'auth/invalid-credential':
      return 'Email ou mot de passe incorrect.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez plus tard.';
    default:
      return 'Une erreur est survenue. Réessayez.';
  }
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};