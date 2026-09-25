import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Palmtree } from 'lucide-react';
import { VacationRequest, Employee, Department } from '../types';

interface VacationVoucherModalProps {
  request: VacationRequest | null;
  employee?: Employee;
  department?: Department;
  onClose: () => void;
}

export const VacationVoucherModal: React.FC<VacationVoucherModalProps> = ({
  request,
  employee,
  department,
  onClose,
}) => {
  if (!request) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const salary = employee?.salary || 8500;
  const dailyRate = salary / 30;
  const vacationPay = dailyRate * request.daysCount;
  const constitutionalThird = vacationPay / 3;
  const abonoPay = dailyRate * request.sellDays;
  const abonoThird = abonoPay / 3;
  const thirteenthAdvance = request.advanceThirteenth ? salary / 2 : 0;
  const totalGross = vacationPay + constitutionalThird + abonoPay + abonoThird + thirteenthAdvance;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 print:shadow-none print:border-none print:rounded-none">
        {/* Header - Não impresso */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Aviso & Recibo Oficial de Férias (CLT)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Documento Formal */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-800 text-xs leading-relaxed print:p-6 print:text-black">
          {/* Cabeçalho da Empresa */}
          <div className="flex items-start justify-between border-b pb-4 border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Palmtree className="w-5 h-5 text-indigo-600" />
                <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                  NEXORA TECNOLOGIA E SERVIÇOS DIGITAIS LTDA.
                </h1>
              </div>
              <p className="text-slate-500 text-[11px]">
                CNPJ: 18.234.567/0001-89 • Inscrição Estadual: 114.567.890.112
              </p>
              <p className="text-slate-500 text-[11px]">
                Avenida Paulista, 1000, 14º Andar - Bela Vista, São Paulo - SP
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-md text-[10px] uppercase">
                {request.status === 'auto_approved' ? 'Homologação Automatizada' : 'Homologação pelo Gestor'}
              </span>
              <div className="text-[10px] text-slate-400 mt-1">
                Protocolo: {request.id}
              </div>
            </div>
          </div>

          {/* Título do Documento */}
          <div className="text-center space-y-1">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              AVISO PRÉVIO E RECIBO DE PAGAMENTO DE FÉRIAS
            </h2>
            <p className="text-[11px] text-slate-500 italic">
              Em cumprimento ao disposto nos Artigos 135 e 145 da Consolidação das Leis do Trabalho (CLT)
            </p>
          </div>

          {/* Dados do Empregado */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-slate-500">Colaborador:</span>
              <div className="font-bold text-slate-900 text-xs">{request.employeeName}</div>
            </div>
            <div>
              <span className="text-slate-500">Cargo / Função:</span>
              <div className="font-bold text-slate-900 text-xs">{request.employeeRole}</div>
            </div>
            <div>
              <span className="text-slate-500">Departamento / Setor:</span>
              <div className="font-bold text-slate-900 text-xs">{department?.name || request.departmentId.toUpperCase()}</div>
            </div>
            <div>
              <span className="text-slate-500">Gestor Imediato Responsável:</span>
              <div className="font-bold text-slate-900 text-xs">{department?.managerName || 'Gestor Imediato'}</div>
            </div>
          </div>

          {/* Período de Concessão */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              1. Discriminação do Período de Gozo
            </div>
            <p className="text-slate-700">
              Comunicamos-lhe que, nos termos da legislação vigente, suas férias serão concedidas de <strong>{formatDate(request.startDate)}</strong> a <strong>{formatDate(request.endDate)}</strong>, perfazendo um total de <strong>{request.daysCount} dias corridos</strong> de descanso remunerado.
            </p>
            {request.sellDays > 0 && (
              <p className="text-slate-700">
                Foi deferido o <strong>Abono Pecuniário</strong> de <strong>{request.sellDays} dias</strong> nos termos do Art. 143 da CLT.
              </p>
            )}
            {request.substituteName && (
              <p className="text-slate-600 italic">
                *Cobertura e handover operacional alinhados com o colega: <strong>{request.substituteName}</strong>.
              </p>
            )}
          </div>

          {/* Demonstrativo Financeiro */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 text-xs uppercase tracking-wider">
              2. Demonstrativo de Proventos e Cálculos
            </div>
            <div className="p-4 space-y-2 divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span>Remuneração de Férias ({request.daysCount} dias)</span>
                <span className="font-semibold">{formatCurrency(vacationPay)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>1/3 Constitucional sobre as Férias (Art. 7º, XVII CF/88)</span>
                <span className="font-semibold">{formatCurrency(constitutionalThird)}</span>
              </div>
              {request.sellDays > 0 && (
                <>
                  <div className="flex justify-between py-1 text-emerald-800">
                    <span>Abono Pecuniário ({request.sellDays} dias de saldo convertido)</span>
                    <span className="font-semibold">{formatCurrency(abonoPay)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-emerald-800">
                    <span>1/3 Constitucional sobre o Abono</span>
                    <span className="font-semibold">{formatCurrency(abonoThird)}</span>
                  </div>
                </>
              )}
              {request.advanceThirteenth && (
                <div className="flex justify-between py-1 text-indigo-800">
                  <span>Adiantamento da 1ª Parcela do 13º Salário (50%)</span>
                  <span className="font-semibold">{formatCurrency(thirteenthAdvance)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 pt-3 font-extrabold text-sm text-slate-900 border-t-2 border-slate-300">
                <span>Total Bruto da Remuneração:</span>
                <span className="text-indigo-700">{formatCurrency(totalGross)}</span>
              </div>
            </div>
          </div>

          {/* Termo de Ciência e Quitação */}
          <div className="space-y-4 pt-4">
            <p className="text-[11px] text-slate-600">
              Declaro estar ciente do período de gozo de férias fixado acima e que a remuneração com os respectivos adicionais legais será disponibilizada até 2 (dois) dias antes do início do respectivo período, conforme Art. 145 da CLT.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-[11px]">
              <div className="border-t border-slate-400 pt-2">
                <div className="font-bold text-slate-900">{request.employeeName}</div>
                <div className="text-slate-500">Colaborador(a) / Assinatura Digital</div>
                <div className="text-[10px] text-slate-400 mt-1">Data: {new Date(request.requestedAt).toLocaleDateString('pt-BR')}</div>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <div className="font-bold text-slate-900">{department?.managerName || 'Gestão Imediata'}</div>
                <div className="text-slate-500">Gestor Imediato / Nexora Tech</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Homologado eletronicamente em {request.decidedAt ? new Date(request.decidedAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
