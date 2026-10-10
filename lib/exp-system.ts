import { DayRecord, QuestionBankItem, SubjectKey } from './types';

export interface LevelDefinition {
  level: number;
  title: string;
  minExp: number;
  perk: string;
  color: string;
  bgGlow: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'volume' | 'streak' | 'rigor' | 'time' | 'credit' | 'milestone';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  check: (stats: {
    totalQuestions: number;
    l3Questions: number;
    totalMinutes: number;
    streakDays: number;
    centurionDays: number;
    creditScore: number;
    totalExp: number;
    cleanSessions: number;
    bankedQuestionsCount: number;
  }) => boolean;
}

export const LEVELS: LevelDefinition[] = [
  { level: 1, title: 'Initiate Aspirant', minExp: 0, perk: 'Unlocked Precision Workstation & Daily Timer', color: '#94a3b8', bgGlow: 'rgba(148, 163, 184, 0.15)' },
  { level: 2, title: 'Disciplined Apprentice', minExp: 250, perk: 'Unlocked Academic Credit Rating Tracker', color: '#38bdf8', bgGlow: 'rgba(56, 189, 248, 0.15)' },
  { level: 3, title: 'Consistent Practitioner', minExp: 750, perk: 'Unlocked Spaced Repetition Priority Queue', color: '#34d399', bgGlow: 'rgba(52, 211, 153, 0.15)' },
  { level: 4, title: 'Problem Solver Specialist', minExp: 1500, perk: 'Unlocked Multi-Concept Analysis Telemetry', color: '#818cf8', bgGlow: 'rgba(129, 140, 248, 0.15)' },
  { level: 5, title: 'High-Yield Analyst', minExp: 3000, perk: 'Unlocked Advanced Diagnostics Heatmap', color: '#fbbf24', bgGlow: 'rgba(251, 191, 36, 0.15)' },
  { level: 6, title: 'Advanced Rigor Tactician', minExp: 5500, perk: 'Unlocked Custom Percentile Projection Formula', color: '#f97316', bgGlow: 'rgba(249, 115, 22, 0.15)' },
  { level: 7, title: 'Master Problem Solver', minExp: 9000, perk: 'Unlocked Supernova Flame Flare Badge', color: '#ec4899', bgGlow: 'rgba(236, 72, 153, 0.15)' },
  { level: 8, title: 'Fellow of Mechanics & Calculus', minExp: 14000, perk: 'Unlocked IIT Bombay Benchmark Velocity Mode', color: '#a855f7', bgGlow: 'rgba(168, 85, 247, 0.15)' },
  { level: 9, title: 'Olympiad & Advanced Vanguard', minExp: 21000, perk: 'Unlocked Elite AIR < 500 Candidate Seal', color: '#06b6d4', bgGlow: 'rgba(6, 182, 212, 0.15)' },
  { level: 10, title: 'Grandmaster (AIR < 500 Titan)', minExp: 32000, perk: 'Unlocked Golden Sovereign Aura & Grandmaster Seal', color: '#eab308', bgGlow: 'rgba(234, 179, 8, 0.2)' },
  { level: 11, title: 'Apex Sovereign (AIR 1 Caliber)', minExp: 50000, perk: 'Unlocked Immortal AIR 1 Workstation Citadel Status', color: '#f43f5e', bgGlow: 'rgba(244, 63, 94, 0.25)' }
];

export const BADGES: BadgeDefinition[] = [
  {
    id: 'b-first-step',
    title: 'First Spark',
    description: 'Logged your first solved question in the workstation.',
    icon: '✨',
    category: 'milestone',
    rarity: 'Common',
    check: s => s.totalQuestions >= 1
  },
  {
    id: 'b-centurion-blaze',
    title: 'Centurion Blaze 🔥',
    description: 'Achieved 100+ questions in a single day and parked an immortal flame on the Fire Calendar.',
    icon: '🔥',
    category: 'milestone',
    rarity: 'Epic',
    check: s => s.centurionDays >= 1
  },
  {
    id: 'b-triple-centurion',
    title: 'Triple Inferno 🔥🔥🔥',
    description: 'Completed 3 distinct Centurion Fire Days (100+ Qs/day).',
    icon: '🌋',
    category: 'milestone',
    rarity: 'Legendary',
    check: s => s.centurionDays >= 3
  },
  {
    id: 'b-streak-3',
    title: 'Habit Igniter',
    description: 'Maintained an unbroken 3-day practice streak.',
    icon: '⚡',
    category: 'streak',
    rarity: 'Common',
    check: s => s.streakDays >= 3
  },
  {
    id: 'b-streak-7',
    title: 'Week of Steel',
    description: 'Achieved a disciplined 7-day uninterrupted practice streak.',
    icon: '🛡️',
    category: 'streak',
    rarity: 'Rare',
    check: s => s.streakDays >= 7
  },
  {
    id: 'b-streak-14',
    title: 'Fortnight Crucible',
    description: 'Completed 14 consecutive days of rigorous JEE preparation.',
    icon: '💎',
    category: 'streak',
    rarity: 'Epic',
    check: s => s.streakDays >= 14
  },
  {
    id: 'b-l3-adv-25',
    title: 'Advanced Tactician',
    description: 'Solved 25 or more Level 3 (JEE Advanced Rigor) problems.',
    icon: '🔬',
    category: 'rigor',
    rarity: 'Rare',
    check: s => s.l3Questions >= 25
  },
  {
    id: 'b-l3-adv-100',
    title: 'Master of Rigor',
    description: 'Completed 100+ Level 3 JEE Advanced multi-concept derivations.',
    icon: '🎖️',
    category: 'rigor',
    rarity: 'Legendary',
    check: s => s.l3Questions >= 100
  },
  {
    id: 'b-time-500',
    title: 'Deep Work Scholar',
    description: 'Invested 500+ total minutes (over 8 hours) in focused problem solving.',
    icon: '⏳',
    category: 'time',
    rarity: 'Rare',
    check: s => s.totalMinutes >= 500
  },
  {
    id: 'b-credit-700',
    title: 'Prime Credit Standing',
    description: 'Earned an Academic Preparation Credit Score of 700 or higher.',
    icon: '💳',
    category: 'credit',
    rarity: 'Epic',
    check: s => s.creditScore >= 700
  },
  {
    id: 'b-credit-800',
    title: 'AIR-1 Credit Sovereign',
    description: 'Achieved an elite Academic Credit Score of 800+ (Top 0.5% preparation reliability).',
    icon: '👑',
    category: 'credit',
    rarity: 'Mythic',
    check: s => s.creditScore >= 800
  },
  {
    id: 'b-volume-500',
    title: 'Volume Centurion',
    description: 'Accumulated 500 total problems solved across PCM.',
    icon: '🏛️',
    category: 'volume',
    rarity: 'Epic',
    check: s => s.totalQuestions >= 500
  },
  {
    id: 'b-volume-1000',
    title: 'Kilothon Conqueror',
    description: 'Reached 1,000 cumulative problems recorded in your workstation.',
    icon: '🏆',
    category: 'volume',
    rarity: 'Legendary',
    check: s => s.totalQuestions >= 1000
  },
  {
    id: 'b-clean-mind',
    title: 'Precision Architect',
    description: 'Logged 5 or more subject sessions with Diagnostic status "Clean" (zero calculation slips).',
    icon: '🎯',
    category: 'milestone',
    rarity: 'Rare',
    check: s => s.cleanSessions >= 5
  },
  {
    id: 'b-question-banker',
    title: 'Curriculum Archivist',
    description: 'Authored and archived 5 custom problems into your personal Question Bank.',
    icon: '📚',
    category: 'milestone',
    rarity: 'Rare',
    check: s => s.bankedQuestionsCount >= 5
  }
];

export interface ExpStats {
  totalExp: number;
  currentLevel: LevelDefinition;
  nextLevel: LevelDefinition | null;
  levelProgress: number; // 0 to 100%
  expToNextLevel: number;
  creditScore: number;
  creditTier: string;
  creditRatingColor: string;
  breakdown: {
    l1Exp: number;
    l2Exp: number;
    l3Exp: number;
    timeExp: number;
    streakExp: number;
    fireBlazeExp: number;
    cleanSessionExp: number;
    bankedExp: number;
  };
  metrics: {
    totalQuestions: number;
    l1Questions: number;
    l2Questions: number;
    l3Questions: number;
    totalMinutes: number;
    streakDays: number;
    centurionDays: number;
    cleanSessions: number;
    bankedQuestionsCount: number;
  };
  unlockedBadges: BadgeDefinition[];
  lockedBadges: BadgeDefinition[];
}

/**
 * Cumulative Calculation of EXP and Academic Credit Score:
 * - Questions by Tier: L1 (+10 XP), L2 (+25 XP), L3 (+50 XP)
 * - Time Spent: +2 XP per focused minute
 * - Consistency & Streak: +100 XP per active streak day
 * - Centurion Blaze (100+ Qs in a day): +300 XP per fire parked
 * - Clean Session Bonus (No calculation slip): +40 XP per clean subject day
 * - Banked Questions: +40 XP per problem authored/banked
 *
 * Academic Credit Score (Scale: 300 to 900):
 * - Base: 300 points
 * - Practice Consistency & Streak: up to +180 points
 * - Rigor Ratio (L3 percentage): up to +150 points
 * - Volume Velocity: up to +150 points
 * - Error Discipline (Clean sessions ratio): up to +120 points
 */
export function calculateExpStats(
  records: Record<string, DayRecord>,
  bankedQuestions: QuestionBankItem[] = [],
  currentStreak = 0
): ExpStats {
  let l1Questions = 0;
  let l2Questions = 0;
  let l3Questions = 0;
  let totalMinutes = 0;
  let centurionDays = 0;
  let cleanSessions = 0;

  const dates = Object.keys(records);

  dates.forEach(dateKey => {
    const rec = records[dateKey];
    if (!rec) return;

    let dayQ = 0;
    (['phy', 'che', 'mat'] as SubjectKey[]).forEach(sub => {
      const subObj = rec[sub];
      if (subObj) {
        const l1 = subObj.l1 || 0;
        const l2 = subObj.l2 || 0;
        const l3 = subObj.l3 || 0;
        l1Questions += l1;
        l2Questions += l2;
        l3Questions += l3;
        dayQ += l1 + l2 + l3;
        totalMinutes += subObj.time || 0;

        // Clean session check (practiced questions without careless error)
        if ((l1 + l2 + l3) > 0 && !subObj.mistake) {
          cleanSessions++;
        }
      }
    });

    if (dayQ >= 100) {
      centurionDays++;
    }
  });

  const totalQuestions = l1Questions + l2Questions + l3Questions;
  const bankedQuestionsCount = bankedQuestions.length;

  // Calculate Breakdown EXP
  const l1Exp = l1Questions * 10;
  const l2Exp = l2Questions * 25;
  const l3Exp = l3Questions * 50;
  const timeExp = totalMinutes * 2;
  const streakExp = currentStreak * 100;
  const fireBlazeExp = centurionDays * 300;
  const cleanSessionExp = cleanSessions * 40;
  const bankedExp = bankedQuestionsCount * 40;

  const totalExp = l1Exp + l2Exp + l3Exp + timeExp + streakExp + fireBlazeExp + cleanSessionExp + bankedExp;

  // Determine Level
  let currentLevel = LEVELS[0];
  let nextLevel: LevelDefinition | null = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalExp >= LEVELS[i].minExp) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    }
  }

  let levelProgress = 100;
  let expToNextLevel = 0;

  if (nextLevel) {
    const levelRange = nextLevel.minExp - currentLevel.minExp;
    const expIntoLevel = totalExp - currentLevel.minExp;
    levelProgress = Math.min(100, Math.max(0, Math.round((expIntoLevel / levelRange) * 100)));
    expToNextLevel = Math.max(0, nextLevel.minExp - totalExp);
  }

  // Calculate Academic Credit Score (300 to 900)
  // Factors: Volume, Streak, Advanced Rigor, Clean Error Discipline
  let creditScore = 300;
  if (totalQuestions > 0 || totalMinutes > 0) {
    const streakPoints = Math.min(180, currentStreak * 25);
    const volumePoints = Math.min(150, Math.floor((totalQuestions / 400) * 150));
    const l3Ratio = totalQuestions > 0 ? (l3Questions / totalQuestions) : 0;
    const rigorPoints = Math.min(150, Math.floor(l3Ratio * 300));
    const disciplinePoints = Math.min(120, cleanSessions * 15);

    creditScore = Math.min(900, Math.max(300, 300 + streakPoints + volumePoints + rigorPoints + disciplinePoints));
  }

  // Credit Tier Description
  let creditTier = 'Initiate Phase';
  let creditRatingColor = '#94a3b8';

  if (creditScore >= 800) {
    creditTier = 'Prime AIR-1 Standing (Exceptional)';
    creditRatingColor = '#f59e0b';
  } else if (creditScore >= 720) {
    creditTier = 'Tier-1 IIT Caliber (Strong Credit)';
    creditRatingColor = '#10b981';
  } else if (creditScore >= 640) {
    creditTier = 'Consistent Aspirant (Solid Credit)';
    creditRatingColor = '#38bdf8';
  } else if (creditScore >= 500) {
    creditTier = 'Building Discipline (Moderate)';
    creditRatingColor = '#818cf8';
  }

  // Badges Calculation
  const metrics = {
    totalQuestions,
    l1Questions,
    l2Questions,
    l3Questions,
    totalMinutes,
    streakDays: currentStreak,
    centurionDays,
    creditScore,
    totalExp,
    cleanSessions,
    bankedQuestionsCount
  };

  const unlockedBadges: BadgeDefinition[] = [];
  const lockedBadges: BadgeDefinition[] = [];

  BADGES.forEach(b => {
    if (b.check(metrics)) {
      unlockedBadges.push(b);
    } else {
      lockedBadges.push(b);
    }
  });

  return {
    totalExp,
    currentLevel,
    nextLevel,
    levelProgress,
    expToNextLevel,
    creditScore,
    creditTier,
    creditRatingColor,
    breakdown: {
      l1Exp,
      l2Exp,
      l3Exp,
      timeExp,
      streakExp,
      fireBlazeExp,
      cleanSessionExp,
      bankedExp
    },
    metrics,
    unlockedBadges,
    lockedBadges
  };
}
