import React, { useState } from 'react';
import { 
  X, 
  User, 
  Monitor, 
  Bell, 
  Sparkles, 
  Database, 
  Download, 
  Upload, 
  Trash2,
  Plus,
  Activity,
  Clock,
  Settings as SettingsIcon,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserSettings, CustomEffect, Valence } from '../types';
import { cn } from '../lib/utils';

interface SettingsProps {
  isOpen: boolean;
  settings: UserSettings;
  customEffects: CustomEffect[];
  onClose: () => void;
  onSave: (settings: UserSettings) => void;
  onSaveEffects: (effects: CustomEffect[]) => void;
  onClearData: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

export default function Settings({ 
  isOpen, 
  settings, 
  customEffects, 
  onClose, 
  onSave, 
  onSaveEffects,
  onClearData,
  onImport,
  onExport
}: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [newEffectName, setNewEffectName] = useState('');
  const [newEffectType, setNewEffectType] = useState<Valence>('positive');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const addCustomEffect = () => {
    if (!newEffectName.trim()) return;
    const icons = ['sparkles', 'zap', 'heart', 'brain', 'activity', 'smile', 'frown', 'alert-circle'];
    const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#ec4899', '#06b6d4', '#f43f5e'];
    
    const newEffect: CustomEffect = {
      name: newEffectName.trim(),
      icon: icons[Math.floor(Math.random() * icons.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      valence: newEffectType
    };
    
    onSaveEffects([...customEffects, newEffect]);
    setNewEffectName('');
  };

  const deleteCustomEffect = (index: number) => {
    onSaveEffects(customEffects.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-dark-bg/90 backdrop-blur-md"
      />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="relative bg-card-bg rounded-t-[40px] md:rounded-[40px] w-full max-w-xl h-[90vh] md:h-auto md:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border-t md:border border-border-muted"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-muted bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-primary/10 flex items-center justify-center border border-cyan-primary/20">
              <SettingsIcon className="text-cyan-primary" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Nastavení systému</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Konfigurace BioTrackeru</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-8">
          {/* User Profile */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
              <User size={12} className="text-cyan-primary" /> Biometrický profil
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1">Váha (kg)</label>
                <input 
                  type="number" 
                  value={localSettings.userWeight} 
                  onChange={e => setLocalSettings(prev => ({ ...prev, userWeight: parseInt(e.target.value) }))}
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-border-muted text-sm outline-none focus:border-cyan-primary transition-all text-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1">Věk</label>
                <input 
                  type="number" 
                  value={localSettings.userAge} 
                  onChange={e => setLocalSettings(prev => ({ ...prev, userAge: parseInt(e.target.value) }))}
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-border-muted text-sm outline-none focus:border-cyan-primary transition-all text-slate-200" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1">Metabolismus</label>
              <select 
                value={localSettings.userMetabolism} 
                onChange={e => setLocalSettings(prev => ({ ...prev, userMetabolism: e.target.value as any }))}
                className="w-full p-4 rounded-2xl bg-slate-950 border border-border-muted text-sm outline-none focus:border-cyan-primary transition-all text-slate-200 h-[58px]"
              >
                <option value="slow">Pomalý (-20%)</option>
                <option value="normal">Normální</option>
                <option value="fast">Rychlý (+20%)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1">Týdenní rozpočet (Kč)</label>
              <input 
                type="number" 
                value={localSettings.weeklyBudget || 1000} 
                onChange={e => setLocalSettings(prev => ({ ...prev, weeklyBudget: parseInt(e.target.value) }))}
                className="w-full p-4 rounded-2xl bg-slate-950 border border-border-muted text-sm outline-none focus:border-cyan-primary transition-all text-slate-200" 
              />
            </div>
          </div>

          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
              <Monitor size={12} className="text-cyan-primary" /> Rozhraní
            </h3>
            <div className="space-y-2">
              {[
                { id: 'timeFormat24h', label: '24h formát času', icon: Clock },
                { id: 'showSeconds', label: 'Zobrazit sekundy', icon: Activity },
                { id: 'compactMode', label: 'Kompaktní režim', icon: Smartphone },
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setLocalSettings(prev => ({ ...prev, [item.id]: !(prev as any)[item.id] }))}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                    (localSettings as any)[item.id] 
                      ? "bg-cyan-primary/10 border-cyan-primary/30 text-cyan-primary" 
                      : "bg-slate-950 border-border-muted text-slate-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span className="text-sm font-bold">{item.label}</span>
                  </div>
                  <div className={cn(
                    "w-10 h-5 rounded-full relative transition-all",
                    (localSettings as any)[item.id] ? "bg-cyan-primary" : "bg-slate-800"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                      (localSettings as any)[item.id] ? "right-1" : "left-1"
                    )} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Effects */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
              <Sparkles size={12} className="text-cyan-primary" /> Knihovna účinků
            </h3>
            <div className="flex flex-col gap-3 p-4 bg-slate-950 border border-border-muted rounded-3xl">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newEffectName} 
                  onChange={e => setNewEffectName(e.target.value)}
                  className="flex-1 p-3 rounded-xl bg-slate-900 border border-border-muted text-sm outline-none focus:border-cyan-primary transition-all text-slate-200" 
                  placeholder="Nový účinek..." 
                />
                <select 
                  value={newEffectType} 
                  onChange={e => setNewEffectType(e.target.value as Valence)}
                  className="p-3 rounded-xl bg-slate-900 border border-border-muted text-xs outline-none focus:border-cyan-primary transition-all text-slate-200"
                >
                  <option value="positive">Pozit.</option>
                  <option value="negative">Negat.</option>
                  <option value="neutral">Neutr.</option>
                </select>
                <button 
                  onClick={addCustomEffect}
                  className="p-3 rounded-xl bg-cyan-primary text-black hover:bg-cyan-primary/80 transition-all active:scale-90"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide pr-1">
                {customEffects.length === 0 ? (
                  <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest text-center py-4">Žádné vlastní účinky</p>
                ) : (
                  customEffects.map((effect, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-border-muted">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-950 border border-border-muted">
                          <Activity size={14} style={{ color: effect.color }} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-200">{effect.name}</span>
                          <span className={cn(
                            "text-[8px] uppercase font-black tracking-widest ml-2",
                            effect.valence === 'positive' ? "text-emerald-400" : effect.valence === 'negative' ? "text-rose-400" : "text-cyan-primary"
                          )}>
                            {effect.valence}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteCustomEffect(i)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
              <Database size={12} className="text-cyan-primary" /> Správa dat
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={onExport}
                className="py-4 px-4 rounded-2xl bg-slate-950 border border-border-muted hover:bg-slate-900 flex flex-col items-center justify-center gap-2 transition-all group"
              >
                <Download className="text-slate-500 group-hover:text-cyan-primary transition-colors" size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Exportovat</span>
              </button>
              <label className="py-4 px-4 rounded-2xl bg-slate-950 border border-border-muted hover:bg-slate-900 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                <Upload className="text-slate-500 group-hover:text-cyan-primary transition-colors" size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Importovat</span>
                <input type="file" accept=".json" onChange={onImport} className="hidden" />
              </label>
            </div>
            <button 
              onClick={onClearData}
              className="w-full py-4 rounded-2xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 flex items-center justify-center gap-3 transition-all font-bold text-[10px] uppercase tracking-widest"
            >
              <Trash2 size={16} /> Smazat všechna data
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-border-muted bg-slate-900/80 backdrop-blur-xl">
          <button 
            onClick={handleSave}
            className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] bg-cyan-primary text-black shadow-lg shadow-cyan-primary/20 active:scale-[0.98] transition-all"
          >
            Uložit konfiguraci
          </button>
        </div>
      </motion.div>
    </div>
  );
}
