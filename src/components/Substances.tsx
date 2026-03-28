import { FlaskConical, Plus, Trash2, Database, Package, Activity, ChevronRight, Search, X, Star } from 'lucide-react';
import { Substance, SubstanceCategory } from '../types';
import { cn } from '../lib/utils';
import { DEFAULT_SUBSTANCES } from '../constants';
import { useState, useMemo } from 'react';

interface SubstancesProps {
  substances: Substance[];
  onEditSubstance: (id: string | 'new', template?: Substance) => void;
  onDeleteSubstance: (id: string) => void;
  onAddPreset: (preset: Substance) => void;
  onToggleFavorite: (id: string) => void;
}

export default function Substances({ substances, onEditSubstance, onDeleteSubstance, onAddPreset, onToggleFavorite }: SubstancesProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SubstanceCategory | 'all'>('all');

  const categories: (SubstanceCategory | 'all')[] = [
    'all', 'stimulant', 'depressant', 'psychedelic', 'opioid', 'dissociative', 'cannabinoid', 'nootropic', 'supplement'
  ];

  const filteredSubstances = useMemo(() => {
    return substances.filter(sub => {
      const matchesSearch = !search.trim() || 
        sub.name.toLowerCase().includes(search.toLowerCase()) || 
        sub.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || sub.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [substances, search, selectedCategory]);

  const presets = DEFAULT_SUBSTANCES.filter(ds => !substances.some(s => s.id === ds.id));

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-500 group-focus-within:text-cyan-primary transition-colors" />
        </div>
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Hledat látku..."
          className="w-full bg-card-bg border border-border-muted rounded-2xl py-4 pl-12 pr-12 text-sm outline-none focus:border-cyan-primary/50 focus:ring-1 focus:ring-cyan-primary/20 transition-all text-slate-200"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
              selectedCategory === cat 
                ? "bg-cyan-primary border-transparent text-dark-bg shadow-[0_0_15px_rgba(0,209,255,0.3)]" 
                : "bg-card-bg border-border-muted text-slate-500 hover:text-slate-300"
            )}
          >
            {cat === 'all' ? 'Vše' : cat}
          </button>
        ))}
      </div>

      {/* My Substances */}
      <section className="bg-card-bg rounded-[32px] p-6 border border-border-muted">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-primary/10">
              <Database className="w-5 h-5 text-cyan-primary" />
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Databáze</h2>
              <div className="text-lg font-black text-white">Moje látky</div>
            </div>
          </div>
          <button 
            onClick={() => onEditSubstance('new')}
            className="w-10 h-10 rounded-xl bg-cyan-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,209,255,0.3)] active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6 text-dark-bg" />
          </button>
        </div>
        
        <div className="space-y-3">
          {filteredSubstances.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border-muted rounded-2xl">
              <span className="text-xs text-slate-600 font-medium uppercase tracking-widest">Žádné látky nenalezeny</span>
            </div>
          ) : (
            filteredSubstances.map(substance => (
              <div 
                key={substance.id} 
                onClick={() => onEditSubstance(substance.id)}
                className="bg-slate-900/50 border border-border-muted/50 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-900/80 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: substance.color || '#00d1ff' }} />
                
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800 border border-border-muted/50">
                  <Activity size={18} style={{ color: substance.color || '#00d1ff' }} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-slate-200 truncate text-sm">{substance.name}</h3>
                    <span className={cn(
                      "text-[7px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded-md border",
                      substance.category === 'stimulant' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      substance.category === 'depressant' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      substance.category === 'psychedelic' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                      substance.category === 'opioid' && "bg-pink-500/10 text-pink-400 border-pink-500/20",
                      substance.category === 'cannabinoid' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      substance.category === 'nootropic' && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                      substance.category === 'supplement' && "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    )}>
                      {substance.category}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    T₁/₂: {substance.halfLife}h • Tmax: {substance.tmax}h
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(substance.id);
                    }}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      substance.isFavorite ? "text-amber-400 bg-amber-400/10" : "text-slate-600 hover:text-amber-400 hover:bg-amber-400/5"
                    )}
                  >
                    <Star size={14} fill={substance.isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSubstance(substance.id);
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={16} className="text-slate-700 group-hover:text-cyan-primary transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Presets */}
      {presets.length > 0 && (
        <section className="bg-card-bg rounded-[32px] p-6 border border-border-muted">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Package size={12} className="text-purple-400" /> Přednastavené látky
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {presets.map(preset => (
              <button 
                key={preset.id}
                onClick={() => onAddPreset(preset)}
                className="p-4 rounded-2xl bg-slate-900/50 border border-border-muted/50 hover:bg-slate-900/80 text-left flex items-center gap-3 transition-all active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-border-muted/50">
                  <Activity size={14} style={{ color: preset.color || '#00d1ff' }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-200 truncate">{preset.name}</div>
                  <div className="text-[8px] text-slate-500 font-bold uppercase">{preset.category}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
