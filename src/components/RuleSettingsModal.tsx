import React, { useState } from 'react';
import { X, Settings2, ShieldCheck, Check, Sparkles, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { CompanyRulesConfig } from '../types';

interface RuleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: CompanyRulesConfig;
  onSave: (newRules: CompanyRulesConfig) => void;
}

export const RuleSettingsModal: React.FC<RuleSettingsModalProps> = ({
  isOpen,
  onClose,
  rules,
  onSave,
}) => {
  const [minNoticeDays, setMinNoticeDays] = useState(rules.minNoticeDays);
  const [allowAutoApproval, setAllowAutoApproval] = useState(rules.allowAutoApproval);
  const [maxAbsencePercent, setMaxAbsencePercent] = useState(rules.maxDepartmentAbsencePercent);
  const [enforceCltRules, setEnforceCltRules] = useState(rules.enforceCltRules);
  const [blackouts, setBlackouts] = useState(rules.blackoutPeriods || []);

  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  if (!isOpen) return null;

  const handleAddBlackout = () => {
    if (!newTitle || !newStart || !newEnd) return;
    setBlackouts([...blackouts, { title: newTitle, startDate: newStart, endDate: newEnd }]);
    setNewTitle('');
    setNewStart('');
    setNewEnd('');
  };

  const handleRemoveBlackout = (index: number) => {
    setBlackouts(blackouts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      minNoticeDays,
      allowAutoApproval,
      maxDepartmentAbsencePercent: maxAbsencePercent,
      enforceCltRules,
      blackoutPeriods: blackouts,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Parâmetros do Motor de Aprovação</h2>
              <p className="text-xs text-indigo-200">
                Políticas de governança, conformidade CLT e regras de quorum
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Toggle Principal: Auto Aprovação */}
          <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Aprovação Automatizada Imediata</span>
              </div>
              <p className="text-[11px] text-indigo-900/80 max-w-md">
                Quando ativado, pedidos 100% em conformidade com as regras CLT e de quorum são homologados instantaneamente pelo sistema.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowAutoApproval}
                onChange={e => setAllowAutoApproval(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Antecedência e Capacidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Antecedência Mínima para Auto-Aprovação (Dias)
              </label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="number"
                  min={7}
                  max={60}
                  value={minNoticeDays}
                  onChange={e => setMinNoticeDays(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-500">
                  (CLT Art. 135 recomenda 30 dias)
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Teto de Ausência Simultânea por Setor (%)
              </label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="number"
                  min={10}
                  max={50}
                  step={5}
                  value={maxAbsencePercent}
                  onChange={e => setMaxAbsencePercent(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-500">
                  % máximo da equipe ausente simultaneamente
                </span>
              </div>
            </div>
          </div>

          {/* Validações Legais da CLT */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">
                Bloqueio de Início em Quinta/Sexta/Véspera de Feriado (CLT Art. 134 § 3º)
              </div>
              <p className="text-[11px] text-slate-500">
                Impede início das férias a menos de 2 dias do repouso semanal remunerado (DSR).
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enforceCltRules}
                onChange={e => setEnforceCltRules(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Blackout Periods */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Períodos de Bloqueio Crítico Corporativo (Blackout)
            </h4>

            <div className="space-y-2">
              {blackouts.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{b.title}</span>
                    <span className="text-slate-500 ml-2">({b.startDate} até {b.endDate})</span>
                  </div>
                  <button
                    onClick={() => handleRemoveBlackout(i)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Adicionar Novo Blackout */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Título do evento (ex: Balanço Anual)"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="col-span-2 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={newStart}
                onChange={e => setNewStart(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex gap-1">
                <input
                  type="date"
                  value={newEnd}
                  onChange={e => setNewEnd(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddBlackout}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
