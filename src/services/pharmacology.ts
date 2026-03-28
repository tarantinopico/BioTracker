import { Substance, Dose, UserSettings } from '../types';

export function getMetabolismMultiplier(settings: UserSettings): number {
  const metabolism = settings.userMetabolism || 'normal';
  switch (metabolism) {
    case 'slow': return 0.8;
    case 'fast': return 1.2;
    default: return 1;
  }
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
  
  // Typical dose for normalization
  const typicalDose = getTypicalDose(substanceId);
  
  const averageDailyAmount = totalAmount / 7;
  const frequencyFactor = (daysWithUse / 7) * 50;
  const amountFactor = Math.min((averageDailyAmount / typicalDose) * 30, 50);

  return Math.min(frequencyFactor + amountFactor, 95);
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
    
    // Intensity is substance level (0-100) * effect base intensity (0-100) / 100
    // We normalize by effect intensity (which is 1-10 in constants, let's assume it's 1-10)
    // Actually in constants it's like 7, 6, 5. Let's treat it as a multiplier.
    const contribution = (level * Math.abs(effect.intensity)) / 10;
    totalIntensity += contribution;
  });
  
  return Math.min(totalIntensity, 100);
}
