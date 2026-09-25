export type DepartmentId = 'ti' | 'comercial' | 'marketing' | 'financeiro' | 'rh' | 'operacoes';
export type SystemRole = 'employee' | 'manager' | 'hr';

export interface Department {
  id: DepartmentId;
  name: string;
  color: string;
  maxSimultaneousLeavesPercent: number; // ex: 25% do time
  managerId: string;
  managerName: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  systemRole: SystemRole;
  departmentId: DepartmentId;
  managerId: string | null;
  admissionDate: string; // YYYY-MM-DD
  avatarUrl: string;
  balanceDays: number; // Dias restantes para gozo (max 30 por período aquisitivo)
  accruedDays: number; // Dias adquiridos no período atual
  usedDays: number; // Dias já usufruídos
  scheduledDays: number; // Dias já solicitados/aprovados para o futuro
  currentPeriodStart: string; // Início do período aquisitivo
  currentPeriodEnd: string; // Fim do período aquisitivo
  concessionLimitDate: string; // Limite legal para gozo (período concessivo - risco de dobro)
  salary: number;
  password?: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export type VacationStatus = 
  | 'auto_approved' 
  | 'manager_approved' 
  | 'pending_manager' 
  | 'rejected' 
  | 'cancelled';

export interface AutomatedCheckResult {
  ruleName: string;
  passed: boolean;
  message: string;
  isWarningOnly?: boolean;
}

export interface VacationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  departmentId: DepartmentId;
  managerId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  sellDays: number; // Abono pecuniário (0 a 10 dias)
  advanceThirteenth: boolean; // Adiantamento 13º
  substituteEmployeeId?: string; // Substituto nas tarefas
  substituteName?: string;
  notes?: string;
  status: VacationStatus;
  requestedAt: string;
  decidedAt?: string;
  decisionNotes?: string;
  decidedBy?: string;
  autoApprovalScore: number; // 0 to 100
  automatedChecks: AutomatedCheckResult[];
  isAutoApproved: boolean;
}

export interface CompanyRulesConfig {
  minNoticeDays: number; // Antecedência mínima (CLT recomenda 30 dias)
  allowAutoApproval: boolean; // Ativar/desativar aprovação automática
  maxDepartmentAbsencePercent: number; // Máximo permitido de ausência simultânea no setor (ex: 20%)
  enforceCltRules: boolean; // Validar regras de fracionamento e início 2 dias antes de folga
  blackoutPeriods: {
    title: string;
    startDate: string;
    endDate: string;
    departmentId?: DepartmentId;
  }[];
}

export interface AuditLog {
  id: string;
  requestId: string;
  action: 'auto_approval' | 'manager_approval' | 'rejection' | 'created' | 'modified';
  performedBy: string;
  timestamp: string;
  details: string;
}
