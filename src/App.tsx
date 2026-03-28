import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Settings as SettingsIcon, 
  Download, 
  LayoutDashboard, 
  Zap, 
  PlusCircle, 
  FlaskConical, 
  BarChart3,
  HeartPulse,
  TrendingUp,
  Clock,
  ArrowDownCircle,
  History,
  Database,
  Package,
  Wallet,
  LineChart,
  BarChart2,
  RefreshCw,
  GitMerge,
  Calendar,
  X,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
  Info,
  Layers,
  Timer,
  Sparkles,
  ArrowDown,
  Settings2,
  User,
  Monitor,
  Bell,
  Trash2,
  Edit2,
  Upload,
  Search,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from './lib/utils';
// --- Types ---
export type Valence = 'positive' | 'negative' | 'neutral';
export type SubstanceCategory = 'stimulant' | 'depressant' | 'psychedelic' | 'opioid' | 'dissociative' | 'cannabinoid' | 'nootropic' | 'supplement';

export interface CustomEffect {
  name: string;
  icon: string;
  color: string;
  valence: Valence;
}

export interface SubstanceEffect {
  type: string;
  intensity: number;
  onset: number;
  duration: number;
  valence: Valence;
}

export interface Strain {
  name: string;
  price: number;
}

export interface Interaction {
  substanceId: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Substance {
  id: string;
  name: string;
  halfLife: number;
  tmax: number;
  bioavailability: number;
  color: string;
  icon: string;
  unit: string;
  price: number;
  step: number;
  category: SubstanceCategory;
  onset: number;
  offset: number;
  toxicity: number;
  toleranceRate: number;
  toleranceReset: number;
  metabolismCurve: 'standard' | 'alcohol' | 'exponential' | 'linear' | 'sigmoid';
  metabolismRate: number;
  absorptionRate: number;
  beta?: number;
  ka?: number;
  comedownEnabled: boolean;
  comedownDuration: number;
  comedownIntensity: number;
  comedownSymptoms: string[];
  strains: Strain[];
  effects: SubstanceEffect[];
  interactions: Interaction[];
  description: string;
  isFavorite?: boolean;
  interactionMessage?: string;
  isSevere?: boolean;
  // New fields
  proteinBinding?: number;
  volumeOfDistribution?: number;
  addictionPotential?: 'low' | 'medium' | 'high' | 'very high';
  legalityStatus?: string;
  toleranceHalfLife?: number;
  crossTolerance?: string[];
}

export interface Dose {
  id: string;
  substanceId: string;
  amount: number;
  timestamp: string;
  route: string;
  stomach?: 'empty' | 'light' | 'full' | 'heavy' | null;
  note?: string;
  strainId?: string | null;
  bioavailabilityMultiplier: number;
  tmaxMultiplier: number;
}

export interface ActiveDose extends Dose {
  name: string;
  color: string;
  currentLevel: number;
  remainingTime: number;
  intensity: number;
}

export interface ActiveEffect {
  id: string;
  name: string;
  intensity: number;
}

export interface Shortcut {
  id: string;
  name: string;
  substanceId: string;
  amount: number;
}

export interface QuickAction {
  id: string;
  name: string;
  substanceId: string;
  amount: number;
  route: string;
}

export interface UserSettings {
  userWeight: number;
  userAge: number;
  userMetabolism: 'slow' | 'normal' | 'fast';
  userGender: 'male' | 'female' | 'other';
  timeFormat24h: boolean;
  showSeconds: boolean;
  compactMode: boolean;
  language: string;
  chartWindow: number;
  weeklyBudget: number;
  chartAnimation: boolean;
  chartGrid: boolean;
  chartPoints: boolean;
  interactionWarnings: boolean;
  doseWarnings: boolean;
  reminders: boolean;
  comedownWarnings: boolean;
}

export interface Shortcut {
  id: string;
  name: string;
  substanceId: string;
  amount: number;
  color: string;
}

// --- Constants ---
export const DEFAULT_SUBSTANCES: Substance[] = [
  { 
    id: 'caffeine', 
    name: 'Kofein', 
    halfLife: 5, 
    tmax: 0.75, 
    bioavailability: 100, 
    color: '#8B4513', 
    icon: 'coffee', 
    unit: 'mg', 
    price: 2, 
    step: 50, 
    category: 'stimulant', 
    onset: 15, 
    offset: 4, 
    toxicity: 10, 
    toleranceRate: 15, 
    toleranceReset: 7, 
    metabolismCurve: 'standard', 
    metabolismRate: 1, 
    absorptionRate: 1, 
    beta: 0.14, 
    ka: 4, 
    comedownEnabled: false, 
    comedownDuration: 2, 
    comedownIntensity: 3, 
    comedownSymptoms: ['Únava', 'Bolest hlavy'], 
    strains: [], 
    effects: [
      { type: 'Stimulace', intensity: 7, onset: 0.25, duration: 4, valence: 'positive' }, 
      { type: 'Kognice', intensity: 6, onset: 0.5, duration: 3, valence: 'positive' }, 
      { type: 'Diuréza', intensity: 5, onset: 0.5, duration: 3, valence: 'neutral' }
    ], 
    interactions: [], 
    description: 'Nejrozšířenější stimulans na světě' 
  },
  { 
    id: 'nicotine', 
    name: 'Nikotin', 
    halfLife: 2, 
    tmax: 0.17, 
    bioavailability: 80, 
    color: '#556B2F', 
    icon: 'leaf', 
    unit: 'mg', 
    price: 8, 
    step: 0.5, 
    category: 'stimulant', 
    onset: 5, 
    offset: 1, 
    toxicity: 5, 
    toleranceRate: 25, 
    toleranceReset: 3, 
    metabolismCurve: 'standard', 
    metabolismRate: 1, 
    absorptionRate: 1, 
    beta: 0.35, 
    ka: 20, 
    comedownEnabled: true, 
    comedownDuration: 1, 
    comedownIntensity: 6, 
    comedownSymptoms: ['Chuť k jídlu', 'Podrážděnost', 'Touha'], 
    strains: [], 
    effects: [
      { type: 'Stimulace', intensity: 6, onset: 0.08, duration: 0.5, valence: 'positive' }, 
      { type: 'Relaxace', intensity: 4, onset: 0.17, duration: 0.5, valence: 'positive' }, 
      { type: 'Chuť k jídlu', intensity: -5, onset: 0.17, duration: 1, valence: 'negative' }
    ], 
    interactions: [], 
    description: 'Vysoce návykové stimulans' 
  },
  { 
    id: 'alcohol', 
    name: 'Etanol', 
    halfLife: 4, 
    tmax: 0.5, 
    bioavailability: 80, 
    color: '#FFD700', 
    icon: 'wine', 
    unit: 'g', 
    price: 15, 
    step: 10, 
    category: 'depressant', 
    onset: 10, 
    offset: 3, 
    toxicity: 5, 
    toleranceRate: 20, 
    toleranceReset: 5, 
    metabolismCurve: 'alcohol', 
    metabolismRate: 1, 
    absorptionRate: 1, 
    beta: 0.15, 
    ka: 6, 
    comedownEnabled: true, 
    comedownDuration: 12, 
    comedownIntensity: 7, 
    comedownSymptoms: ['Bolest hlavy', 'Nevolnost', 'Dehydratace', 'Úzkost'], 
    strains: [
      { name: 'Pivo', price: 12 }, 
      { name: 'Víno', price: 25 }, 
      { name: 'Tvrdý alkohol', price: 40 }
    ], 
    effects: [
      { type: 'Relaxace', intensity: 7, onset: 0.17, duration: 2, valence: 'positive' }, 
      { type: 'Sociabilita', intensity: 6, onset: 0.25, duration: 2, valence: 'positive' }, 
      { type: 'Koordinace', intensity: -6, onset: 0.5, duration: 3, valence: 'negative' }, 
      { type: 'Kognice', intensity: -5, onset: 0.5, duration: 3, valence: 'negative' }
    ], 
    interactions: [], 
    description: 'Centrální depresans' 
  },
  { 
    id: 'kratom', 
    name: 'Kratom', 
    halfLife: 6, 
    tmax: 1.5, 
    bioavailability: 60, 
    color: '#228B22', 
    icon: 'leaf', 
    unit: 'g', 
    price: 15, 
    step: 0.5, 
    category: 'opioid', 
    onset: 20, 
    offset: 4, 
    toxicity: 8, 
    toleranceRate: 18, 
    toleranceReset: 10, 
    metabolismCurve: 'standard', 
    metabolismRate: 1, 
    absorptionRate: 0.8, 
    beta: 0.12, 
    ka: 2, 
    comedownEnabled: true, 
    comedownDuration: 6, 
    comedownIntensity: 5, 
    comedownSymptoms: ['Únava', 'Podrážděnost', 'Bolest'], 
    strains: [
      { name: 'Red Bali', price: 18 }, 
      { name: 'Green Maeng Da', price: 20 }, 
      { name: 'White Borneo', price: 22 }, 
      { name: 'Gold Thai', price: 25 }
    ], 
    effects: [
      { type: 'Bolest', intensity: -7, onset: 0.5, duration: 4, valence: 'positive' }, 
      { type: 'Relaxace', intensity: 6, onset: 0.5, duration: 4, valence: 'positive' }, 
      { type: 'Euphorie', intensity: 5, onset: 0.75, duration: 3, valence: 'positive' }, 
      { type: 'Energie', intensity: 4, onset: 0.5, duration: 3, valence: 'positive' }
    ], 
    interactions: [], 
    description: 'Přírodní opioidní látka' 
  },
  { 
    id: 'melatonin', 
    name: 'Melatonin', 
    halfLife: 0.83, 
    tmax: 0.5, 
    bioavailability: 15, 
    color: '#4B0082', 
    icon: 'moon', 
    unit: 'mg', 
    price: 5, 
    step: 0.5, 
    category: 'supplement', 
    onset: 20, 
    offset: 6, 
    toxicity: 50, 
    toleranceRate: 5, 
    toleranceReset: 1, 
    metabolismCurve: 'standard', 
    metabolismRate: 1, 
    absorptionRate: 1, 
    beta: 0.83, 
    ka: 4, 
    comedownEnabled: false, 
    comedownDuration: 0, 
    comedownIntensity: 0, 
    comedownSymptoms: [], 
    strains: [], 
    effects: [
      { type: 'Spánek', intensity: 7, onset: 0.33, duration: 6, valence: 'positive' }, 
      { type: 'Relaxace', intensity: 6, onset: 0.33, duration: 4, valence: 'positive' }
    ], 
    interactions: [], 
    description: 'Hormon spánku' 
  },
  { 
    id: 'modafinil', 
    name: 'Modafinil', 
    halfLife: 12, 
    tmax: 2, 
    bioavailability: 80, 
    color: '#00CED1', 
    icon: 'zap', 
    unit: 'mg', 
    price: 50, 
    step: 50, 
    category: 'nootropic', 
    onset: 45, 
    offset: 12, 
    toxicity: 8, 
    toleranceRate: 10, 
    toleranceReset: 7, 
    metabolismCurve: 'standard', 
    metabolismRate: 1, 
    absorptionRate: 1, 
    beta: 0.06, 
    ka: 1.5, 
    comedownEnabled: true, 
    comedownDuration: 4, 
    comedownIntensity: 4, 
    comedownSymptoms: ['Únava', 'Bolest hlavy'], 
    strains: [], 
    effects: [
      { type: 'Kognice', intensity: 8, onset: 0.75, duration: 10, valence: 'positive' }, 
      { type: 'BDĚLOST', intensity: 9, onset: 0.75, duration: 12, valence: 'positive' }, 
      { type: 'Motivace', intensity: 7, onset: 1, duration: 8, valence: 'positive' }
    ], 
    interactions: [], 
    description: 'Eugeroikum - podporuje bdělost' 
  },
  { 
    id: 'cbd', 
    name: 'CBD', 
    halfLife: 3, 
    tmax: 2, 
    bioavailability: 20, 
    color: '#228B22', 
    icon: 'cannabis', 
    unit: 'mg', 
    price: 20, 
    step: 10, 
    category: 'cannabinoid', 
    onset: 30, 
    offset: 4, 
    toxicity: 100, 
    toleranceRate: 5, 
    toleranceReset: 3, 
    metabolismCurve: 'standard', 
    metabolismRate: 1, 
    absorptionRate: 1, 
    beta: 0.23, 
    ka: 2, 
    comedownEnabled: false, 
    comedownDuration: 0, 
    comedownIntensity: 0, 
    comedownSymptoms: [], 
    strains: [
      { name: 'Full Spectrum', price: 25 }, 
      { name: 'Isolate', price: 18 }, 
      { name: 'Broad Spectrum', price: 22 }
    ], 
    effects: [
      { type: 'Relaxace', intensity: 6, onset: 0.5, duration: 3, valence: 'positive' }, 
      { type: 'Úzkost', intensity: -5, onset: 0.5, duration: 4, valence: 'positive' }, 
      { type: 'Bolest', intensity: -5, onset: 1, duration: 4, valence: 'positive' }
    ], 
    interactions: [], 
    description: 'Nepsychoaktivní kanabinoid' 
  },
  { 
    id: 'thc', 
    name: 'THC', 
    halfLife: 6, 
    tmax: 0.5, 
    bioavailability: 25, 
    color: '#2E8B57', 
    icon: 'cannabis', 
    unit: 'mg', 
    price: 80, 
    step: 5, 
    category: 'cannabinoid', 
    onset: 5, 
    offset: 3, 
    toxicity: 20, 
    toleranceRate: 30, 
    toleranceReset: 21, 
    metabolismCurve: 'standard', 
    metabolismRate: 1, 
    absorptionRate: 1.5, 
    beta: 0.12, 
    ka: 8, 
    comedownEnabled: true, 
    comedownDuration: 4, 
    comedownIntensity: 3, 
    comedownSymptoms: ['Únava', 'Hlad', 'Sucho v ústech'], 
    strains: [
      { name: 'Indica', price: 90 }, 
      { name: 'Sativa', price: 85 }, 
      { name: 'Hybrid', price: 80 }
    ], 
    effects: [
      { type: 'Euphorie', intensity: 7, onset: 0.1, duration: 2, valence: 'positive' }, 
      { type: 'Relaxace', intensity: 6, onset: 0.25, duration: 3, valence: 'positive' }, 
      { type: 'Kreativita', intensity: 6, onset: 0.5, duration: 2, valence: 'positive' }, 
      { type: 'Chuť k jídlu', intensity: 8, onset: 0.5, duration: 2, valence: 'neutral' }
    ], 
    interactions: [], 
    description: 'Hlavní psychoaktivní kanabinoid' 
  }
];

export const DEFAULT_SETTINGS: UserSettings = { 
  userWeight: 70, 
  userAge: 25, 
  userMetabolism: 'normal', 
  userGender: 'male', 
  timeFormat24h: true, 
  showSeconds: false, 
  compactMode: false, 
  language: 'cs', 
  chartWindow: 24, 
  weeklyBudget: 1000,
  chartAnimation: true, 
  chartGrid: true, 
  chartPoints: false, 
  interactionWarnings: true, 
  doseWarnings: true, 
  reminders: false, 
  comedownWarnings: true 
};

export const DEFAULT_EFFECTS: CustomEffect[] = [
  { name: 'Stimulace', icon: 'zap', color: '#f59e0b', valence: 'positive' }, 
  { name: 'Relaxace', icon: 'cloud', color: '#3b82f6', valence: 'positive' },
  { name: 'Kognice', icon: 'brain', color: '#8b5cf6', valence: 'positive' }, 
  { name: 'Spánek', icon: 'moon', color: '#6366f1', valence: 'positive' },
  { name: 'BDĚLOST', icon: 'eye', color: '#ef4444', valence: 'positive' }, 
  { name: 'Motivace', icon: 'target', color: '#10b981', valence: 'positive' },
  { name: 'Sociabilita', icon: 'users', color: '#f97316', valence: 'positive' }, 
  { name: 'Bolest', icon: 'activity', color: '#ef4444', valence: 'negative' },
  { name: 'Úzkost', icon: 'alert-circle', color: '#8b5cf6', valence: 'negative' }, 
  { name: 'Chuť k jídlu', icon: 'utensils', color: '#22c55e', valence: 'neutral' },
  { name: 'Koordinace', icon: 'move', color: '#06b6d4', valence: 'neutral' }, 
  { name: 'Diuréza', icon: 'droplet', color: '#0ea5e9', valence: 'neutral' },
  { name: 'Euphorie', icon: 'smile', color: '#ec4899', valence: 'positive' }, 
  { name: 'Sedace', icon: 'bed', color: '#64748b', valence: 'neutral' },
  { name: 'Paměť', icon: 'bookmark', color: '#a855f7', valence: 'positive' }, 
  { name: 'Kreativita', icon: 'palette', color: '#f43f5e', valence: 'positive' },
  { name: 'Fokus', icon: 'crosshair', color: '#14b8a6', valence: 'positive' }, 
  { name: 'Energie', icon: 'battery-charging', color: '#eab308', valence: 'positive' },
  { name: 'Nausea', icon: 'frown', color: '#84cc16', valence: 'negative' }, 
  { name: 'Paranoia', icon: 'shield-alert', color: '#dc2626', valence: 'negative' }
];

export const ROUTE_MULTIPLIERS: Record<string, { bioavailability: number, speed: number, tmaxMultiplier: number }> = { 
  oral: { bioavailability: 1.0, speed: 1.0, tmaxMultiplier: 1.0 }, 
  sublingual: { bioavailability: 1.2, speed: 1.5, tmaxMultiplier: 0.5 }, 
  insufflated: { bioavailability: 1.3, speed: 2.0, tmaxMultiplier: 0.3 }, 
  inhaled: { bioavailability: 1.5, speed: 3.0, tmaxMultiplier: 0.15 }, 
  intravenous: { bioavailability: 2.0, speed: 5.0, tmaxMultiplier: 0.05 }, 
  intramuscular: { bioavailability: 1.8, speed: 2.5, tmaxMultiplier: 0.3 }, 
  subcutaneous: { bioavailability: 1.6, speed: 1.8, tmaxMultiplier: 0.5 }, 
  rectal: { bioavailability: 1.4, speed: 1.3, tmaxMultiplier: 0.6 }, 
  topical: { bioavailability: 0.3, speed: 0.5, tmaxMultiplier: 3.0 } 
};

export const STOMACH_MULTIPLIERS: Record<string, { bioavailability: number, speed: number }> = { 
  empty: { bioavailability: 1.2, speed: 1.5 }, 
  light: { bioavailability: 1.0, speed: 1.0 }, 
  full: { bioavailability: 0.9, speed: 0.8 }, 
  heavy: { bioavailability: 0.7, speed: 0.5 } 
};

// --- Pharmacology Services ---
export function getMetabolismMultiplier(settings: UserSettings): number {
  const metabolism = settings.userMetabolism || 'normal';
  switch (metabolism) {
    case 'slow': return 0.8;
    case 'fast': return 1.2;
    default: return 1;
  }
}

export function getTypicalDose(substanceId: string): number {
  const typicalDoses: Record<string, number> = {
    'caffeine': 100,
    'nicotine': 1,
    'alcohol': 10,
    'melatonin': 3,
    'modafinil': 100,
    'cbd': 25,
    'thc': 10,
    'kratom': 3
  };
  return typicalDoses[substanceId] || 50;
}

export function calculateTolerance(substanceId: string, substances: Substance[], doses: Dose[]): number {
  const substance = substances.find(s => s.id === substanceId);
  if (!substance) return 0;

  const sevenDaysAgo = Date.now() - (7 * 24 * 3600000);
  const recentDoses = doses.filter(d => 
    d.substanceId === substanceId && 
    new Date(d.timestamp).getTime() > sevenDaysAgo
  );

  if (recentDoses.length === 0) return 0;

  const daysWithUse = new Set(recentDoses.map(d => new Date(d.timestamp).toDateString())).size;
  const totalAmount = recentDoses.reduce((sum, d) => sum + d.amount, 0);
  
  const typicalDose = getTypicalDose(substanceId);
  
  const averageDailyAmount = totalAmount / 7;
  const frequencyFactor = (daysWithUse / 7) * 50;
  const amountFactor = Math.min((averageDailyAmount / typicalDose) * 30, 50);

  return Math.min(frequencyFactor + amountFactor, 95);
}

export function calculateDoseLevel(
  substance: Substance, 
  dose: Dose, 
  hoursSinceDose: number, 
  settings: UserSettings,
  substances: Substance[],
  doses: Dose[]
): number {
  if (hoursSinceDose < 0) return 0;

  const amount = dose.amount;
  const bioavailability = (substance.bioavailability / 100) * (dose.bioavailabilityMultiplier || 1);
  const effectiveDose = amount * bioavailability;

  const tolerance = calculateTolerance(substance.id, substances, doses);
  const toleranceFactor = 1 - (tolerance / 100);

  const metabolismMult = getMetabolismMultiplier(settings);
  const tmax = (substance.tmax * (dose.tmaxMultiplier || 1)) / metabolismMult;
  const halfLife = substance.halfLife / metabolismMult;

  const curveType = substance.metabolismCurve || 'standard';
  let level = 0;

  switch (curveType) {
    case 'alcohol': {
      const absorptionTime = tmax * 0.5;
      if (hoursSinceDose < absorptionTime) {
        level = (hoursSinceDose / absorptionTime) * 0.9;
      } else {
        const eliminationTime = hoursSinceDose - absorptionTime;
        const beta = (substance.beta || 0.15) * (substance.metabolismRate || 1);
        level = Math.max(0, 0.9 - (beta * eliminationTime));
      }
      break;
    }
    case 'exponential': {
      if (hoursSinceDose < tmax * 0.1) {
        level = (hoursSinceDose / (tmax * 0.1)) * 0.1;
      } else if (hoursSinceDose < tmax) {
        const ka = (substance.ka || 1) * (substance.absorptionRate || 1);
        level = 1 - Math.exp(-ka * hoursSinceDose);
      } else {
        const eliminationTime = hoursSinceDose - tmax;
        const beta = (substance.beta || 0.1) * (substance.metabolismRate || 1);
        level = Math.exp(-beta * eliminationTime);
      }
      break;
    }
    case 'linear': {
      if (hoursSinceDose < tmax) {
        level = hoursSinceDose / tmax;
      } else {
        const eliminationTime = hoursSinceDose - tmax;
        const totalEliminationTime = halfLife * 3;
        level = Math.max(0, 1 - (eliminationTime / totalEliminationTime));
      }
      break;
    }
    case 'sigmoid': {
      if (hoursSinceDose < tmax) {
        const progress = hoursSinceDose / tmax;
        level = 1 / (1 + Math.exp(-10 * (progress - 0.5)));
      } else {
        const eliminationTime = hoursSinceDose - tmax;
        const eliminationFactor = Math.pow(0.5, eliminationTime / halfLife);
        level = eliminationFactor;
      }
      break;
    }
    default: {
      if (hoursSinceDose < tmax * 0.1) {
        level = (hoursSinceDose / (tmax * 0.1)) * 0.1;
      } else if (hoursSinceDose < tmax) {
        const absorptionProgress = (hoursSinceDose - tmax * 0.1) / (tmax * 0.9);
        level = 0.1 + (absorptionProgress * 0.9);
      } else {
        const eliminationTime = hoursSinceDose - tmax;
        const eliminationFactor = Math.pow(0.5, eliminationTime / halfLife);
        level = eliminationFactor;
      }
    }
  }

  const typicalDose = getTypicalDose(substance.id);
  const normalizedLevel = (level * effectiveDose / typicalDose) * 100 * toleranceFactor;

  return Math.min(normalizedLevel, 100);
}

export function calculateSubstanceLevelAtTime(
  substanceId: string, 
  timestamp: number, 
  substances: Substance[], 
  doses: Dose[], 
  settings: UserSettings
): number {
  const substance = substances.find(s => s.id === substanceId);
  if (!substance) return 0;

  const relevantDoses = doses.filter(d => d.substanceId === substanceId);
  let totalLevel = 0;

  relevantDoses.forEach(dose => {
    const doseTime = new Date(dose.timestamp).getTime();
    const hoursSinceDose = (timestamp - doseTime) / 3600000;
    if (hoursSinceDose < 0) return;

    const level = calculateDoseLevel(substance, dose, hoursSinceDose, settings, substances, doses);
    totalLevel += level;
  });

  return Math.min(totalLevel, 100);
}

export function calculateCleanTime(substances: Substance[], doses: Dose[], settings: UserSettings): number {
  const now = Date.now();
  let maxCleanTime = 0;
  const metabolismMult = getMetabolismMultiplier(settings);

  doses.forEach(dose => {
    const substance = substances.find(s => s.id === dose.substanceId);
    if (!substance) return;

    const doseTime = new Date(dose.timestamp).getTime();
    const eliminationTime = substance.halfLife * 5 / metabolismMult;
    const cleanTime = doseTime + (eliminationTime * 3600000);

    if (cleanTime > now && (cleanTime - now) > maxCleanTime) {
      maxCleanTime = cleanTime - now;
    }
  });

  return maxCleanTime;
}

export function calculateEffectIntensityAtTime(
  effectType: string,
  timestamp: number,
  substances: Substance[],
  doses: Dose[],
  settings: UserSettings
): number {
  let totalIntensity = 0;
  
  substances.forEach(substance => {
    const effect = substance.effects?.find(e => e.type === effectType);
    if (!effect) return;
    
    const level = calculateSubstanceLevelAtTime(substance.id, timestamp, substances, doses, settings);
    if (level <= 0) return;
    
    const contribution = (level * Math.abs(effect.intensity)) / 10;
    totalIntensity += contribution;
  });
  
  return Math.min(totalIntensity, 100);
}

export function calculateSystemLoad(activeDoses: ActiveDose[], substances: Substance[]): number {
  const totalLoad = activeDoses.reduce((sum, dose) => sum + dose.currentLevel, 0);
  return Math.min(totalLoad, 100);
}

export function calculateActiveEffects(activeDoses: ActiveDose[], substances: Substance[]): { id: string; name: string; intensity: number }[] {
  const effectMap: { [key: string]: number } = {};
  
  activeDoses.forEach(dose => {
    const substance = substances.find(s => s.id === dose.substanceId);
    if (!substance || !substance.effects) return;
    
    substance.effects.forEach(effect => {
      const contribution = (dose.currentLevel * Math.abs(effect.intensity)) / 10;
      effectMap[effect.type] = (effectMap[effect.type] || 0) + contribution;
    });
  });
  
  return Object.entries(effectMap).map(([type, intensity]) => ({
    id: type,
    name: type.charAt(0).toUpperCase() + type.slice(1),
    intensity: Math.min(intensity, 100)
  })).filter(e => e.intensity > 0);
}

// --- Components ---

function QuickActions({ substances, onLogDose, shortcuts, onAddShortcut, onRemoveShortcut }: {
  substances: Substance[];
  onLogDose: (dose: Dose) => void;
  shortcuts: Shortcut[];
  onAddShortcut: (shortcut: Shortcut) => void;
  onRemoveShortcut: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newShortcut, setNewShortcut] = useState({
    name: '',
    substanceId: substances[0]?.id || '',
    amount: 0
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Zap size={12} className="text-cyan-primary" /> Zkratky
        </h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-1.5 rounded-lg bg-cyan-primary/10 text-cyan-primary hover:bg-cyan-primary/20 transition-all border border-cyan-primary/20"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {shortcuts.map(shortcut => {
          const substance = substances.find(s => s.id === shortcut.substanceId);
          if (!substance) return null;

          return (
            <div key={shortcut.id} className="relative group">
              <button
                onClick={() => {
                  const routeMult = ROUTE_MULTIPLIERS.oral;
                  const stomachMult = STOMACH_MULTIPLIERS.full;
                  onLogDose({
                    id: Math.random().toString(36).substr(2, 9),
                    substanceId: shortcut.substanceId,
                    amount: shortcut.amount,
                    timestamp: new Date().toISOString(),
                    route: 'oral',
                    stomach: 'full',
                    note: `Zkratka: ${shortcut.name}`,
                    bioavailabilityMultiplier: routeMult.bioavailability * stomachMult.bioavailability,
                    tmaxMultiplier: routeMult.tmaxMultiplier / stomachMult.speed
                  });
                }}
                className="w-full bg-card-bg/60 backdrop-blur-xl border border-border-muted rounded-2xl p-4 flex items-center gap-3 transition-all text-left hover:border-slate-700"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-border-muted">
                  <Activity size={14} style={{ color: substance.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-slate-200 truncate">{shortcut.name}</div>
                  <div className="text-[8px] text-slate-500 font-medium uppercase tracking-wider">
                    {shortcut.amount}{substance.unit}
                  </div>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveShortcut(shortcut.id);
                }}
                className="absolute -top-1 -right-1 p-1 rounded-full bg-slate-900 border border-border-muted text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsAdding(false)} />
          <div className="relative w-full max-w-sm bg-card-bg border border-border-muted rounded-[32px] p-6 space-y-6 shadow-2xl">
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">Nová zkratka</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Název</label>
                <input
                  type="text"
                  placeholder="Např. Ranní káva"
                  value={newShortcut.name}
                  onChange={e => setNewShortcut({ ...newShortcut, name: e.target.value })}
                  className="w-full bg-slate-900 border border-border-muted rounded-2xl px-4 py-3 text-sm font-bold text-slate-200 focus:outline-none focus:border-cyan-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Látka</label>
                <select
                  value={newShortcut.substanceId}
                  onChange={e => setNewShortcut({ ...newShortcut, substanceId: e.target.value })}
                  className="w-full bg-slate-900 border border-border-muted rounded-2xl px-4 py-3 text-sm font-bold text-slate-200 focus:outline-none focus:border-cyan-primary appearance-none"
                >
                  {substances.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Množství</label>
                <input
                  type="number"
                  placeholder="Množství"
                  value={newShortcut.amount || ''}
                  onChange={e => setNewShortcut({ ...newShortcut, amount: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-border-muted rounded-2xl px-4 py-3 text-sm font-bold text-slate-200 focus:outline-none focus:border-cyan-primary"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-slate-900 text-slate-400 font-bold py-4 rounded-2xl uppercase tracking-widest text-[10px] border border-border-muted"
              >
                Zrušit
              </button>
              <button
                onClick={() => {
                  if (newShortcut.name && newShortcut.substanceId && newShortcut.amount > 0) {
                    onAddShortcut({
                      id: Math.random().toString(36).substr(2, 9),
                      ...newShortcut
                    });
                    setIsAdding(false);
                    setNewShortcut({ name: '', substanceId: substances[0]?.id || '', amount: 0 });
                  }
                }}
                className="flex-2 bg-cyan-primary text-slate-950 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px]"
              >
                Vytvořit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Dashboard({ activeDoses, substances, settings, currentTime, shortcuts, onUseShortcut, onAddShortcut, onRemoveShortcut, onLogDose }: {
  activeDoses: ActiveDose[];
  substances: Substance[];
  settings: UserSettings;
  currentTime: Date;
  shortcuts: Shortcut[];
  onUseShortcut: (shortcut: Shortcut) => void;
  onAddShortcut: (shortcut: Shortcut) => void;
  onRemoveShortcut: (id: string) => void;
  onLogDose: (dose: Dose) => void;
}) {
  const systemLoad = useMemo(() => calculateSystemLoad(activeDoses, substances), [activeDoses, substances]);
  const activeEffects = useMemo(() => calculateActiveEffects(activeDoses, substances), [activeDoses, substances]);

  return (
    <div className="space-y-8">
      {/* System Load Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-primary/20 to-purple-500/20 rounded-[40px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative bg-card-bg/40 backdrop-blur-2xl border border-white/5 rounded-[40px] p-8 overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-2 border-slate-800 flex items-center justify-center">
                <div className="text-4xl font-black text-white tracking-tighter">
                  {Math.round(systemLoad)}<span className="text-sm text-slate-500 ml-0.5">%</span>
                </div>
              </div>
              <svg className="absolute top-0 left-0 w-32 h-32 -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="62"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={390}
                  strokeDashoffset={390 - (390 * systemLoad) / 100}
                  className="text-cyan-primary transition-all duration-1000 ease-out"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-[10px] font-black text-cyan-primary uppercase tracking-[0.3em]">Aktuální zátěž systému</h2>
              <p className="text-xs text-slate-400 font-medium">
                {systemLoad < 20 ? 'Váš systém je v klidu' : systemLoad < 60 ? 'Mírná metabolická aktivita' : 'Vysoká zátěž organismu'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Substances */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Activity size={12} className="text-cyan-primary" /> Aktivní látky
          </h3>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{activeDoses.length} celkem</span>
        </div>
        
        {activeDoses.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/30 rounded-[32px] border border-border-muted border-dashed">
            <span className="text-xs text-slate-600 font-medium uppercase tracking-widest">Žádné aktivní látky</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {activeDoses.map(dose => (
              <div key={dose.id} className="bg-card-bg/60 backdrop-blur-xl border border-border-muted rounded-3xl p-5 flex items-center justify-between group hover:border-slate-700 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-border-muted relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundColor: dose.color }} />
                    <Activity size={20} style={{ color: dose.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-200">{dose.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold border border-slate-700 uppercase tracking-tighter">
                        {Math.round(dose.currentLevel)}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                      Zbývá cca {Math.round(dose.remainingTime)}h • {dose.intensity.toFixed(1)}% intenzita
                    </div>
                  </div>
                </div>
                <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full transition-all duration-1000" 
                    style={{ width: `${dose.currentLevel}%`, backgroundColor: dose.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Effects Graph */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
          <Zap size={12} className="text-cyan-primary" /> Intenzita účinků
        </h3>
        <div className="bg-card-bg/40 backdrop-blur-xl border border-border-muted rounded-[40px] p-6 space-y-6">
          {activeEffects.length === 0 ? (
            <div className="py-12 text-center">
              <span className="text-xs text-slate-600 font-medium uppercase tracking-widest">Žádné aktivní účinky</span>
            </div>
          ) : (
            <div className="space-y-5">
              {activeEffects.map(effect => (
                <div key={effect.id} className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{effect.name}</span>
                    <span className="text-[10px] font-black text-cyan-primary">{Math.round(effect.intensity)}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${effect.intensity}%` }}
                      className="h-full bg-gradient-to-r from-cyan-primary to-blue-500 rounded-full shadow-[0_0_10px_rgba(0,209,255,0.3)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <QuickActions 
        substances={substances}
        shortcuts={shortcuts}
        onLogDose={onLogDose}
        onAddShortcut={onAddShortcut}
        onRemoveShortcut={onRemoveShortcut}
      />
    </div>
  );
}

function Logger({ substances, doses, onAddDose, onDeleteDose, onClearAll }: {
  substances: Substance[];
  doses: Dose[];
  onAddDose: (dose: Dose) => void;
  onDeleteDose: (id: string) => void;
  onClearAll: () => void;
}) {
  const [selectedSubstanceId, setSelectedSubstanceId] = useState(substances[0]?.id || '');
  const [amount, setAmount] = useState<number>(0);
  const [route, setRoute] = useState<string>('oral');
  const [stomach, setStomach] = useState<string>('full');
  const [note, setNote] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));

  const selectedSubstance = substances.find(s => s.id === selectedSubstanceId);

  const handleLog = () => {
    if (!selectedSubstance) return;
    
    const routeMult = ROUTE_MULTIPLIERS[route as keyof typeof ROUTE_MULTIPLIERS] || ROUTE_MULTIPLIERS.oral;
    const stomachMult = STOMACH_MULTIPLIERS[stomach as keyof typeof STOMACH_MULTIPLIERS] || STOMACH_MULTIPLIERS.full;

    const newDose: Dose = {
      id: Math.random().toString(36).substr(2, 9),
      substanceId: selectedSubstanceId,
      amount,
      timestamp: new Date(timestamp).toISOString(),
      route,
      stomach,
      note,
      bioavailabilityMultiplier: routeMult.bioavailability * stomachMult.bioavailability,
      tmaxMultiplier: routeMult.tmaxMultiplier / stomachMult.speed
    };

    onAddDose(newDose);
    setAmount(0);
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-card-bg/40 backdrop-blur-xl border border-border-muted rounded-[40px] p-8 space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Látka</label>
            <select
              value={selectedSubstanceId}
              onChange={(e) => setSelectedSubstanceId(e.target.value)}
              className="w-full bg-slate-900/50 border border-border-muted rounded-2xl px-5 py-4 text-sm font-bold text-slate-200 focus:outline-none focus:border-cyan-primary transition-all appearance-none"
            >
              {substances.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Množství ({selectedSubstance?.unit})</label>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setAmount(Math.max(0, amount - (selectedSubstance?.step || 1)))}
                className="w-14 h-14 rounded-2xl bg-slate-900 border border-border-muted flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all"
              >
                <Minus size={20} />
              </button>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="flex-1 bg-slate-900/50 border border-border-muted rounded-2xl px-5 py-4 text-center text-xl font-black text-white focus:outline-none focus:border-cyan-primary transition-all"
              />
              <button 
                onClick={() => setAmount(amount + (selectedSubstance?.step || 1))}
                className="w-14 h-14 rounded-2xl bg-slate-900 border border-border-muted flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Způsob</label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full bg-slate-900/50 border border-border-muted rounded-2xl px-5 py-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-primary transition-all appearance-none"
              >
                {Object.keys(ROUTE_MULTIPLIERS).map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Žaludek</label>
              <select
                value={stomach}
                onChange={(e) => setStomach(e.target.value)}
                className="w-full bg-slate-900/50 border border-border-muted rounded-2xl px-5 py-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-primary transition-all appearance-none"
              >
                {Object.keys(STOMACH_MULTIPLIERS).map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Čas</label>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full bg-slate-900/50 border border-border-muted rounded-2xl px-5 py-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Poznámka</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Jak se cítíte? (volitelné)"
              className="w-full bg-slate-900/50 border border-border-muted rounded-2xl px-5 py-4 text-sm font-medium text-slate-200 focus:outline-none focus:border-cyan-primary transition-all min-h-[100px] resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleLog}
          disabled={amount <= 0}
          className="w-full bg-cyan-primary disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black py-5 rounded-3xl uppercase tracking-[0.2em] text-xs shadow-[0_0_30px_rgba(0,209,255,0.3)] active:scale-95 transition-all"
        >
          Zaznamenat dávku
        </button>
      </div>
    </div>
  );
}

function DoseHistory({ doses, substances, onDeleteDose, onClearAll }: {
  doses: Dose[];
  substances: Substance[];
  onDeleteDose: (id: string) => void;
  onClearAll: () => void;
}) {
  const sortedDoses = [...doses].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const groupedDoses = sortedDoses.reduce((groups: { [key: string]: Dose[] }, dose) => {
    const date = new Date(dose.timestamp).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(dose);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <History size={12} className="text-cyan-primary" /> Historie záznamů
        </h2>
        <button 
          onClick={onClearAll}
          className="text-[10px] font-bold text-red-500/70 hover:text-red-500 uppercase tracking-widest transition-colors"
        >
          Smazat vše
        </button>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedDoses).map(([date, dayDoses]) => (
          <div key={date} className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-2">{date}</h3>
            <div className="space-y-2">
              {dayDoses.map(dose => {
                const substance = substances.find(s => s.id === dose.substanceId);
                if (!substance) return null;
                return (
                  <div key={dose.id} className="bg-card-bg/60 backdrop-blur-xl border border-border-muted rounded-2xl p-4 flex items-center justify-between group hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-border-muted">
                        <Activity size={18} style={{ color: substance.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">{substance.name}</span>
                          <span className="text-[10px] font-black text-cyan-primary">{dose.amount}{substance.unit}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                          {new Date(dose.timestamp).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })} • {dose.route}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteDose(dose.id)}
                      className="p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {doses.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-border-muted flex items-center justify-center mx-auto mb-4">
              <History size={24} className="text-slate-700" />
            </div>
            <p className="text-xs text-slate-600 font-medium uppercase tracking-widest">Žádná historie k zobrazení</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Analytics({ substances, doses, settings }: {
  substances: Substance[];
  doses: Dose[];
  settings: UserSettings;
}) {
  const stats = useMemo(() => {
    const now = Date.now();
    const last7Days = now - (7 * 24 * 60 * 60 * 1000);
    const recentDoses = doses.filter(d => new Date(d.timestamp).getTime() > last7Days);
    
    const usageBySubstance = recentDoses.reduce((acc: { [key: string]: number }, dose) => {
      acc[dose.substanceId] = (acc[dose.substanceId] || 0) + dose.amount;
      return acc;
    }, {});

    const chartData = Object.entries(usageBySubstance).map(([id, amount]) => {
      const substance = substances.find(s => s.id === id);
      return {
        name: substance?.name || 'Neznámá',
        value: amount,
        color: substance?.color || '#64748b'
      };
    });

    return { chartData, recentCount: recentDoses.length };
  }, [doses, substances]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card-bg/40 backdrop-blur-xl border border-border-muted rounded-3xl p-6 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Záznamy (7d)</div>
          <div className="text-3xl font-black text-white">{stats.recentCount}</div>
        </div>
        <div className="bg-card-bg/40 backdrop-blur-xl border border-border-muted rounded-3xl p-6 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aktivní látky</div>
          <div className="text-3xl font-black text-cyan-primary">{substances.length}</div>
        </div>
      </div>

      <div className="bg-card-bg/40 backdrop-blur-xl border border-border-muted rounded-[40px] p-8 space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Distribuce užívání</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                itemStyle={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {stats.chartData.map(item => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] font-bold text-slate-400 truncate">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Substances({ substances, onEditSubstance, onDeleteSubstance, onAddPreset, onToggleFavorite }: {
  substances: Substance[];
  onEditSubstance: (id: string | null | 'new', template?: Substance) => void;
  onDeleteSubstance: (id: string) => void;
  onAddPreset: (preset: Substance) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  
  const filtered = substances.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <FlaskConical size={12} className="text-cyan-primary" /> Knihovna látek
        </h2>
        <button 
          onClick={() => onEditSubstance('new')}
          className="p-2 rounded-xl bg-cyan-primary/10 text-cyan-primary hover:bg-cyan-primary/20 transition-all border border-cyan-primary/20"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Hledat látku nebo kategorii..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900/50 border border-border-muted rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-slate-200 focus:outline-none focus:border-cyan-primary transition-all"
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map(substance => (
          <div key={substance.id} className="bg-card-bg/60 backdrop-blur-xl border border-border-muted rounded-3xl p-5 flex items-center justify-between group hover:border-slate-700 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-border-muted relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundColor: substance.color }} />
                <Activity size={20} style={{ color: substance.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-200">{substance.name}</h4>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 font-bold border border-slate-700 uppercase tracking-tighter">
                    {substance.category}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                  T1/2: {substance.halfLife}h • {substance.unit}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => onEditSubstance(substance.id)}
                className="p-2 text-slate-500 hover:text-cyan-primary transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => onDeleteSubstance(substance.id)}
                className="p-2 text-slate-500 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubstanceEditor({ isOpen, substanceId, template, substances, customEffects, onClose, onSave }: {
  isOpen: boolean;
  substanceId: string | null;
  template: Substance | null;
  substances: Substance[];
  customEffects: CustomEffect[];
  onClose: () => void;
  onSave: (substance: Substance) => void;
}) {
  const [formData, setFormData] = useState<Partial<Substance>>({
    name: '',
    category: 'Stimulant',
    unit: 'mg',
    halfLife: 0,
    duration: 0,
    color: '#00d1ff',
    effects: []
  });

  useEffect(() => {
    if (substanceId) {
      const existing = substances.find(s => s.id === substanceId);
      if (existing) setFormData(existing);
    } else if (template) {
      setFormData({ ...template, id: Math.random().toString(36).substr(2, 9) });
    } else {
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        category: 'Stimulant',
        unit: 'mg',
        halfLife: 0,
        duration: 0,
        color: '#00d1ff',
        effects: []
      });
    }
  }, [substanceId, template, substances, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card-bg border border-border-muted rounded-[40px] p-8 space-y-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
            {substanceId ? 'Upravit látku' : 'Nová látka'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Název</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900/50 border border-border-muted rounded-2xl px-5 py-4 text-sm font-bold text-slate-200 focus:outline-none focus:border-cyan-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Poločas (h)</label>
              <input
                type="number"
                value={formData.halfLife || ''}
                onChange={e => setFormData({ ...formData, halfLife: parseFloat(e.target.value) })}
                className="w-full bg-slate-900/50 border border-border-muted rounded-2xl px-5 py-4 text-sm font-bold text-slate-200 focus:outline-none focus:border-cyan-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Jednotka</label>
              <input
                type="text"
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-900/50 border border-border-muted rounded-2xl px-5 py-4 text-sm font-bold text-slate-200 focus:outline-none focus:border-cyan-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Barva</label>
            <div className="flex gap-3">
              {['#00d1ff', '#a855f7', '#ec4899', '#f97316', '#10b981', '#ef4444'].map(c => (
                <button
                  key={c}
                  onClick={() => setFormData({ ...formData, color: c })}
                  className={cn(
                    "w-10 h-10 rounded-xl border-2 transition-all",
                    formData.color === c ? "border-white scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onSave(formData as Substance)}
          className="w-full bg-cyan-primary text-slate-950 font-black py-5 rounded-3xl uppercase tracking-[0.2em] text-xs shadow-[0_0_30px_rgba(0,209,255,0.3)]"
        >
          Uložit změny
        </button>
      </div>
    </div>
  );
}

function Settings({ isOpen, settings, customEffects, onClose, onSave, onSaveEffects, onClearData, onImport, onExport }: {
  isOpen: boolean;
  settings: UserSettings;
  customEffects: CustomEffect[];
  onClose: () => void;
  onSave: (settings: UserSettings) => void;
  onSaveEffects: (effects: CustomEffect[]) => void;
  onClearData: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card-bg border border-border-muted rounded-[40px] p-8 space-y-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">Nastavení</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Správa dat</h4>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={onExport}
                className="w-full bg-slate-900 border border-border-muted rounded-2xl p-4 flex items-center gap-3 text-slate-300 hover:text-white transition-all"
              >
                <Download size={18} />
                <span className="text-xs font-bold">Exportovat data (JSON)</span>
              </button>
              <label className="w-full bg-slate-900 border border-border-muted rounded-2xl p-4 flex items-center gap-3 text-slate-300 hover:text-white transition-all cursor-pointer">
                <Upload size={18} />
                <span className="text-xs font-bold">Importovat data</span>
                <input type="file" className="hidden" onChange={onImport} accept=".json" />
              </label>
              <button 
                onClick={onClearData}
                className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-500 hover:bg-red-500/20 transition-all"
              >
                <Trash2 size={18} />
                <span className="text-xs font-bold">Smazat všechna data</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">O aplikaci</h4>
            <div className="bg-slate-900/50 rounded-3xl p-6 border border-border-muted">
              <p className="text-xs text-slate-400 leading-relaxed">
                BioTracker Pro v2.0<br />
                Pokročilý nástroj pro monitorování farmakokinetiky a metabolické zátěže.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main App Component ---

export type ViewType = 'dashboard' | 'logger' | 'history' | 'analytics' | 'substances';

export default function App() {
  const [view, setView] = useState<ViewType>('dashboard');
  const [substances, setSubstances] = useState<Substance[]>([]);
  const [doses, setDoses] = useState<Dose[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [customEffects, setCustomEffects] = useState<CustomEffect[]>(DEFAULT_EFFECTS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingSubstanceId, setEditingSubstanceId] = useState<string | null | 'new'>(null);
  const [editingTemplate, setEditingTemplate] = useState<Substance | null>(null);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' | 'info' | 'warning' }[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load data
  useEffect(() => {
    const savedSubstances = localStorage.getItem('biotracker_pro_substances');
    if (savedSubstances) {
      setSubstances(JSON.parse(savedSubstances));
    } else {
      setSubstances(DEFAULT_SUBSTANCES);
      localStorage.setItem('biotracker_pro_substances', JSON.stringify(DEFAULT_SUBSTANCES));
    }

    const savedDoses = localStorage.getItem('biotracker_pro_doses');
    if (savedDoses) setDoses(JSON.parse(savedDoses));

    const savedSettings = localStorage.getItem('biotracker_pro_settings');
    if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });

    const savedEffects = localStorage.getItem('biotracker_pro_effects');
    if (savedEffects) setCustomEffects(JSON.parse(savedEffects));

    const savedShortcuts = localStorage.getItem('biotracker_pro_shortcuts');
    if (savedShortcuts) setShortcuts(JSON.parse(savedShortcuts));
  }, []);

  // Save data
  useEffect(() => {
    if (substances.length > 0) localStorage.setItem('biotracker_pro_substances', JSON.stringify(substances));
  }, [substances]);

  useEffect(() => {
    localStorage.setItem('biotracker_pro_doses', JSON.stringify(doses));
  }, [doses]);

  useEffect(() => {
    localStorage.setItem('biotracker_pro_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('biotracker_pro_effects', JSON.stringify(customEffects));
  }, [customEffects]);

  useEffect(() => {
    localStorage.setItem('biotracker_pro_shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleToggleFavorite = (id: string) => {
    setSubstances(prev => prev.map(s => 
      s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
    ));
  };

  const handleAddDose = (dose: Dose) => {
    setDoses(prev => [...prev, dose]);
    showToast('Dávka zaznamenána', 'success');
  };

  const handleDeleteDose = (id: string) => {
    if (window.confirm('Opravdu chcete smazat tento záznam?')) {
      setDoses(prev => prev.filter(d => d.id !== id));
      showToast('Záznam smazán', 'info');
    }
  };

  const handleSaveSubstance = (substance: Substance) => {
    setSubstances(prev => {
      const index = prev.findIndex(s => s.id === substance.id);
      if (index !== -1) {
        const next = [...prev];
        next[index] = substance;
        return next;
      }
      return [...prev, substance];
    });
    setEditingSubstanceId(null);
    showToast('Látka uložena', 'success');
  };

  const handleDeleteSubstance = (id: string) => {
    if (window.confirm('Opravdu chcete smazat tuto látku?')) {
      setSubstances(prev => prev.filter(s => s.id !== id));
      showToast('Látka smazána', 'info');
    }
  };

  const handleExport = () => {
    const data = { substances, doses, settings, customEffects, exportDate: new Date().toISOString(), version: '2.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biotracker_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exportována', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.substances) setSubstances(data.substances);
        if (data.doses) setDoses(data.doses);
        if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        if (data.customEffects) setCustomEffects(data.customEffects);
        showToast('Data importována', 'success');
      } catch (err) {
        showToast('Chyba při importu', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('Opravdu chcete smazat VŠECHNA data?')) {
      setDoses([]);
      setSubstances(DEFAULT_SUBSTANCES);
      setSettings(DEFAULT_SETTINGS);
      setCustomEffects(DEFAULT_EFFECTS);
      showToast('Všechna data smazána', 'info');
    }
  };

  const handleQuickDose = (substanceId: string) => {
    const substance = substances.find(s => s.id === substanceId);
    if (!substance) return;
    
    const dose: Dose = {
      id: Math.random().toString(36).substr(2, 9),
      substanceId,
      amount: substance.step || 1,
      timestamp: new Date().toISOString(),
      route: 'oral',
      note: 'Rychlá dávka',
      bioavailabilityMultiplier: 1,
      tmaxMultiplier: 1
    };
    
    handleAddDose(dose);
  };

  const handleUseShortcut = (shortcut: Shortcut) => {
    const substance = substances.find(s => s.id === shortcut.substanceId);
    if (!substance) return;
    
    // Use default oral/full stomach multipliers to match Logger default
    const routeMult = ROUTE_MULTIPLIERS.oral;
    const stomachMult = STOMACH_MULTIPLIERS.full;
    
    const dose: Dose = {
      id: Math.random().toString(36).substr(2, 9),
      substanceId: shortcut.substanceId,
      amount: shortcut.amount,
      timestamp: new Date().toISOString(),
      route: 'oral',
      stomach: 'full',
      note: `Zkratka: ${shortcut.name}`,
      bioavailabilityMultiplier: routeMult.bioavailability * stomachMult.bioavailability,
      tmaxMultiplier: routeMult.tmaxMultiplier / stomachMult.speed
    };
    
    handleAddDose(dose);
  };

  const handleAddShortcut = (shortcut: Shortcut) => {
    setShortcuts(prev => [...prev, shortcut]);
    showToast('Zkratka přidána', 'success');
  };

  const handleRemoveShortcut = (id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
    showToast('Zkratka smazána', 'info');
  };

  const activeDoses = useMemo(() => {
    const now = Date.now();
    return doses.filter(dose => {
      const substance = substances.find(s => s.id === dose.substanceId);
      if (!substance) return false;
      const doseTime = new Date(dose.timestamp).getTime();
      const elapsed = (now - doseTime) / 3600000;
      const eliminationTime = substance.halfLife * 5; // Simplified
      return elapsed < eliminationTime;
    });
  }, [doses, substances]);

  const systemLoad = useMemo(() => {
    const activeSubstanceIds = Array.from(new Set<string>(activeDoses.map(d => d.substanceId)));
    const activeSubstanceDetails = activeSubstanceIds.map(id => {
      const substance = substances.find(s => s.id === id);
      const level = calculateSubstanceLevelAtTime(id, currentTime.getTime(), substances, doses, settings);
      return { substance, level };
    }).filter(item => item.substance !== undefined);

    const totalLoad = activeSubstanceDetails.reduce((sum, item) => sum + item.level, 0);
    if (totalLoad === 0) return { label: 'CLEAN', color: 'bg-emerald-500' };
    if (totalLoad < 50) return { label: 'ACTIVE', color: 'bg-cyan-primary' };
    if (totalLoad < 100) return { label: 'HIGH', color: 'bg-amber-400' };
    return { label: 'CRITICAL', color: 'bg-red-500' };
  }, [activeDoses, substances, doses, settings, currentTime]);

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-dark-bg text-slate-200 font-sans selection:bg-cyan-500/30 pb-24">
      {/* Header */}
      <header className="p-6 flex justify-between items-center sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-primary flex items-center justify-center shadow-[0_0_20px_rgba(0,209,255,0.4)]">
            <HeartPulse className="text-dark-bg" size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white leading-none">BioTracker</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", systemLoad.color)} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{systemLoad.label} MODE</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 rounded-xl bg-card-bg border border-border-muted hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {view === 'dashboard' && (
              <Dashboard 
                substances={substances} 
                settings={settings} 
                activeDoses={activeDoses}
                currentTime={currentTime}
                shortcuts={shortcuts}
                onUseShortcut={handleUseShortcut}
                onAddShortcut={handleAddShortcut}
                onRemoveShortcut={handleRemoveShortcut}
                onLogDose={handleAddDose}
              />
            )}
            {view === 'logger' && (
              <Logger 
                substances={substances} 
                doses={doses} 
                onAddDose={handleAddDose} 
                onDeleteDose={handleDeleteDose}
                onClearAll={handleClearAll}
              />
            )}
            {view === 'history' && (
              <DoseHistory 
                doses={doses} 
                substances={substances} 
                onDeleteDose={handleDeleteDose}
                onClearAll={handleClearAll}
              />
            )}
            {view === 'analytics' && (
              <Analytics 
                substances={substances} 
                doses={doses} 
                settings={settings} 
              />
            )}
            {view === 'substances' && (
              <Substances 
                substances={substances} 
                onEditSubstance={(id, template) => {
                  setEditingSubstanceId(id);
                  if (template) setEditingTemplate(template);
                }}
                onDeleteSubstance={handleDeleteSubstance}
                onAddPreset={(preset) => setSubstances(prev => [...prev, preset])}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-dark-bg/80 backdrop-blur-xl border-t border-border-muted px-6 py-3 flex justify-between items-center z-50">
        {[
          { id: 'dashboard', icon: Activity, label: 'Bio-Status' },
          { id: 'logger', icon: Plus, label: 'Záznam' },
          { id: 'history', icon: History, label: 'Historie' },
          { id: 'analytics', icon: BarChart3, label: 'Analýza' },
          { id: 'substances', icon: FlaskConical, label: 'Látky' },
        ].map((item) => {
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`relative flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-cyan-primary' : 'text-slate-500'}`}
            >
              {isActive && <div className="nav-active-indicator" />}
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium uppercase tracking-tighter">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      <SubstanceEditor 
        isOpen={editingSubstanceId !== null}
        substanceId={editingSubstanceId === 'new' ? null : editingSubstanceId}
        template={editingTemplate}
        substances={substances}
        customEffects={customEffects}
        onClose={() => {
          setEditingSubstanceId(null);
          setEditingTemplate(null);
        }}
        onSave={handleSaveSubstance}
      />

      <Settings 
        isOpen={isSettingsOpen}
        settings={settings}
        customEffects={customEffects}
        onClose={() => setIsSettingsOpen(false)}
        onSave={setSettings}
        onSaveEffects={setCustomEffects}
        onClearData={handleClearAll}
        onImport={handleImport}
        onExport={handleExport}
      />

      {/* Toasts */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-xs">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "p-4 rounded-2xl shadow-lg border flex items-center justify-between pointer-events-auto",
                toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' :
                toast.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' :
                toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/50 text-amber-200' :
                'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
              )}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
                {toast.type === 'error' && <AlertTriangle className="w-4 h-4" />}
                {toast.type === 'info' && <Info className="w-4 h-4" />}
                {toast.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
              <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
