import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Sparkles,
  Info
} from 'lucide-react';
import { VacationRequest, Employee, Department } from '../types';

interface VacationCalendarProps {
  requests: VacationRequest[];
  employees: Employee[];
  departments: Department[];
  selectedDepartmentId?: string;
}

export const VacationCalendar: React.FC<VacationCalendarProps> = ({
  requests,
  employees,
  departments,
  selectedDepartmentId,
}) => {
  // Mês e Ano atual selecionado para navegação
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 1)); // Outubro 2026

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Dias do mês
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Domingo

  // Filtrar requisições aprovadas do mês
  const approvedRequests = requests.filter(r => {
    if (r.status !== 'auto_approved' && r.status !== 'manager_approved') return false;
    if (selectedDepartmentId && r.departmentId !== selectedDepartmentId) return false;
    return true;
  });

  const calendarDays = [];
  // Dias vazios no início da semana
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Dias do mês
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // Verificar quais pessoas estão de férias em um determinado dia
  const getLeavesOnDay = (day: number) => {
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const targetTime = new Date(targetDateStr).getTime();

    return approvedRequests.filter(req => {
      const start = new Date(req.startDate).getTime();
      const end = new Date(req.endDate).getTime();
      return targetTime >= start && targetTime <= end;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      {/* Header do Calendário */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <span>Radar de Ausências da Equipe</span>
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe visualmente os períodos de férias da equipe para evitar sobreposições operacionais
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 capitalize min-w-[130px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grade do Calendário */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        {/* Dias da semana */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-[11px] font-bold text-slate-600 py-2.5 uppercase tracking-wider">
          <span className="text-rose-500">Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span className="text-indigo-500">Sáb</span>
        </div>

        {/* Células de Dias */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[420px]">
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="bg-slate-50/40 p-2 min-h-[90px]" />;
            }

            const dayLeaves = getLeavesOnDay(day);
            const isWeekend = (idx % 7 === 0) || (idx % 7 === 6);

            return (
              <div
                key={`day-${day}`}
                className={`p-2 min-h-[90px] flex flex-col justify-between transition-colors ${
                  isWeekend ? 'bg-slate-50/60' : 'bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    isWeekend ? 'text-slate-400' : 'text-slate-800'
                  }`}>
                    {day}
                  </span>
                  {dayLeaves.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700">
                      {dayLeaves.length} em férias
                    </span>
                  )}
                </div>

                {/* Tags dos Colaboradores em férias */}
                <div className="space-y-1 mt-1">
                  {dayLeaves.slice(0, 2).map(req => (
                    <div
                      key={req.id}
                      title={`${req.employeeName} (${req.daysCount} dias)`}
                      className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-semibold truncate border border-indigo-200/50 flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0"></span>
                      <span className="truncate">{req.employeeName.split(' ')[0]}</span>
                    </div>
                  ))}
                  {dayLeaves.length > 2 && (
                    <div className="text-[9px] text-slate-500 font-bold pl-1">
                      +{dayLeaves.length - 2} outros
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
