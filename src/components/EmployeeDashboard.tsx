import React from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  DollarSign, 
  UserCheck, 
  ArrowRight,
  ShieldCheck,
  XCircle,
  FileCheck
} from 'lucide-react';
import { Employee, VacationRequest, Department } from '../types';

interface EmployeeDashboardProps {
  currentUser: Employee;
  department: Department;
  requests: VacationRequest[];
  onOpenRequestModal: () => void;
  onViewVoucher: (request: VacationRequest) => void;
  onViewAudit: (request: VacationRequest) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  currentUser,
  department,
  requests,
  onOpenRequestModal,
  onViewVoucher,
  onViewAudit,
}) => {
  const userRequests = requests.filter(r => r.employeeId === currentUser.id);

  // Calcular dias restantes até o limite concessivo
  const today = new Date();
  const limitDate = new Date(currentUser.concessionLimitDate);
  const diffTime = limitDate.getTime() - today.getTime();
  const daysUntilLimit = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isCloseToDouble = daysUntilLimit <= 90;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Header com Boas-Vindas e Ação Principal */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-32 -mb-10 w-60 h-60 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Aprovação Automatizada com Gestor Imediato Ativa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Olá, {currentUser.name}! 🌴
            </h1>
            <p className="text-indigo-200/90 text-sm max-w-xl">
              Planeje seu descanso de acordo com a CLT. Solicitações em conformidade com as regras de antecedência e quorum do time recebem <strong className="text-white">aprovação instantânea</strong>!
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-indigo-300">
              <span>Setor: <strong className="text-white">{department.name}</strong></span>
              <span>•</span>
              <span>Gestor Imediato: <strong className="text-white">{department.managerName}</strong></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenRequestModal}
              className="group flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Calendar className="w-4 h-4" />
              <span>Solicitar Férias Agora</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas e Saldos de Férias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Disponível */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Saldo Disponível</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{currentUser.balanceDays}</span>
            <span className="text-sm font-medium text-slate-500">dias</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Direito no período:</span>
            <strong className="text-slate-700">{currentUser.accruedDays} dias</strong>
          </div>
        </div>

        {/* Card 2: Dias já Gozados */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Dias Usufruídos</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{currentUser.usedDays}</span>
            <span className="text-sm font-medium text-slate-500">dias</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Agendados no futuro:</span>
            <strong className="text-indigo-600 font-semibold">{currentUser.scheduledDays} dias</strong>
          </div>
        </div>

        {/* Card 3: Período Aquisitivo */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Período Aquisitivo</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-800">
            {formatDate(currentUser.currentPeriodStart)} até {formatDate(currentUser.currentPeriodEnd)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            12 meses completos trabalhados
          </div>
        </div>

        {/* Card 4: Limite Legal Concessivo */}
        <div className={`rounded-2xl p-5 border shadow-sm ${
          isCloseToDouble
            ? 'bg-amber-50/60 border-amber-200 text-amber-900'
            : 'bg-white border-slate-200/80 text-slate-900'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2">
            <span className={isCloseToDouble ? 'text-amber-800' : 'text-slate-500'}>
              Limite Legal de Gozo
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isCloseToDouble ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
            }`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold">
            {formatDate(currentUser.concessionLimitDate)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200/50 text-xs flex items-center justify-between">
            <span>Prazo restante:</span>
            <strong className={isCloseToDouble ? 'text-amber-800 font-bold' : 'text-slate-700'}>
              {daysUntilLimit} dias
            </strong>
          </div>
        </div>
      </div>

      {/* Regras CLT em Pílulas Didáticas */}
      <div className="bg-slate-100/80 rounded-2xl p-4 sm:p-5 border border-slate-200 text-xs text-slate-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 font-semibold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Regras Essenciais CLT (Art. 134 e 143):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto text-[11px]">
          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/60">
            <strong>Fracionamento:</strong> Até 3 períodos (um ≥ 14 dias e demais ≥ 5 dias)
          </div>
          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/60">
            <strong>Início das Férias:</strong> Proibido iniciar em quinta, sexta ou véspera de feriado
          </div>
          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/60">
            <strong>Abono Pecuniário:</strong> Venda de até 1/3 das férias (máx 10 dias) com +1/3 constitucional
          </div>
        </div>
      </div>

      {/* Tabela de Solicitações do Colaborador */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Minhas Solicitações de Férias
            </h2>
            <p className="text-xs text-slate-500">
              Histórico e acompanhamento das aprovações automáticas e do gestor imediato
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {userRequests.length} registros
          </span>
        </div>

        {userRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="font-semibold text-slate-700">Nenhuma solicitação encontrada</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Você ainda não agendou suas férias neste período aquisitivo. Clique no botão acima para planejar seu descanso!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {userRequests.map(req => {
              const isApproved = req.status === 'auto_approved' || req.status === 'manager_approved';
              return (
                <div key={req.id} className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Informações Principais */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {formatDate(req.startDate)} até {formatDate(req.endDate)}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {req.daysCount} dias de descanso
                      </span>
                      {req.sellDays > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Abono: +{req.sellDays} dias vendidos
                        </span>
                      )}
                      {req.advanceThirteenth && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                          13º Adiantado
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>Solicitado em: {new Date(req.requestedAt).toLocaleDateString('pt-BR')}</span>
                      {req.substituteName && (
                        <span>Substituto: <strong className="text-slate-700">{req.substituteName}</strong></span>
                      )}
                      {req.notes && (
                        <span className="italic truncate max-w-md">"{req.notes}"</span>
                      )}
                    </div>
                  </div>

                  {/* Status & Ações */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Badge de Status */}
                    {req.status === 'auto_approved' && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Aprovado Automaticamente</span>
                      </div>
                    )}

                    {req.status === 'manager_approved' && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-100 text-teal-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Aprovado pelo Gestor</span>
                      </div>
                    )}

                    {req.status === 'pending_manager' && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Aguardando Gestor Imediato</span>
                      </div>
                    )}

                    {req.status === 'rejected' && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Recusado pelo Gestor</span>
                      </div>
                    )}

                    {/* Botão de Auditoria */}
                    <button
                      onClick={() => onViewAudit(req)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Checagens Motor</span>
                    </button>

                    {/* Botão de Aviso/Recibo Oficial de Férias */}
                    {isApproved && (
                      <button
                        onClick={() => onViewVoucher(req)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Aviso & Recibo CLT</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
