// Moteur d'estimation des travaux requis pour l'éclairage public.
// L'agent fournit une ESTIMATION des travaux à prévoir (étapes, moyens, délai) :
// aucun montant ni prix fixe n'est affiché, il s'agit uniquement d'un conseil.

export interface WorkLine {
  label: string;
}

export type Complexity = 'Légère' | 'Modérée' | 'Importante';

export interface WorkEstimate {
  category: string;
  subCategory?: string;
  lines: WorkLine[];
  mainWork: string;
  delay: string;
  complexity: Complexity;
  disclaimer: string;
}

interface EstimateRule {
  category: string;
  keywords: string[];
  lines: string[];
  mainWork: string;
  delay: string;
  complexity: Complexity;
}

const RULES: EstimateRule[] = [
  {
    category: 'Lampadaire clignotant',
    keywords: ['clignot', 'scintill', 'vacille'],
    lines: [
      'Vérification des contacts et du ballast',
      'Remplacement du condensateur / starter',
      'Resserrement des connexions',
    ],
    mainWork: 'Équipe éclairage : 1 technicien, intervention rapide',
    delay: 'Intervention sous 72h',
    complexity: 'Légère',
  },
  {
    category: 'Lampadaire cassé',
    keywords: ['cassé', 'casse', 'brisé', 'fracass', 'mât', 'lampadaire tombé'],
    lines: [
      'Sécurisation de la zone (balisage)',
      'Remplacement du mât / du luminaire endommagé',
      'Raccordement électrique et test',
    ],
    mainWork: 'Équipe éclairage : nacelle + 2 techniciens',
    delay: 'Intervention sous 5 jours ouvrés',
    complexity: 'Importante',
  },
  {
    category: 'Lampadaire éteint',
    keywords: ['éteint', "ne s\\'allume", "ne s\\'allument", 'ne fonctionne', 'sombre', 'pas de lumière'],
    lines: [
      'Vérification de la cellule photodétectrice',
      'Réglage / remplacement du capteur crépusculaire',
      'Contrôle de la ligne d\'alimentation',
    ],
    mainWork: 'Équipe éclairage : 1 technicien, intervention standard',
    delay: 'Intervention sous 48h',
    complexity: 'Modérée',
  },
  {
    category: 'Colonne / câblage défectueux',
    keywords: ['câble', 'cablage', 'câblage', 'colonne', 'coffret', 'fusible', 'court-circuit', 'disjoncteur'],
    lines: [
      'Mise hors tension sécurisée',
      'Remplacement du câble / de la colonne endommagée',
      'Réparation du coffret de commande',
      'Remise sous tension et vérifications',
    ],
    mainWork: 'Équipe éclairage : nacelle + 2 techniciens',
    delay: 'Intervention sous 48h',
    complexity: 'Importante',
  },
  {
    category: 'Panne d\'éclairage',
    keywords: ['panne', 'éclairage public', 'lumière'],
    lines: [
      'Diagnostic de la colonne d\'éclairage',
      'Remplacement de l\'ampoule / du module LED',
      'Contrôle du circuit et du disjoncteur',
    ],
    mainWork: 'Équipe éclairage : 1 technicien, intervention standard',
    delay: 'Intervention sous 48h',
    complexity: 'Modérée',
  },
];

const FALLBACK: EstimateRule = {
  category: 'Éclairage public (autre)',
  keywords: [],
  lines: [
    'Inspection technique sur site',
    'Diagnostic de la nature de la panne',
  ],
  mainWork: 'Équipe éclairage : 1 technicien',
  delay: 'Estimée après inspection sur site',
  complexity: 'Modérée',
};

export const estimateWork = (category: string, subCategory?: string): WorkEstimate => {
  const catLower = (category + ' ' + (subCategory || '')).toLowerCase();
  const rule = RULES.find(r => r.keywords.some(k => catLower.includes(k))) || FALLBACK;

  return {
    category: rule.category,
    subCategory,
    lines: rule.lines.map(label => ({ label })),
    mainWork: rule.mainWork,
    delay: rule.delay,
    complexity: rule.complexity,
    disclaimer:
      'Conseil technique indicatif des travaux à réaliser. Le périmètre définitif sera confirmé après visite technique de l\'équipe éclairage.',
  };
};

// ---- Réponses naturelles de secours (utilisées si le moteur Python est hors ligne) ---

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const INTROS = [
  'Très bien, voici mon conseil pour **{category}** :',
  'Avec plaisir, voici les travaux à prévoir pour **{category}** :',
  'C\'est noté ! Pour **{category}**, je vous recommande les étapes suivantes :',
  'Je comprends. Voici ce que je vous conseille pour **{category}** :',
];

const FOLLOW_UPS = [
  'Souhaitez-vous que je prépare ce signalement pour l\'équipe électrique ?',
  'Voulez-vous que je transmette ce conseil dans un signalement pour l\'équipe sur site ?',
  'Faut-il que je crée le signalement associé pour l\'équipe d\'intervention ?',
];

export const estimateIntro = (category: string): string =>
  pick(INTROS).replace('{category}', category);

export const estimateFollowUp = (): string => pick(FOLLOW_UPS);

export const formatEstimateReply = (
  category: string,
  estimate: WorkEstimate,
  extra?: string[]
): string => {
  const lines: string[] = [estimateIntro(category), ''];
  estimate.lines.forEach(line => lines.push(`- ${line.label}`));
  lines.push('', `**Moyens à mobiliser** : ${estimate.mainWork}`);
  lines.push(`**Délai souhaitable** : ${estimate.delay}`, '');
  if (extra) lines.push(...extra, '');
  lines.push(`_Conseil technique indicatif : seule l'équipe sur site valide le périmètre définitif. Aucun tarif n'est communiqué._`, '');
  lines.push(estimateFollowUp());
  return lines.join('\n');
};