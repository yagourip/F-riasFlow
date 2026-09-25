import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, Clock, Calendar } from 'lucide-react';
import { VacationRequest } from '../types';

interface AuditDetailsModalProps {
  request: VacationRequest | null;
  onClose: () => void;
}

export const AuditDetailsModal: React.FC<AuditDetailsModalProps> = ({ request, onClose }) => {
  if (!request) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Relatório de Auditoria do Motor</h2>
              <p className="text-xs text-indigo-200">
                Checagens de conformidade legal CLT e quorum de equipe
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

        <div className="p-6 space-y-6">
          {/* Card Resumo do Status */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Resultado da Análise</div>
              <div className="text-base font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                {request.status === 'auto_approved' ? (
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Auto-Aprovado pelo Motor
                  </span>
                ) : request.status === 'manager_approved' ? (
                  <span className="text-teal-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    Aprovado pelo Gestor
                  </span>
                ) : request.status === 'pending_manager' ? (
                  <span className="text-amber-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Aguardando Decisão do Gestor
                  </span>
                ) : (
                  <span className="text-rose-700">Recusado</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score do Motor</div>
              <div className="text-2xl font-black text-indigo-700">
                {request.autoApprovalScore}/100
              </div>
            </div>
          </div>

          {/* Dados do Pedido */}
          <div className="text-xs text-slate-600 space-y-1">
            <div><strong>Colaborador:</strong> {request.employeeName} ({request.employeeRole})</div>
            <div><strong>Período:</strong> {formatDate(request.startDate)} até {formatDate(request.endDate)} ({request.daysCount} dias)</div>
            {request.decisionNotes && (
              <div className="pt-2 text-slate-800 bg-slate-100 p-2.5 rounded-xl border border-slate-200/80">
                <strong>Log de Decisão:</strong> {request.decisionNotes}
              </div>
            )}
          </div>

          {/* Critérios Auditados */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Regras Avaliadas na Submissão:
            </h4>
            <div className="space-y-2">
              {request.automatedChecks.map((chk, i) => (
                <div key={i} className="p-3 rounded-xl border flex items-start gap-2.5 text-xs bg-white">
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : chk.isWarningOnly ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-slate-800">{chk.ruleName}</div>
                    <div className="text-slate-600 mt-0.5">{chk.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
            >
              Fechar Auditoria
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
