// Moteur d'estimation de devis par catégorie (en Ariary, MGA).
// Utilisé par l'agent chat admin (AdminQuoteAgent) et le détail d'un signalement.

export interface QuoteLine {
  label: string;
  amount: number;
}

export interface Quote {
  category: string;
  subCategory?: string;
  lines: QuoteLine[];
  mainLabor: QuoteLine;
  total: number;
  delay: string;
  disclaimer: string;
}

interface QuoteRule {
  category: string;
  keywords: string[];
  lines: QuoteLine[];
  labor: QuoteLine;
  delay: string;
}

export const formatAR = (n: number) =>
  n.toLocaleString('fr-FR').replace(/\u202f/g, ' ') + ' Ar';

const RULES: QuoteRule[] = [
  {
    category: 'Gestion de l\'eau',
    keywords: ['eau', 'fuite', 'coupure', 'égoût', 'égout', 'canalisation', 'plomberie', 'robinet', 'tuyau'],
    lines: [
      { label: 'Tuyau PVC ∅ 63mm (2m)', amount: 5000 },
      { label: 'Joint & raccords', amount: 2500 },
      { label: 'Sable & ciment (scellement)', amount: 4000 },
      { label: 'Petit outillage', amount: 2000 },
    ],
    labor: { label: 'Main d\'œuvre (plombier, 1/2 journée)', amount: 22000 },
    delay: 'Intervention sous 24h',
  },
  {
    category: 'Voirie',
    keywords: ['nid de poule', 'route', 'trottoir', 'voirie', 'chaussée', 'trou', 'accotement', 'bitume'],
    lines: [
      { label: 'Gravats & enrobé à froid (1 sac)', amount: 12000 },
      { label: 'Compactage / location mini-pelle', amount: 25000 },
      { label: 'Signalisation temporaire', amount: 8000 },
      { label: 'Sécurité chantier (cônes)', amount: 6000 },
    ],
    labor: { label: 'Main d\'œuvre (2 ouvriers, 1 jour)', amount: 35000 },
    delay: 'Traitement en 3 à 5 jours ouvrés',
  },
  {
    category: 'Éclairage public',
    keywords: ['éclairage', 'lampadaire', 'ampoule', 'lumière', 'projecteur', 'électricité', 'câble', 'électrique'],
    lines: [
      { label: 'Amphibole LED 100W', amount: 45000 },
      { label: 'Câble électrique (20m)', amount: 15000 },
      { label: 'Connectique & dominos', amount: 3000 },
      { label: 'Nacelle / élévateur', amount: 20000 },
    ],
    labor: { label: 'Main d\'œuvre (électricien, 1/2 journée)', amount: 25000 },
    delay: 'Intervention sous 48h',
  },
  {
    category: 'Propreté',
    keywords: ['déchet', 'ordures', 'poubelle', 'sauvage', 'propreté', 'collecte', 'encombrant', 'immondice'],
    lines: [
      { label: 'Location benne 3m³', amount: 30000 },
      { label: 'Sacs industriels & gants', amount: 5000 },
      { label: 'Transport / benne de collecte', amount: 15000 },
    ],
    labor: { label: 'Main d\'œuvre (2 agents, 1/2 journée)', amount: 20000 },
    delay: 'Collecte sous 48h',
  },
  {
    category: 'École & bâtiment communal',
    keywords: ['école', 'bâtiment', 'classe', 'toiture', 'mairie', 'municipal', 'fenêtre', 'toit', 'peinture'],
    lines: [
      { label: 'Matériaux de réparation', amount: 20000 },
      { label: 'Peinture & primaire', amount: 18000 },
      { label: 'Quincaillerie (visserie, scellement)', amount: 7000 },
    ],
    labor: { label: 'Main d\'œuvre (2 ouvriers, 1 jour)', amount: 38000 },
    delay: 'Traitement en 5 à 7 jours ouvrés',
  },
  {
    category: 'Complexe sportif',
    keywords: ['sport', 'stade', 'vestiaire', 'terrain', 'complexe', 'matériel sportif', 'but', 'panier'],
    lines: [
      { label: 'Matériel sportif / filet', amount: 25000 },
      { label: 'Réparations mobilières', amount: 15000 },
      { label: 'Vestiaires (vitrerie, robinetterie)', amount: 20000 },
    ],
    labor: { label: 'Main d\'œuvre (technicien, 1 jour)', amount: 30000 },
    delay: 'Traitement en 5 à 7 jours ouvrés',
  },
];

const FALLBACK = {
  category: 'Divers',
  lines: [
    { label: 'Fournitures / petits matériaux', amount: 15000 },
    { label: 'Transport', amount: 10000 },
  ],
  labor: { label: 'Main d\'œuvre estimée', amount: 20000 },
  delay: 'Estimée après inspection sur site',
};

export const getAllQuoteCategories = () => [
  ...new Set<string>(RULES.map(r => r.category)),
];

export const estimateQuote = (category: string, subCategory?: string): Quote => {
  const catLower = (category + ' ' + (subCategory || '')).toLowerCase();
  const rule =
    RULES.find(r => r.keywords.some(k => catLower.includes(k))) ||
    (category === 'Propreté'
      ? RULES[3]
      : category === 'Éclairage public'
        ? RULES[2]
        : category === 'Voirie'
          ? RULES[1]
          : category.includes('eau')
            ? RULES[0]
            : undefined);

  const q = rule || FALLBACK;
  const total = q.lines.reduce((s, l) => s + l.amount, 0) + q.labor.amount;

  return {
    category: rule ? q.category : category,
    subCategory: rule ? subCategory : undefined,
    lines: q.lines,
    mainLabor: q.labor,
    total,
    delay: q.delay,
    disclaimer: 'Devis estimatif hors taxes. Montant définitif après visite technique et validation du service concerné.',
  };
};

export const buildQuoteMessage = (category: string, subCategory?: string) => {
  const q = estimateQuote(category, subCategory);
  const lines = q.lines.map(l => `• ${l.label} : ${formatAR(l.amount)}`).join('\n');
  return [
    `🧾 Devis estimatif — ${q.category}${subCategory ? ' (' + subCategory + ')' : ''}`,
    '',
    lines,
    `• ${q.mainLabor.label} : ${formatAR(q.mainLabor.amount)}`,
    '',
    `💰 **Total estimé : ${formatAR(q.total)}**`,
    `⏱️ ${q.delay}`,
    '',
    `_${q.disclaimer}_`,
  ].join('\n');
};