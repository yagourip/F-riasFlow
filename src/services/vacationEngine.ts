import { Employee, VacationRequest, CompanyRulesConfig, AutomatedCheckResult } from '../types';

// Feriados Nacionais Brasileiros fixos para verificação de véspera (CLT Art. 134 § 3º)
const BRAZILIAN_FIXED_HOLIDAYS = [
  '01-01', // Confraternização Universal
  '04-21', // Tiradentes
  '05-01', // Dia do Trabalho
  '09-07', // Independência do Brasil
  '10-12', // Nossa Senhora Aparecida
  '11-02', // Finados
  '11-15', // Proclamação da República
  '11-20', // Consciência Negra
  '12-25', // Natal
];

export interface ValidationSummary {
  canSubmit: boolean;
  isEligibleForAutoApproval: boolean;
  score: number;
  checks: AutomatedCheckResult[];
  blockingErrors: string[];
}

export function calculateDateDifferenceInDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
}

export function getNoticeDays(startDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  const diffTime = start.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isDateNearDsrOrHoliday(dateStr: string): { isForbidden: boolean; reason?: string } {
  const date = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, 4 = Quinta, 5 = Sexta, 6 = Sábado

  // CLT Art. 134 § 3º: É vedado o início das férias no período de dois dias que antecede feriado ou DSR
  // Para DSR no Domingo: Quinta-feira e Sexta-feira são proibidas se o descanso for no fim de semana
  if (dayOfWeek === 4) {
    return {
      isForbidden: true,
      reason: 'Início em quinta-feira: A CLT veda início de férias a menos de 2 dias do repouso semanal remunerado (DSR).',
    };
  }
  if (dayOfWeek === 5) {
    return {
      isForbidden: true,
      reason: 'Início em sexta-feira: A CLT veda início de férias na véspera do repouso semanal remunerado (DSR).',
    };
  }
  if (dayOfWeek === 6 || dayOfWeek === 0) {
    return {
      isForbidden: true,
      reason: 'Início em sábado ou domingo: Início de férias deve ser em dia útil regular de trabalho.',
    };
  }

  // Verificar se o dia seguinte ou depois é feriado nacional
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayStr = `${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;

  const dayAfterNext = new Date(date);
  dayAfterNext.setDate(dayAfterNext.getDate() + 2);
  const dayAfterNextStr = `${String(dayAfterNext.getMonth() + 1).padStart(2, '0')}-${String(dayAfterNext.getDate()).padStart(2, '0')}`;

  if (BRAZILIAN_FIXED_HOLIDAYS.includes(nextDayStr) || BRAZILIAN_FIXED_HOLIDAYS.includes(dayAfterNextStr)) {
    return {
      isForbidden: true,
      reason: 'A data antecede um feriado nacional em menos de 2 dias (CLT Art. 134 § 3º).',
    };
  }

  return { isForbidden: false };
}

export function evaluateVacationRequest(
  employee: Employee,
  startDate: string,
  endDate: string,
  sellDays: number,
  allEmployeesInDept: Employee[],
  existingApprovedRequests: VacationRequest[],
  rules: CompanyRulesConfig
): ValidationSummary {
  const checks: AutomatedCheckResult[] = [];
  const blockingErrors: string[] = [];
  let score = 100;

  const daysCount = calculateDateDifferenceInDays(startDate, endDate);
  const totalDaysNeeded = daysCount + sellDays;
  const noticeDays = getNoticeDays(startDate);

  // 1. Verificação de Saldo de Férias
  if (totalDaysNeeded <= 0) {
    blockingErrors.push('Datas inválidas: a data de término deve ser posterior à data de início.');
    checks.push({
      ruleName: 'Período Selecionado',
      passed: false,
      message: 'A data de término deve ser posterior à de início.',
    });
  } else if (totalDaysNeeded > employee.balanceDays) {
    blockingErrors.push(`Saldo insuficiente: Você solicitou ${totalDaysNeeded} dias (${daysCount} de férias + ${sellDays} de abono), mas possui apenas ${employee.balanceDays} dias disponíveis.`);
    checks.push({
      ruleName: 'Saldo de Férias',
      passed: false,
      message: `Solicitado: ${totalDaysNeeded} dias | Saldo disponível: ${employee.balanceDays} dias.`,
    });
    score -= 50;
  } else {
    checks.push({
      ruleName: 'Saldo de Férias',
      passed: true,
      message: `Saldo suficiente: restará ${employee.balanceDays - totalDaysNeeded} dias no período aquisitivo.`,
    });
  }

  // 2. Abono Pecuniário (Venda de Férias - Art. 143 da CLT)
  if (sellDays > 0) {
    if (sellDays > 10) {
      blockingErrors.push('Abono pecuniário inválido: a CLT permite a conversão de no máximo 1/3 das férias (10 dias).');
      checks.push({
        ruleName: 'Abono Pecuniário (Art. 143 CLT)',
        passed: false,
        message: 'Máximo legal de abono é de 10 dias.',
      });
      score -= 20;
    } else {
      checks.push({
        ruleName: 'Abono Pecuniário (Art. 143 CLT)',
        passed: true,
        message: `Conversão de ${sellDays} dias em abono pecuniário está dentro do limite de 1/3.`,
      });
    }
  }

  // 3. Regras de Fracionamento da CLT (Art. 134 § 1º)
  if (rules.enforceCltRules) {
    if (daysCount < 5) {
      blockingErrors.push('A CLT não permite períodos de férias inferiores a 5 dias corridos.');
      checks.push({
        ruleName: 'Duração Mínima CLT (Art. 134)',
        passed: false,
        message: 'Períodos de férias devem ter no mínimo 5 dias corridos.',
      });
      score -= 30;
    } else {
      checks.push({
        ruleName: 'Duração Mínima CLT (Art. 134)',
        passed: true,
        message: `Período de ${daysCount} dias atende ao mínimo legal de 5 dias.`,
      });
    }

    // Início antes de DSR / Feriado
    const dsrCheck = isDateNearDsrOrHoliday(startDate);
    if (dsrCheck.isForbidden) {
      blockingErrors.push(dsrCheck.reason!);
      checks.push({
        ruleName: 'Início Legal (Art. 134 § 3º CLT)',
        passed: false,
        message: dsrCheck.reason!,
      });
      score -= 30;
    } else {
      checks.push({
        ruleName: 'Início Legal (Art. 134 § 3º CLT)',
        passed: true,
        message: 'Início em dia útil e sem proximidade proibida com DSR/feriados.',
      });
    }
  }

  // 4. Antecedência Mínima
  if (noticeDays < 0) {
    blockingErrors.push('Data de início no passado não é permitida.');
  } else if (noticeDays < 7) {
    blockingErrors.push('Antecedência mínima operacional não cumprida (mínimo de 7 dias úteis).');
    checks.push({
      ruleName: 'Antecedência Mínima',
      passed: false,
      message: `Solicitado com apenas ${noticeDays} dias de antecedência.`,
    });
    score -= 40;
  } else if (noticeDays < rules.minNoticeDays) {
    // Não bloqueia totalmente, mas exige aprovação manual do gestor
    checks.push({
      ruleName: 'Antecedência Recomendada (30 dias)',
      passed: false,
      isWarningOnly: true,
      message: `Solicitado com ${noticeDays} dias de antecedência (política padrão: ${rules.minNoticeDays} dias). Exigirá anuência do gestor.`,
    });
    score -= 15;
  } else {
    checks.push({
      ruleName: 'Antecedência Mínima',
      passed: true,
      message: `Solicitado com ${noticeDays} dias de antecedência (atende ao critério de ${rules.minNoticeDays} dias).`,
    });
  }

  // 5. Capacidade do Departamento e Ausências Concorrentes
  const reqStart = new Date(startDate).getTime();
  const reqEnd = new Date(endDate).getTime();

  // Filtrar outros colaboradores do mesmo time com férias aprovadas nesse período
  const overlappingLeaves = existingApprovedRequests.filter(req => {
    if (req.employeeId === employee.id) return false;
    if (req.departmentId !== employee.departmentId) return false;
    if (req.status !== 'auto_approved' && req.status !== 'manager_approved') return false;

    const otherStart = new Date(req.startDate).getTime();
    const otherEnd = new Date(req.endDate).getTime();

    // Há sobreposição se não termina antes nem começa depois
    return !(reqEnd < otherStart || reqStart > otherEnd);
  });

  const totalDeptMembers = Math.max(allEmployeesInDept.length, 1);
  const concurrentCount = overlappingLeaves.length;
  const projectedAbsencePercent = Math.round(((concurrentCount + 1) / totalDeptMembers) * 100);

  if (projectedAbsencePercent > rules.maxDepartmentAbsencePercent && concurrentCount >= 1) {
    checks.push({
      ruleName: 'Capacidade do Setor (Quorum)',
      passed: false,
      isWarningOnly: true,
      message: `Atenção: ${concurrentCount} colega(s) (${overlappingLeaves.map(r => r.employeeName).join(', ')}) já têm férias aprovadas nessas datas. Ausência atingirá ${projectedAbsencePercent}% do setor.`,
    });
    score -= 25;
  } else {
    checks.push({
      ruleName: 'Capacidade do Setor (Quorum)',
      passed: true,
      message: `Capacidade garantida: ausência estimada de ${projectedAbsencePercent}% do time (limite: ${rules.maxDepartmentAbsencePercent}%).`,
    });
  }

  // 6. Período Crítico / Blackout
  const hasBlackoutConflict = rules.blackoutPeriods.some(bp => {
    if (bp.departmentId && bp.departmentId !== employee.departmentId) return false;
    const bpStart = new Date(bp.startDate).getTime();
    const bpEnd = new Date(bp.endDate).getTime();
    return !(reqEnd < bpStart || reqStart > bpEnd);
  });

  if (hasBlackoutConflict) {
    const conflictPeriod = rules.blackoutPeriods.find(bp => {
      if (bp.departmentId && bp.departmentId !== employee.departmentId) return false;
      const bpStart = new Date(bp.startDate).getTime();
      const bpEnd = new Date(bp.endDate).getTime();
      return !(reqEnd < bpStart || reqStart > bpEnd);
    });

    checks.push({
      ruleName: 'Período Crítico da Empresa',
      passed: false,
      isWarningOnly: true,
      message: `Coincide com período de alta demanda: "${conflictPeriod?.title}". Requer aprovação direta do gestor.`,
    });
    score -= 30;
  } else {
    checks.push({
      ruleName: 'Período Crítico da Empresa',
      passed: true,
      message: 'Nenhum bloqueio ou evento corporativo crítico no período.',
    });
  }

  // Regra final de elegibilidade para aprovação automática
  const canSubmit = blockingErrors.length === 0;
  const isEligibleForAutoApproval = 
    rules.allowAutoApproval && 
    canSubmit && 
    score >= 90 && 
    checks.every(c => c.passed || c.isWarningOnly === false);

  return {
    canSubmit,
    isEligibleForAutoApproval: isEligibleForAutoApproval && checks.filter(c => !c.passed).length === 0,
    score: Math.max(score, 0),
    checks,
    blockingErrors,
  };
}
