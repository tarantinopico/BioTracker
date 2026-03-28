import { Plus, Zap, X, ChevronDown } from 'lucide-react';
import { Substance, Shortcut } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface QuickActionsProps {
  shortcuts: Shortcut[];
  substances: Substance[];
  onUseShortcut: (shortcut: Shortcut) => void;
  onAddShortcut: (shortcut: Shortcut) => void;
  onRemoveShortcut: (id: string) => void;
}

export default function QuickActions({ shortcuts, substances, onUseShortcut, onAddShortcut, onRemoveShortcut }: QuickActionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newShortcut, setNewShortcut] = useState<Partial<Shortcut>>({
    name: '',
    amount: 0,
    substanceId: '',
    color: '#00d1ff'
  });

  const handleCreate = () => {
    if (!newShortcut.name || !newShortcut.substanceId || (newShortcut.amount ?? 0) <= 0) return;
    
    const substance = substances.find(s => s.id === newShortcut.substanceId);
    
    onAddShortcut({
      id: Math.random().toString(36).substr(2, 9),
      name: newShortcut.name,
      substanceId: newShortcut.substanceId,
      amount: Number(newShortcut.amount),
      color: substance?.color || '#00d1ff',
    });
    
    setIsAdding(false);
    setNewShortcut({ name: '', amount: 0, substanceId: '', color: '#00d1ff' });
  };

  const selectedSubstance = substances.find(s => s.id === newShortcut.substanceId);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rychlé užití</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-1.5 rounded-lg bg-cyan-primary/10 border border-cyan-primary/20 text-cyan-primary hover:bg-cyan-primary/20 transition-colors"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {shortcuts.map((shortcut) => (
            <motion.div
              key={shortcut.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="relative group"
            >
              <button
                onClick={() => onUseShortcut(shortcut)}
                className="w-full flex flex-col items-start gap-2 p-4 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] rounded-[24px] hover:border-white/20 transition-all active:scale-[0.97] text-left relative overflow-hidden group shadow-lg"
              >
                {/* Background Glow */}
                <div 
                  className="absolute -top-4 -right-4 w-16 h-16 opacity-[0.08] blur-2xl rounded-full group-hover:opacity-[0.15] transition-opacity"
                  style={{ backgroundColor: shortcut.color }}
                />
                
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                    <Zap 
                      size={12} 
                      className="transition-transform group-hover:scale-110"
                      style={{ color: shortcut.color }} 
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest truncate max-w-[80px]">
                    {shortcut.name}
                  </span>
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white tracking-tight">
                    {shortcut.amount}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                    {substances.find(s => s.id === shortcut.substanceId)?.unit || ''}
                  </span>
                </div>

                {/* Subtle progress-like line at bottom */}
                <div 
                  className="absolute bottom-0 left-0 h-0.5 opacity-30 transition-all group-hover:opacity-100"
                  style={{ backgroundColor: shortcut.color, width: '100%' }}
                />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveShortcut(shortcut.id);
                }}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg border border-white/10 z-10"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {shortcuts.length === 0 && (
          <button
            onClick={() => setIsAdding(true)}
            className="col-span-2 py-8 rounded-[24px] bg-white/[0.01] border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-slate-600 hover:text-cyan-primary hover:border-cyan-primary/50 transition-all active:scale-95"
          >
            <Plus size={24} strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Přidat první zkratku</span>
          </button>
        )}
      </div>

      {/* Add Shortcut Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xs bg-[#0e1217]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 relative z-10 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Zkratka</h2>
                  <div className="text-lg font-black text-white">Nové rychlé užití</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Název</label>
                  <input
                    type="text"
                    value={newShortcut.name}
                    onChange={(e) => setNewShortcut(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Např. Nikotinový sáček"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-primary/50 transition-colors text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Látka</label>
                  <div className="relative">
                    <select
                      value={newShortcut.substanceId}
                      onChange={(e) => setNewShortcut(prev => ({ ...prev, substanceId: e.target.value }))}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-primary/50 transition-colors text-slate-200 appearance-none pr-10"
                    >
                      <option value="" className="bg-[#0e1217]">Vyberte látku</option>
                      {substances.map(s => (
                        <option key={s.id} value={s.id} className="bg-[#0e1217] text-slate-200">{s.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      {selectedSubstance && (
                        <div 
                          className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" 
                          style={{ color: selectedSubstance.color, backgroundColor: selectedSubstance.color }}
                        />
                      )}
                      <ChevronDown className="text-slate-500" size={16} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Množství</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={newShortcut.amount || ''}
                      onChange={(e) => setNewShortcut(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      placeholder="0"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-primary/50 transition-colors text-slate-200"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500 uppercase">
                      {selectedSubstance?.unit || ''}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Zrušit
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!newShortcut.name || !newShortcut.substanceId || (newShortcut.amount ?? 0) <= 0}
                    className="flex-1 py-3 rounded-xl bg-cyan-primary text-dark-bg text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(0,209,255,0.3)]"
                  >
                    Vytvořit
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
