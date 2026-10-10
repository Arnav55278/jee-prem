import { QuestionBankItem, StudentActivityLog, StudentProfile, AnnouncementItem } from './types';

export const CH: Record<'phy' | 'che' | 'mat', string[]> = {
  phy: [
    'Physical World & Measurement',
    'Kinematics (1D Motion)',
    'Kinematics (2D & Projectile)',
    'Laws of Motion (Newtonian)',
    'Friction & Dynamics',
    'Work, Energy & Power',
    'Centre of Mass & Collisions',
    'Rotational Motion & Moment of Inertia',
    'Gravitation & Orbital Mechanics',
    'Properties of Solids (Elasticity)',
    'Fluid Mechanics (Bernoulli, Viscosity)',
    'Thermal Properties & Calorimetry',
    'Thermodynamics (Cycles & Entropy)',
    'Kinetic Theory of Gases',
    'Oscillations & Simple Harmonic Motion',
    'Waves & Sound (Doppler Effect)',
    'Electrostatics & Gauss Law',
    'Electric Potential & Capacitance',
    'Current Electricity (Kirchhoff & Potentiometer)',
    'Magnetic Force on Moving Charges',
    'Magnetic Field due to Current (Biot-Savart)',
    'Magnetism & Matter',
    'Electromagnetic Induction (Faraday & Lenz)',
    'Alternating Current & Resonance',
    'Electromagnetic Waves',
    'Ray Optics (Mirrors, Lenses & Prism)',
    'Wave Optics (YDSE & Diffraction)',
    'Dual Nature & Photoelectric Effect',
    'Atomic Structure & Bohr Model',
    'Nuclear Physics & Radioactivity',
    'Semiconductor Devices & Logic Gates',
    'Communication Systems'
  ],
  che: [
    'Some Basic Concepts (Mole Concept)',
    'Atomic Structure (Quantum Mechanical Model)',
    'Periodic Table & Periodic Properties',
    'Chemical Bonding & Molecular Structure (MOT, VSEPR)',
    'States of Matter (Gaseous & Liquid)',
    'Thermodynamics & Thermochemistry',
    'Chemical Equilibrium (Kp, Kc)',
    'Ionic Equilibrium (Buffer, Solubility, pH)',
    'Redox Reactions & Balancing',
    'Electrochemistry (Nernst Equation, Galvanic)',
    'Chemical Kinetics (Rate Laws & Arrhenius)',
    'Surface Chemistry (Adsorption & Colloids)',
    'Hydrogen & Hydrides',
    's-Block Elements (Alkali & Alkaline Earth)',
    'p-Block Elements (Group 13 & 14)',
    'p-Block Elements (Group 15, 16, 17 & 18)',
    'd & f Block Elements',
    'Coordination Compounds (CFT & Isomerism)',
    'General Principles of Metallurgy',
    'Practical Organic Chemistry (IUPAC, Isomerism)',
    'Hydrocarbons (Alkanes, Alkenes, Alkynes, Arenes)',
    'Haloalkanes & Haloarenes',
    'Alcohols, Phenols & Ethers',
    'Aldehydes, Ketones & Carboxylic Acids',
    'Amines & Diazonium Salts',
    'Biomolecules (Proteins, Carbohydrates, Nucleic Acids)',
    'Polymers & Synthetic Materials',
    'Chemistry in Everyday Life',
    'Environmental Chemistry',
    'Qualitative Inorganic Analysis (Salt Analysis)'
  ],
  mat: [
    'Sets, Relations & Functions',
    'Trigonometric Ratios & Identities',
    'Inverse Trigonometric Functions',
    'Complex Numbers & Quadratic Equations',
    'Permutations & Combinations',
    'Binomial Theorem & Approximations',
    'Sequences & Series (AP, GP, HP, AGP)',
    'Straight Lines & Family of Lines',
    'Circles & Radical Axis',
    'Parabola (Standard & Focal Chords)',
    'Ellipse (Eccentricity, Auxiliary Circle)',
    'Hyperbola & Asymptotes',
    'Vectors (Scalar & Vector Triple Product)',
    'Three Dimensional Geometry (Lines & Planes)',
    'Matrices & Matrix Algebra',
    'Determinants & System of Equations',
    'Limits, Continuity & Differentiability',
    'Application of Derivatives (Tangents, Maxima-Minima)',
    'Indefinite Integration (Standard Substitutions)',
    'Definite Integration & Properties',
    'Area Under Curves (Quadrature)',
    'Differential Equations (Order, Degree, Linear)',
    'Mathematical Reasoning & Boolean Logic',
    'Statistics (Mean, Variance, Std Deviation)',
    'Probability (Conditional, Bayes Theorem)',
    'Random Variables & Probability Distributions',
    'Linear Programming',
    'Mathematical Induction'
  ]
};

export const SUBJECT_CONFIG = {
  phy: {
    name: 'Physics',
    code: 'PHY',
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.25)',
    bg: 'rgba(56, 189, 248, 0.08)',
    border: 'rgba(56, 189, 248, 0.25)',
    icon: '⚡',
    desc: 'Mechanics · Electromagnetism · Modern Physics'
  },
  che: {
    name: 'Chemistry',
    code: 'CHE',
    accent: '#34d399',
    glow: 'rgba(52, 211, 153, 0.25)',
    bg: 'rgba(52, 211, 153, 0.08)',
    border: 'rgba(52, 211, 153, 0.25)',
    icon: '🧪',
    desc: 'Physical · Inorganic · Organic Chemistry'
  },
  mat: {
    name: 'Mathematics',
    code: 'MAT',
    accent: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.25)',
    bg: 'rgba(251, 191, 36, 0.08)',
    border: 'rgba(251, 191, 36, 0.25)',
    icon: '∑',
    desc: 'Calculus · Coordinate Geometry · Algebra & Vectors'
  }
};

// Clean personal question bank for Aditya Khari
export const INITIAL_QUESTIONS: QuestionBankItem[] = [];

// Single personal profile for the user
export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'stu-aditya',
    name: 'Aditya Khari',
    rollNo: 'JEE-2026-ASPIRANT',
    targetYear: '2026',
    targetRankGoal: 'AIR < 500 (IIT Bombay CSE)',
    totalQuestions: 0,
    streakDays: 0,
    accuracyRate: 100,
    activeNow: true,
    lastActive: 'Just now',
    preferredSubject: 'phy'
  }
];

// Activity log starts clean
export const INITIAL_ACTIVITY_LOGS: StudentActivityLog[] = [];

// Personal preparation targets
export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Mission IIT Bombay CSE',
    content: 'Target AIR < 500 in JEE Advanced 2026. Maintain consistency with 100+ questions daily to light up the Centurion Fire Calendar.',
    date: 'Oct 2026',
    tag: 'High Yield',
    author: 'Aditya Khari'
  }
];

// Clean empty database for Aditya's personal preparation
export function getSeedPracticeDatabase(): Record<string, any> {
  return {};
}
