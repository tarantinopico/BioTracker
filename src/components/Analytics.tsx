import { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  LineChart as LineChartIcon, 
  BarChart2, 
  RefreshCw, 
  GitMerge, 
  Calendar,
  TrendingUp,
  Activity,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { Substance, Dose, UserSettings } from '../types';
import { cn } from '../lib/utils';
import { calculateTolerance } from '../services/pharmacology';

interface AnalyticsProps {
  substances: Substance[];
  doses: Dose[];
  settings: UserSettings;
}

export default function Analytics({ substances, doses, settings }: AnalyticsProps) {
  const now = Date.now();
  const dayMs = 86400000;
  const weekMs = dayMs * 7;
  const monthMs = dayMs * 30;

  const calculateCost = (startTime: number) => {
    return doses
      .filter(d => new Date(d.timestamp).getTime() > startTime)
      .reduce((sum, d) => {
        const substance = substances.find(s => s.id === d.substanceId);
        if (!substance) return sum;
        const strainPrice = d.strainId ? substance.strains.find(s => s.name === d.strainId)?.price : null;
        const price = strainPrice || substance.price || 0;
        return sum + (d.amount * price);
      }, 0);
  };

  const costData = useMemo(() => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = dayStart + dayMs;
      
      const dayCost = doses
        .filter(d => {
          const t = new Date(d.timestamp).getTime();
          return t >= dayStart && t < dayEnd;
        })
        .reduce((sum, d) => {
          const substance = substances.find(s => s.id === d.substanceId);
          if (!substance) return sum;
          const strainPrice = d.strainId ? substance.strains.find(s => s.name === d.strainId)?.price : null;
          const price = strainPrice || substance.price || 0;
          return sum + (d.amount * price);
        }, 0);

      data.push({
        name: date.toLocaleDateString('cs-CZ', { weekday: 'short' }),
        cost: dayCost
      });
    }
    return data;
  }, [doses, substances]);

  const weeklyUsageData = useMemo(() => {
    const days = 14;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = dayStart + dayMs;
      
      const dayDoses = doses.filter(d => {
        const t = new Date(d.timestamp).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;

      data.push({
        name: date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' }),
        count: dayDoses
      });
    }
    return data;
  }, [doses]);

  const substanceUsage = useMemo(() => {
    const usage: Record<string, { count: number, totalAmount: number }> = {};
    doses.forEach(dose => {
      if (!usage[dose.substanceId]) {
        usage[dose.substanceId] = { count: 0, totalAmount: 0 };
      }
      usage[dose.substanceId].count++;
      usage[dose.substanceId].totalAmount += dose.amount;
    });
    return Object.entries(usage)
      .map(([id, data]) => ({ id, ...data, substance: substances.find(s => s.id === id) }))
      .filter(item => item.substance !== undefined)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [doses, substances]);

  const combinations = useMemo(() => {
    const dailyDoses: Record<string, Set<string>> = {};
    doses.forEach(dose => {
      const day = new Date(dose.timestamp).toDateString();
      if (!dailyDoses[day]) dailyDoses[day] = new Set();
      dailyDoses[day].add(dose.substanceId);
    });

    const comboCounts: Record<string, number> = {};
    Object.values(dailyDoses).forEach(daySubstances => {
      const substancesArr = Array.from(daySubstances).sort();
      if (substancesArr.length > 1) {
        const key = substancesArr.join('+');
        comboCounts[key] = (comboCounts[key] || 0) + 1;
      }
    });

    return Object.entries(comboCounts)
      .map(([combo, count]) => ({
        ids: combo.split('+'),
        count,
        names: combo.split('+').map(id => substances.find(s => s.id === id)?.name || id)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [doses, substances]);

  const tolerances = useMemo(() => {
    return substances
      .map(s => ({ substance: s, tolerance: calculateTolerance(s.id, substances, doses) }))
      .filter(item => item.tolerance > 5)
      .sort((a, b) => b.tolerance - a.tolerance);
  }, [substances, doses]);

  const weeklyCost = useMemo(() => calculateCost(now - weekMs), [doses, substances, now, weekMs]);
  const monthlyCost = useMemo(() => calculateCost(now - monthMs), [doses, substances, now, monthMs]);
  const dailyCost = useMemo(() => calculateCost(now - dayMs), [doses, substances, now, dayMs]);

  const budgetProgress = Math.min((weeklyCost / (settings.weeklyBudget || 1000)) * 100, 100);
  const budgetRemaining = Math.max((settings.weeklyBudget || 1000) - weeklyCost, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Financial Overview */}
      <section className="bg-card-bg rounded-[32px] p-6 border border-border-muted overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Finanční přehled</h2>
              <div className="text-lg font-black text-white">Rozpočet & Náklady</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-border-muted/50">
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Týdenní útrata</div>
            <div className="text-xl font-black text-white">{weeklyCost.toFixed(0)} <span className="text-xs text-slate-500">Kč</span></div>
          </div>
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-border-muted/50">
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Zbývá v rozpočtu</div>
            <div className="text-xl font-black text-emerald-400">{budgetRemaining.toFixed(0)} <span className="text-xs text-slate-500">Kč</span></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-slate-500">Čerpání týdenního limitu</span>
            <span className={cn(budgetProgress > 90 ? "text-red-500" : "text-emerald-500")}>{budgetProgress.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${budgetProgress}%` }}
              className={cn(
                "h-full rounded-full transition-colors",
                budgetProgress > 90 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
              )}
            />
          </div>
        </div>
      </section>

      {/* Cost Chart */}
      <section className="bg-card-bg rounded-[32px] p-6 border border-border-muted">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <LineChartIcon size={12} className="text-cyan-primary" /> Vývoj nákladů (7 dní)
        </h2>
        <div className="h-40 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e252e" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0e1217', borderColor: '#1e252e', borderRadius: '12px', fontSize: '10px' }}
                cursor={{ fill: '#1e252e', opacity: 0.4 }}
              />
              <Bar dataKey="cost" fill="#00d1ff" radius={[4, 4, 0, 0]}>
                {costData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === costData.length - 1 ? '#00d1ff' : '#1e252e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Usage Patterns */}
      <section className="bg-card-bg rounded-[32px] p-6 border border-border-muted">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <BarChart2 size={12} className="text-purple-400" /> Vzorce užívání
        </h2>
        <div className="space-y-4">
          {substanceUsage.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-border-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-border-muted">
                  <Activity size={18} style={{ color: item.substance!.color || '#00d1ff' }} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">{item.substance!.name}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase">{item.count}× záznamů</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-cyan-primary">{item.totalAmount.toFixed(1)}</div>
                <div className="text-[8px] text-slate-500 font-bold uppercase">{item.substance!.unit} celkem</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Combinations */}
      <section className="bg-card-bg rounded-[32px] p-6 border border-border-muted">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <GitMerge size={12} className="text-orange-400" /> Nejčastější kombinace
        </h2>
        <div className="space-y-3">
          {combinations.map((combo, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-border-muted/50">
              <div className="flex flex-wrap gap-2 max-w-[70%]">
                {combo.names.map((name, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded-lg border border-border-muted/50">
                    {name}
                  </span>
                ))}
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-white">{combo.count}×</div>
                <div className="text-[8px] text-slate-500 font-bold uppercase">Společně</div>
              </div>
            </div>
          ))}
          {combinations.length === 0 && (
            <div className="p-8 text-center border border-dashed border-border-muted rounded-2xl">
              <span className="text-xs text-slate-600 font-medium uppercase tracking-widest">Žádné kombinace</span>
            </div>
          )}
        </div>
      </section>

      {/* Tolerance Overview */}
      <section className="bg-card-bg rounded-[32px] p-6 border border-border-muted">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <TrendingUp size={12} className="text-rose-400" /> Tolerance přehled
        </h2>
        <div className="space-y-5">
          {tolerances.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-border-muted">
                    <Activity size={14} style={{ color: item.substance.color || '#00d1ff' }} />
                  </div>
                  <span className="text-xs font-bold text-slate-300">{item.substance.name}</span>
                </div>
                <span className={cn(
                  "text-xs font-black",
                  item.tolerance > 50 ? "text-red-500" : "text-amber-400"
                )}>
                  {item.tolerance.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${item.tolerance}%`,
                    backgroundColor: item.substance.color || '#00d1ff',
                    boxShadow: `0 0 10px ${item.substance.color}40`
                  }}
                />
              </div>
            </div>
          ))}
          {tolerances.length === 0 && (
            <div className="p-8 text-center border border-dashed border-border-muted rounded-2xl">
              <span className="text-xs text-slate-600 font-medium uppercase tracking-widest">Žádná významná tolerance</span>
            </div>
          )}
        </div>
      </section>

      {/* Weekly Activity Chart */}
      <section className="bg-card-bg rounded-[32px] p-6 border border-border-muted">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Calendar size={12} className="text-amber-400" /> Týdenní aktivita (dávky)
        </h2>
        <div className="h-40 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e252e" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0e1217', borderColor: '#1e252e', borderRadius: '12px', fontSize: '10px' }}
              />
              <Area type="monotone" dataKey="count" stroke="#00d1ff" fill="#00d1ff10" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
