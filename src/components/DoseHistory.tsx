import { Clock, Trash2, Activity, Calendar } from 'lucide-react';
import { Dose, Substance } from '../types';
import { cn } from '../lib/utils';

interface HistoryProps {
  doses: Dose[];
  substances: Substance[];
  onDeleteDose: (id: string) => void;
  onClearAll: () => void;
}

export default function History({ doses, substances, onDeleteDose, onClearAll }: HistoryProps) {
  const sortedDoses = [...doses].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const groupedDoses = sortedDoses.reduce((groups: Record<string, Dose[]>, dose) => {
    const date = new Date(dose.timestamp).toLocaleDateString('cs-CZ', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(dose);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Clock size={12} className="text-cyan-primary" /> Časová osa
        </h2>
        <button 
          onClick={onClearAll}
          className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors"
        >
          Vymazat vše
        </button>
      </div>

      {doses.length === 0 ? (
        <div className="p-12 text-center bg-card-bg rounded-[32px] border border-border-muted border-dashed">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-border-muted">
            <Clock size={32} className="text-slate-700" />
          </div>
          <span className="text-xs text-slate-600 font-medium uppercase tracking-widest">Žádné záznamy v historii</span>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDoses).map(([date, dayDoses]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <Calendar size={12} className="text-slate-600" />
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{date}</h3>
              </div>
              
              <div className="space-y-2">
                {dayDoses.map(dose => {
                  const substance = substances.find(s => s.id === dose.substanceId);
                  if (!substance) return null;
                  
                  return (
                    <div 
                      key={dose.id} 
                      className="bg-card-bg rounded-2xl p-4 border border-border-muted flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-border-muted">
                          <Activity size={18} style={{ color: substance.color || '#00d1ff' }} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-200">
                            {substance.name}
                            {dose.strainId && <span className="text-[10px] text-slate-500 ml-2 font-medium">({dose.strainId})</span>}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium uppercase">
                            {dose.amount}{substance.unit} • {new Date(dose.timestamp).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                            {dose.route && ` • ${dose.route}`}
                          </div>
                          {dose.note && (
                            <div className="mt-1.5 text-[10px] text-slate-400 italic leading-relaxed border-l border-slate-700 pl-2">
                              "{dose.note}"
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => onDeleteDose(dose.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
