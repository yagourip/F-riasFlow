import React, { useState } from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  Sparkles, 
  Calendar, 
  Download, 
  Search, 
  CheckCircle2,
  Building,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { Employee, VacationRequest, Department, CompanyRulesConfig } from '../types';

interface HRDashboardProps {
  employees: Employee[];
  departments: Department[];
  requests: VacationRequest[];
  rules: CompanyRulesConfig;
  onOpenRulesModal: () => void;
  onViewVoucher: (request: VacationRequest) => void;
}

export const HRDashboard: React.FC<HRDashboardProps> = ({
  employees,
  departments,
  requests,
  rules,
  onOpenRulesModal,
  onViewVoucher,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  const today = new Date();

  // Cálculo de Riscos CLT (Art. 137 - Férias Vencidas / Pagamento em Dobro)
  const employeesAtRisk = employees.filter(emp => {
    const limit = new Date(emp.concessionLimitDate);
    const diffDays = Math.ceil((limit.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 90 && emp.balanceDays > 0;
  });

  // Provisão financeira estimada (Saldo de dias * diária + 1/3)
  const totalFinancialProvision = employees.reduce((acc, emp) => {
    const dailyRate = (emp.salary || 0) / 30;
    const baseVacation = dailyRate * emp.balanceDays;
    const constitutionalThird = baseVacation / 3;
    return acc + baseVacation + constitutionalThird;
  }, 0);

  // Taxa de aprovação automática
  const totalDecided = requests.filter(r => r.status === 'auto_approved' || r.status === 'manager_approved');
  const autoApprovedCount = requests.filter(r => r.status === 'auto_approved').length;
  const autoApprovalRate = totalDecided.length > 0 
    ? Math.round((autoApprovedCount / totalDecided.length) * 100) 
    : 100;

  // Filtragem de funcionários
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptFilter === 'all' || emp.departmentId === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const exportCSV = () => {
    const headers = ['Nome', 'Cargo', 'Departamento', 'Saldo (Dias)', 'Dias Usados', 'Limite Concessivo', 'Salário (R$)'];
    const rows = employees.map(e => [
      e.name,
      e.role,
      e.departmentId.toUpperCase(),
      e.balanceDays,
      e.usedDays,
      e.concessionLimitDate,
      e.salary,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_ferias_nexora_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header RH */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-500/30">
            <Building className="w-3.5 h-3.5" />
            <span>Recursos Humanos & Departamento Pessoal • Visão Corporativa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Painel Executivo de Férias & CLT
          </h1>
          <p className="text-purple-200 text-sm max-w-2xl">
            Acompanhamento centralizado do passivo trabalhista de férias, provisões financeiras, riscos de pagamento em dobro (Art. 137 CLT) e eficiência do motor de auto-aprovação.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Relatório CSV</span>
          </button>

          <button
            onClick={onOpenRulesModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-950/40 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Políticas da Empresa</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Estratégicas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Provisão Financeira */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Passivo / Provisão Total</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(totalFinancialProvision)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Férias acumuladas + 1/3 Constitucional
          </div>
        </div>

        {/* Card 2: Taxa de Aprovação Automática */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Taxa Auto-Aprovação</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-700">{autoApprovalRate}%</span>
            <span className="text-xs font-medium text-slate-500">das solicitações</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Tempo médio de aprovação: &lt; 2 segundos
          </div>
        </div>

        {/* Card 3: Risco de Dobra CLT */}
        <div className={`rounded-2xl p-5 border shadow-sm ${
          employeesAtRisk.length > 0
            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
            : 'bg-white border-slate-200/80 text-slate-900'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2">
            <span className={employeesAtRisk.length > 0 ? 'text-rose-800' : 'text-slate-500'}>
              Risco Dobra CLT (&lt;90 dias)
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              employeesAtRisk.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${employeesAtRisk.length > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {employeesAtRisk.length}
            </span>
            <span className="text-xs font-medium">colaborador(es)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-rose-200/60 text-xs">
            Art. 137 CLT: Exige notificação urgente
          </div>
        </div>

        {/* Card 4: Total de Colaboradores */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Quadro Ativo</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{employees.length}</span>
            <span className="text-xs font-medium text-slate-500">em 6 setores</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            100% integrados à política de férias
          </div>
        </div>
      </div>

      {/* Tabela de Colaboradores e Saldos de Férias */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Controle Geral de Períodos Concessivos e Saldos
            </h2>
            <p className="text-xs text-slate-500">
              Gestão de prazos legais, dias usufruídos e prevenção de passivo trabalhista
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar colaborador..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
              />
            </div>

            <select
              value={selectedDeptFilter}
              onChange={e => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos os Setores</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Colaborador</th>
                <th className="px-6 py-3.5">Setor</th>
                <th className="px-6 py-3.5">Saldo Disponível</th>
                <th className="px-6 py-3.5">Usufruídos</th>
                <th className="px-6 py-3.5">Limite Legal de Gozo</th>
                <th className="px-6 py-3.5">Status CLT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map(emp => {
                const limit = new Date(emp.concessionLimitDate);
                const diffDays = Math.ceil((limit.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isRisk = diffDays <= 90 && emp.balanceDays > 0;
                const dept = departments.find(d => d.id === emp.departmentId);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatarUrl}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-slate-400 text-[11px]">{emp.role}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700">
                        {dept?.name || emp.departmentId}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-black text-sm text-slate-900">
                        {emp.balanceDays} dias
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-slate-600 font-medium">
                        {emp.usedDays} dias
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        {formatDate(emp.concessionLimitDate)}
                      </div>
                      <div className={`text-[10px] ${isRisk ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                        {diffDays > 0 ? `Faltam ${diffDays} dias` : 'Vencidas!'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {isRisk ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                          <AlertTriangle className="w-3 h-3" />
                          Risco Dobra CLT
                        </span>
                      ) : emp.balanceDays === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-slate-400" />
                          Saldo Quitado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Em Conformidade
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
