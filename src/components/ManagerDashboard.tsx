import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  DollarSign, 
  ChevronRight,
  Filter,
  FileText
} from 'lucide-react';
import { Employee, VacationRequest, Department, CompanyRulesConfig } from '../types';

interface ManagerDashboardProps {
  currentManager: Employee;
  department: Department;
  allDepartmentEmployees: Employee[];
  requests: VacationRequest[];
  rules: CompanyRulesConfig;
  onDecision: (requestId: string, action: 'approve' | 'reject', notes?: string) => Promise<void>;
  onViewAudit: (request: VacationRequest) => void;
  onViewVoucher: (request: VacationRequest) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  currentManager,
  department,
  allDepartmentEmployees,
  requests,
  rules,
  onDecision,
  onViewAudit,
  onViewVoucher,
}) => {
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<'pending' | 'approved' | 'all'>('pending');

  // Filtrar solicitações pertencentes a liderados diretos ou do departamento
  const deptRequests = requests.filter(r => r.departmentId === department.id);
  const pendingRequests = deptRequests.filter(r => r.status === 'pending_manager');
  const autoApprovedRequests = deptRequests.filter(r => r.status === 'auto_approved');
  const managerApprovedRequests = deptRequests.filter(r => r.status === 'manager_approved');

  const filteredList = deptRequests.filter(r => {
    if (filterTab === 'pending') return r.status === 'pending_manager';
    if (filterTab === 'approved') return r.status === 'auto_approved' || r.status === 'manager_approved';
    return true;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleApprove = async (reqId: string) => {
    setIsProcessing(true);
    try {
      await onDecision(reqId, 'approve');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingRequestId) return;
    setIsProcessing(true);
    try {
      await onDecision(rejectingRequestId, 'reject', rejectReason);
      setRejectingRequestId(null);
      setRejectReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header do Gestor */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Users className="w-3.5 h-3.5" />
              <span>Painel do Gestor Imediato • {department.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Gestão de Férias da Equipe
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              O motor automatizado aprova instantaneamente todas as solicitações em conformidade legal CLT e dentro do limite de capacidade de {department.maxSimultaneousLeavesPercent}% do time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10 text-center">
              <div className="text-2xl font-black text-amber-400">{pendingRequests.length}</div>
              <div className="text-[11px] text-slate-300 font-medium">Requerem Sua Análise</div>
            </div>
            <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10 text-center">
              <div className="text-2xl font-black text-emerald-400">{autoApprovedRequests.length}</div>
              <div className="text-[11px] text-slate-300 font-medium">Auto-Aprovadas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              filterTab === 'pending'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pendentes de Avaliação</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              filterTab === 'pending' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {pendingRequests.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              filterTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Férias Homologadas</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              filterTab === 'approved' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {autoApprovedRequests.length + managerApprovedRequests.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todas ({deptRequests.length})
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Motor Automatizado configurado para tolerância CLT ativa</span>
        </div>
      </div>

      {/* Lista de Solicitações */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="font-bold text-slate-800 text-base">Fila Limpa!</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {filterTab === 'pending'
              ? 'Não há solicitações pendentes de validação manual. O motor automático homologou os pedidos elegíveis.'
              : 'Nenhum registro para a categoria selecionada.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map(req => {
            const isPending = req.status === 'pending_manager';
            const isAuto = req.status === 'auto_approved';
            const employee = allDepartmentEmployees.find(e => e.id === req.employeeId);

            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 shadow-sm ${
                  isPending
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Perfil e Detalhes da Solicitação */}
                  <div className="flex items-start gap-4">
                    <img
                      src={employee?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                      alt={req.employeeName}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">
                          {req.employeeName}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({req.employeeRole})
                        </span>
                        {isAuto && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            Auto-Aprovado pelo Motor
                          </span>
                        )}
                        {req.status === 'manager_approved' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                            <CheckCircle2 className="w-3 h-3 text-teal-600" />
                            Aprovado por Você
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Recusado
                          </span>
                        )}
                      </div>

                      {/* Período Solicitado */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <div className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(req.startDate)} até {formatDate(req.endDate)}</span>
                        </div>
                        <span className="font-semibold text-slate-700">
                          {req.daysCount} dias de férias
                        </span>
                        {req.sellDays > 0 && (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            +{req.sellDays} dias de Abono
                          </span>
                        )}
                        {req.advanceThirteenth && (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                            Adiantamento 13º
                          </span>
                        )}
                      </div>

                      {/* Detalhes de Cobertura / Backup */}
                      <div className="text-xs text-slate-500 pt-1 flex flex-wrap items-center gap-3">
                        {req.substituteName ? (
                          <span>Substituto nas atividades: <strong className="text-slate-800">{req.substituteName}</strong></span>
                        ) : (
                          <span className="text-amber-600">Sem substituto indicado</span>
                        )}
                        {req.notes && (
                          <span>• Motivo: <em className="text-slate-700 font-medium">"{req.notes}"</em></span>
                        )}
                      </div>

                      {/* Alertas do Motor se pendente */}
                      {isPending && (
                        <div className="mt-2 p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Motivo da retenção para sua análise:</span>
                          </div>
                          {req.automatedChecks
                            .filter(c => !c.passed)
                            .map((c, idx) => (
                              <div key={idx} className="pl-5 text-amber-950 font-medium">
                                • {c.message}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações do Gestor */}
                  <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
                    <button
                      onClick={() => onViewAudit(req)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Auditoria</span>
                    </button>

                    {(req.status === 'auto_approved' || req.status === 'manager_approved') && (
                      <button
                        onClick={() => onViewVoucher(req)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Aviso & Recibo</span>
                      </button>
                    )}

                    {isPending && (
                      <>
                        <button
                          onClick={() => setRejectingRequestId(req.id)}
                          disabled={isProcessing}
                          className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Recusar</span>
                        </button>

                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={isProcessing}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aprovar Férias</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação de Recusa */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Recusar Solicitação de Férias</h3>
                <p className="text-xs text-slate-500">Informe a justificativa formal para o colaborador</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Justificativa da Recusa
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Conflito com entrega crítica de projeto ou sobreposição imprevista..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingRequestId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim() || isProcessing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
