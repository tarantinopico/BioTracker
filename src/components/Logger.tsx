import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Leaf, 
  Cigarette, 
  Coffee, 
  Activity, 
  AlertTriangle, 
  Fingerprint,
  Clock
} from 'lucide-react';
import { Substance, Dose } from '../types';
import { cn } from '../lib/utils';
import { ROUTE_MULTIPLIERS, STOMACH_MULTIPLIERS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface LoggerProps {
  substances: Substance[];
  doses: Dose[];
  onAddDose: (dose: Dose) => void;
  onDeleteDose: (id: string) => void;
  onClearAll: () => void;
}

export default function Logger({ substances, doses, onAddDose }: LoggerProps) {
  const [selectedSubstanceId, setSelectedSubstanceId] = useState(substances[0]?.id || '');
  const [selectedStrainId, setSelectedStrainId] = useState('');
  const [amount, setAmount] = useState(0);
  const [timeOffset, setTimeOffset] = useState(0); // in minutes
  const [route, setRoute] = useState('oral');
  const [stomach, setStomach] = useState('full');
  const [note, setNote] = useState('');

  const selectedSubstance = useMemo(() => 
    substances.find(s => s.id === selectedSubstanceId), 
  [substances, selectedSubstanceId]);

  useEffect(() => {
    if (selectedSubstance) {
      setAmount(selectedSubstance.step || 1);
      setSelectedStrainId('');
    }
  }, [selectedSubstanceId, selectedSubstance]);

  const handleAdjust = (direction: number) => {
    const step = selectedSubstance?.step || 1;
    setAmount(prev => Math.max(0, prev + (direction * step)));
  };

  const handleSubmit = () => {
    if (!selectedSubstance) return;

    const routeMult = ROUTE_MULTIPLIERS[route] || ROUTE_MULTIPLIERS.oral;
    let bioavailabilityMultiplier = routeMult.bioavailability;
    let tmaxMultiplier = routeMult.tmaxMultiplier;

    if (route === 'oral') {
      const stomachMult = STOMACH_MULTIPLIERS[stomach] || STOMACH_MULTIPLIERS.full;
      bioavailabilityMultiplier *= stomachMult.bioavailability;
      tmaxMultiplier /= stomachMult.speed;
    }

    const timestamp = new Date(Date.now() - timeOffset * 60000).toISOString();

      const dose: Dose = {
        id: 'dose_' + Date.now(),
        substanceId: selectedSubstanceId,
        amount,
        timestamp,
        route,
        stomach: route === 'oral' ? stomach : null,
        note,
        strainId: selectedStrainId || null,
        bioavailabilityMultiplier,
        tmaxMultiplier
      };

      onAddDose(dose);
      // Reset offset and note but keep substance
      setTimeOffset(0);
      setNote('');
    };

  const getSubstanceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('kratom')) return Leaf;
    if (n.includes('nikotin') || n.includes('nicotine')) return Cigarette;
    if (n.includes('kofein') || n.includes('caffeine') || n.includes('káva')) return Coffee;
    return Activity;
  };

  const warnings = useMemo(() => {
    const list = [];
    if (!selectedSubstance) return list;

    // Too soon warning
    const lastDose = doses.find(d => d.substanceId === selectedSubstanceId);
    if (lastDose) {
      const minInterval = 2; // hours, could be substance specific
      const elapsed = (Date.now() - new Date(lastDose.timestamp).getTime()) / 3600000;
      if (elapsed < minInterval) {
        list.push({
          type: 'time',
          title: 'Příliš brzy',
          message: `Minimální odstup je ${minInterval}h. Uplynulo pouze ${elapsed.toFixed(1)}h.`,
          severity: 'medium'
        });
      }
    }

    // Interaction warning
    const activeDoses = doses.filter(d => {
      const elapsed = (Date.now() - new Date(d.timestamp).getTime()) / 3600000;
      const sub = substances.find(s => s.id === d.substanceId);
      return sub ? elapsed < sub.halfLife * 5 : false;
    });
    
    const activeSubstanceIds = Array.from(new Set(activeDoses.map(d => d.substanceId)));
    
    activeSubstanceIds.forEach(id => {
      if (id === selectedSubstanceId) return;
      const other = substances.find(s => s.id === id);
      if (!other) return;
      
      if (selectedSubstance.interactions?.includes(id) || other.interactions?.includes(selectedSubstanceId)) {
        list.push({
          type: 'interaction',
          title: 'Nebezpečná kombinace',
          message: `Pozor na kombinaci s ${other.name}. ${selectedSubstance.interactionMessage || other.interactionMessage || ''}`,
          severity: selectedSubstance.isSevere || other.isSevere ? 'high' : 'medium'
        });
      }
    });

    return list;
  }, [selectedSubstanceId, doses, selectedSubstance, substances]);

  const timeOptions = [
    { label: 'Nyní', value: 0 },
    { label: '-15m', value: 15 },
    { label: '-30m', value: 30 },
    { label: '-1h', value: 60 },
    { label: '-2h', value: 120 },
  ];

  const currentStrain = selectedSubstance?.strains?.find(s => s.name === selectedStrainId);
  const price = currentStrain ? currentStrain.price * amount : (selectedSubstance?.price || 0) * amount;

  return (
    <div className="space-y-6 pb-8">
      {/* Substance Selection */}
      <section>
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Zvolte látku</h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          {substances.map(s => {
            const Icon = getSubstanceIcon(s.name);
            const isActive = selectedSubstanceId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSubstanceId(s.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all whitespace-nowrap min-w-[120px] justify-center relative overflow-hidden",
                  isActive 
                    ? "border-transparent text-dark-bg font-bold" 
                    : "bg-card-bg border-border-muted text-slate-400"
                )}
                style={isActive ? { backgroundColor: s.color || '#00d1ff', boxShadow: `0 0 20px ${s.color}40` } : {}}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Strain Selection */}
      {selectedSubstance?.strains && selectedSubstance.strains.length > 0 && (
        <section>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1 flex items-center gap-1">
            <Activity size={10} /> Druh / Varianta
          </h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {selectedSubstance.strains.map(strain => {
              const isActive = selectedStrainId === strain.name;
              return (
                <button
                  key={strain.name}
                  onClick={() => setSelectedStrainId(strain.name)}
                  className={cn(
                    "px-4 py-2 rounded-xl border text-xs font-medium transition-all whitespace-nowrap",
                    isActive 
                      ? "bg-slate-800 border-cyan-primary text-cyan-primary" 
                      : "bg-card-bg border-border-muted text-slate-500"
                  )}
                  style={isActive ? { borderColor: selectedSubstance.color, color: selectedSubstance.color } : {}}
                >
                  {strain.name}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Warnings */}
      <AnimatePresence>
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-4 rounded-2xl border flex items-start gap-3",
                  w.severity === 'high' ? "bg-red-500/10 border-red-500/30" : "bg-amber-500/10 border-amber-500/30"
                )}
              >
                <AlertTriangle className={cn("shrink-0 mt-0.5", w.severity === 'high' ? "text-red-500" : "text-amber-500")} size={18} />
                <div className="text-sm">
                  <span className={cn("font-bold", w.severity === 'high' ? "text-red-500" : "text-amber-500")}>{w.title}: </span>
                  <span className="text-slate-300">{w.message}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Amount Control */}
      <section className="bg-card-bg rounded-[40px] p-8 border border-border-muted flex flex-col items-center relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
          style={{ background: `linear-gradient(to bottom, ${selectedSubstance?.color || '#00d1ff'}, transparent)` }}
        />
        
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8 relative z-10">Množství dávky</h3>
        
        <div className="flex items-center justify-between w-full max-w-[280px] relative z-10">
          <button 
            onClick={() => handleAdjust(-1)}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-900 border border-border-muted text-slate-400 active:scale-90 transition-transform"
          >
            <Minus size={28} />
          </button>
          
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-bold tracking-tighter" style={{ color: selectedSubstance?.color || '#00d1ff', textShadow: `0 0 20px ${selectedSubstance?.color}40` }}>{amount}</span>
              <span className="font-bold text-sm" style={{ color: selectedSubstance?.color || '#00d1ff' }}>{selectedSubstance?.unit || 'g'}</span>
            </div>
          </div>
          
          <button 
            onClick={() => handleAdjust(1)}
            className="w-16 h-16 rounded-full flex items-center justify-center text-dark-bg active:scale-90 transition-transform"
            style={{ backgroundColor: selectedSubstance?.color || '#00d1ff', boxShadow: `0 0 20px ${selectedSubstance?.color}40` }}
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>

        {/* Quick Amount Presets */}
        <div className="flex gap-2 mt-8 relative z-10 overflow-x-auto no-scrollbar max-w-full px-4">
          {[1, 5, 10, 25, 50, 100].map(val => (
            <button
              key={val}
              onClick={() => setAmount(val)}
              className="px-4 py-2 rounded-xl bg-slate-900/80 border border-border-muted text-[10px] font-bold text-slate-400 hover:text-white transition-all whitespace-nowrap"
              style={{ borderColor: amount === val ? selectedSubstance?.color : undefined }}
            >
              {val} {selectedSubstance?.unit}
            </button>
          ))}
        </div>

        <div className="flex justify-between w-full mt-10 relative z-10">
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
            style={{ backgroundColor: `${selectedSubstance?.color}10`, borderColor: `${selectedSubstance?.color}20` }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedSubstance?.color }} />
            <span className="text-[10px] font-bold uppercase" style={{ color: selectedSubstance?.color }}>Střední</span>
          </div>
          
          <div 
            className="px-3 py-1.5 rounded-lg border"
            style={{ backgroundColor: `${selectedSubstance?.color}10`, borderColor: `${selectedSubstance?.color}20` }}
          >
            <span className="text-[10px] font-bold uppercase" style={{ color: selectedSubstance?.color }}>{price.toFixed(1)} Kč</span>
          </div>
        </div>
      </section>

      {/* Time Selection */}
      <section>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {timeOptions.map(opt => {
            const isActive = timeOffset === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTimeOffset(opt.value)}
                className={cn(
                  "flex-1 px-4 py-4 rounded-2xl border text-sm font-medium transition-all whitespace-nowrap min-w-[80px]",
                  isActive 
                    ? "text-dark-bg font-bold border-transparent" 
                    : "bg-card-bg border-border-muted text-slate-400"
                )}
                style={isActive ? { backgroundColor: selectedSubstance?.color || '#00d1ff' } : {}}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Notes (Compact) */}
      <section>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Fingerprint size={16} className="text-slate-500 group-focus-within:text-cyan-primary transition-colors" />
          </div>
          <input 
            type="text" 
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Poznámka k dávce (volitelné)..."
            className="w-full bg-card-bg border border-border-muted rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-cyan-primary/50 focus:ring-1 focus:ring-cyan-primary/20 transition-all text-slate-200"
          />
        </div>
      </section>

      {/* Submit Button */}
      <button 
        onClick={handleSubmit}
        className="w-full py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all"
        style={{ backgroundColor: selectedSubstance?.color || '#fff', color: selectedSubstance?.color ? '#000' : '#000' }}
      >
        <Fingerprint size={24} />
        Zapsat do systému
      </button>

      {/* Advanced Settings (Compact) */}
      <section className="pt-4 border-t border-border-muted/50">
        <div className="flex items-center justify-between px-2">
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase font-bold">Aplikace</span>
              <select 
                value={route} 
                onChange={(e) => setRoute(e.target.value)}
                className="bg-transparent text-xs text-slate-300 outline-none"
              >
                <option value="oral">Oral</option>
                <option value="sublingual">Sublingual</option>
                <option value="insufflated">Sniff</option>
                <option value="inhaled">Inhale</option>
              </select>
            </div>
            {route === 'oral' && (
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase font-bold">Žaludek</span>
                <select 
                  value={stomach} 
                  onChange={(e) => setStomach(e.target.value)}
                  className="bg-transparent text-xs text-slate-300 outline-none"
                >
                  <option value="empty">Empty</option>
                  <option value="light">Light</option>
                  <option value="full">Full</option>
                </select>
              </div>
            )}
          </div>
          <button className="p-2 text-slate-500 hover:text-slate-300">
            <Clock size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
