import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  DollarSign, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Employee, VacationRequest, CompanyRulesConfig } from '../types';
import { evaluateVacationRequest } from '../services/vacationEngine';

interface RequestVacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Employee;
  allEmployees: Employee[];
  existingRequests: VacationRequest[];
  rules: CompanyRulesConfig;
  onSubmit: (newRequest: VacationRequest) => Promise<void>;
}

export const RequestVacationModal: React.FC<RequestVacationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allEmployees,
  existingRequests,
  rules,
  onSubmit,
}) => {
  // Configurar data padrão inicial sugerida (ex: 35 dias no futuro para garantir antecedência legal)
  const defaultStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 35);
    // Ajustar se cair em quinta ou sexta ou fds
    while (d.getDay() === 4 || d.getDay() === 5 || d.getDay() === 6 || d.getDay() === 0) {
      d.setDate(d.getDate() + 1);
    }
    return d.toISOString().split('T')[0];
  }, []);

  const defaultEndDate = useMemo(() => {
    const d = new Date(defaultStartDate);
    d.setDate(d.getDate() + 14); // 15 dias de férias por padrão
    return d.toISOString().split('T')[0];
  }, [defaultStartDate]);

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [sellDays, setSellDays] = useState<number>(0);
  const [advanceThirteenth, setAdvanceThirteenth] = useState<boolean>(false);
  const [substituteId, setSubstituteId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Colegas do mesmo departamento disponíveis para cobertura
  const departmentPeers = useMemo(() => {
    return allEmployees.filter(
      e => e.departmentId === currentUser.departmentId && e.id !== currentUser.id
    );
  }, [allEmployees, currentUser]);

  // Avaliação ao vivo das regras pelo motor de aprovação
  const evaluation = useMemo(() => {
    if (!startDate || !endDate) {
      return null;
    }
    return evaluateVacationRequest(
      currentUser,
      startDate,
      endDate,
      sellDays,
      departmentPeers,
      existingRequests,
      rules
    );
  }, [currentUser, startDate, endDate, sellDays, departmentPeers, existingRequests, rules]);

  // Cálculos financeiros estimados
  const daysCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }, [startDate, endDate]);

  const financialEstimate = useMemo(() => {
    const dailySalary = (currentUser.salary || 0) / 30;
    const vacationPay = dailySalary * daysCount;
    const constitutionalThird = vacationPay / 3;
    const abonoPay = dailySalary * sellDays;
    const abonoThird = abonoPay / 3;
    const totalEstimate = vacationPay + constitutionalThird + abonoPay + abonoThird;
    return {
      dailySalary,
      vacationPay,
      constitutionalThird,
      abonoPay: abonoPay + abonoThird,
      totalEstimate,
    };
  }, [currentUser.salary, daysCount, sellDays]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluation || !evaluation.canSubmit) return;

    setIsSubmitting(true);
    try {
      const selectedSub = departmentPeers.find(p => p.id === substituteId);
      const isAutoApproved = evaluation.isEligibleForAutoApproval;
      const status = isAutoApproved ? 'auto_approved' : 'pending_manager';

      const newRequest: VacationRequest = {
        id: 'req_' + Date.now(),
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        employeeRole: currentUser.role,
        departmentId: currentUser.departmentId,
        managerId: currentUser.managerId || 'emp_mgr_ti',
        startDate,
        endDate,
        daysCount,
        sellDays,
        advanceThirteenth,
        substituteEmployeeId: substituteId || undefined,
        substituteName: selectedSub ? selectedSub.name : undefined,
        notes: notes.trim() || undefined,
        status,
        requestedAt: new Date().toISOString(),
        decidedAt: isAutoApproved ? new Date().toISOString() : undefined,
        decidedBy: isAutoApproved ? 'Motor Automatizado FériasFlow' : undefined,
        decisionNotes: isAutoApproved 
          ? 'Aprovado instantaneamente pelo motor automatizado: todos os 5 requisitos CLT e quorum cumpridos.' 
          : 'Enviado para homologação do gestor imediato devido a regras pontuais.',
        autoApprovalScore: evaluation.score,
        automatedChecks: evaluation.checks,
        isAutoApproved,
      };

      await onSubmit(newRequest);

      if (isAutoApproved) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Solicitar Período de Férias</h2>
              <p className="text-xs text-indigo-200">
                Validação de conformidade legal CLT e aprovação automatizada imediata
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Seção 1: Seleção de Datas */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Período de Descanso (CLT Art. 134)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Início das Férias
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  *Não pode iniciar em quinta, sexta, sábado, domingo ou véspera de feriado.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Término
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
                <p className="text-[11px] text-indigo-600 font-semibold mt-1">
                  Total selecionado: <strong>{daysCount} dias corridos</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Seção 2: Abono Pecuniário e 13º Salário */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Benefícios Financeiros Opcionais
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Abono Pecuniário */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Vender Férias (Abono CLT Art. 143)
                  </label>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {sellDays} dias
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={5}
                  value={sellDays}
                  onChange={e => setSellDays(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>0 dias</span>
                  <span>5 dias</span>
                  <span>10 dias (1/3 legal)</span>
                </div>
                {sellDays > 0 && (
                  <p className="text-[11px] text-emerald-700 mt-2 font-medium">
                    + {formatCurrency(financialEstimate.abonoPay)} bruto de abono pecuniário
                  </p>
                )}
              </div>

              {/* 13º Adiantamento */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 mb-1">
                    Adiantamento de 1ª Parcela do 13º
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Solicitar o pagamento de 50% do décimo terceiro junto à remuneração de férias.
                  </p>
                </div>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={advanceThirteenth}
                    onChange={e => setAdvanceThirteenth(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Solicitar 1ª parcela do 13º salário
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Seção 3: Substituto e Handover */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Cobertura de Atividades & Observações
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Colega Designado para Backup (Opcional)
                </label>
                <select
                  value={substituteId}
                  onChange={e => setSubstituteId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione um colega de {currentUser.departmentId.toUpperCase()}...</option>
                  {departmentPeers.map(peer => (
                    <option key={peer.id} value={peer.id}>
                      {peer.name} ({peer.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações para o Gestor
                </label>
                <input
                  type="text"
                  placeholder="Ex: Viagem em família, projetos principais adiantados..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* SIMULADOR AO VIVO DO MOTOR DE APROVAÇÃO (LIVE ENGINE PREVIEW) */}
          {evaluation && (
            <div className={`p-5 rounded-2xl border transition-all ${
              evaluation.isEligibleForAutoApproval
                ? 'bg-emerald-50/70 border-emerald-300'
                : evaluation.canSubmit
                ? 'bg-amber-50/70 border-amber-300'
                : 'bg-rose-50/70 border-rose-300'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {evaluation.isEligibleForAutoApproval ? (
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  ) : evaluation.canSubmit ? (
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {evaluation.isEligibleForAutoApproval
                        ? '✨ Elegível para Aprovação Automatizada Imediata!'
                        : evaluation.canSubmit
                        ? '⏳ Requer Homologação do Gestor Imediato'
                        : '❌ Não é possível submeter com as datas selecionadas'}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {evaluation.isEligibleForAutoApproval
                        ? 'Ao clicar em enviar, suas férias serão aprovadas em menos de 1 segundo pelo motor inteligente!'
                        : evaluation.canSubmit
                        ? 'Sua solicitação será enviada para a fila de decisão direta do gestor com os alertas abaixo.'
                        : 'Corrija os erros legais antes de enviar.'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Score Motor</div>
                  <div className={`text-xl font-extrabold ${
                    evaluation.score >= 90 ? 'text-emerald-700' : evaluation.score >= 60 ? 'text-amber-700' : 'text-rose-700'
                  }`}>
                    {evaluation.score}/100
                  </div>
                </div>
              </div>

              {/* Checklist de Regras */}
              <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-200/60">
                {evaluation.checks.map((check, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : check.isWarningOnly ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span className={check.passed ? 'text-slate-700' : check.isWarningOnly ? 'text-amber-900 font-medium' : 'text-rose-800 font-medium'}>
                      <strong>{check.ruleName}:</strong> {check.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumo Financeiro Estimado */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <div>
              <span>Previsão de Pagamento Férias + 1/3: </span>
              <strong className="text-slate-900 text-sm">
                {formatCurrency(financialEstimate.totalEstimate)}
              </strong>
            </div>
            <span className="text-[11px] text-slate-400">
              *Pagamento legal até 2 dias antes do início do gozo (CLT Art. 145)
            </span>
          </div>

          {/* Footer do Form */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!evaluation?.canSubmit || isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${
                !evaluation?.canSubmit || isSubmitting
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : evaluation?.isEligibleForAutoApproval
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20'
              }`}
            >
              {isSubmitting ? (
                <span>Processando...</span>
              ) : evaluation?.isEligibleForAutoApproval ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submeter & Auto-Aprovar Agora</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Enviar para Gestor Imediato</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
