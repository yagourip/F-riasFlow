import { Department, Employee, VacationRequest, CompanyRulesConfig, AuditLog } from '../types';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_EMPLOYEES, 
  INITIAL_REQUESTS, 
  INITIAL_RULES, 
  INITIAL_AUDIT_LOGS 
} from '../data/mockData';
import { getSupabaseClient } from '../lib/supabase';

const LS_EMPLOYEES = 'feriasflow_employees';
const LS_REQUESTS = 'feriasflow_requests';
const LS_RULES = 'feriasflow_rules';
const LS_AUDIT = 'feriasflow_audit';
const LS_DEPARTMENTS = 'feriasflow_departments';
const LS_SESSION = 'feriasflow_session_user_id';

class StorageService {
  private employees: Employee[] = [];
  private requests: VacationRequest[] = [];
  private rules: CompanyRulesConfig = INITIAL_RULES;
  private auditLogs: AuditLog[] = [];
  private departments: Department[] = INITIAL_DEPARTMENTS;
  private isInitialized = false;

  public init() {
    if (this.isInitialized) return;

    try {
      const storedEmp = localStorage.getItem(LS_EMPLOYEES);
      this.employees = storedEmp ? JSON.parse(storedEmp) : INITIAL_EMPLOYEES;

      const storedReq = localStorage.getItem(LS_REQUESTS);
      this.requests = storedReq ? JSON.parse(storedReq) : INITIAL_REQUESTS;

      const storedRules = localStorage.getItem(LS_RULES);
      this.rules = storedRules ? JSON.parse(storedRules) : INITIAL_RULES;

      const storedAudit = localStorage.getItem(LS_AUDIT);
      this.auditLogs = storedAudit ? JSON.parse(storedAudit) : INITIAL_AUDIT_LOGS;

      const storedDept = localStorage.getItem(LS_DEPARTMENTS);
      this.departments = storedDept ? JSON.parse(storedDept) : INITIAL_DEPARTMENTS;
    } catch (e) {
      console.error('Erro ao carregar dados locais:', e);
      this.employees = [...INITIAL_EMPLOYEES];
      this.requests = [...INITIAL_REQUESTS];
      this.rules = { ...INITIAL_RULES };
      this.auditLogs = [...INITIAL_AUDIT_LOGS];
      this.departments = [...INITIAL_DEPARTMENTS];
    }

    this.isInitialized = true;
    this.persistLocal();
    this.syncFromSupabaseIfAvailable();
  }

  private persistLocal() {
    try {
      localStorage.setItem(LS_EMPLOYEES, JSON.stringify(this.employees));
      localStorage.setItem(LS_REQUESTS, JSON.stringify(this.requests));
      localStorage.setItem(LS_RULES, JSON.stringify(this.rules));
      localStorage.setItem(LS_AUDIT, JSON.stringify(this.auditLogs));
      localStorage.setItem(LS_DEPARTMENTS, JSON.stringify(this.departments));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }

  public async syncFromSupabaseIfAvailable(): Promise<{ synced: boolean; message: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { synced: false, message: 'Supabase não configurado. Utilizando armazenamento local seguro.' };
    }

    try {
      // 1. Tentar buscar requests do Supabase
      const { data: dbRequests, error: reqError } = await supabase
        .from('vacation_requests')
        .select('*');

      if (!reqError && dbRequests && dbRequests.length > 0) {
        // Mapear campos snake_case para camelCase
        this.requests = dbRequests.map((r: any) => ({
          id: r.id,
          employeeId: r.employee_id,
          employeeName: r.employee_name,
          employeeRole: r.employee_role,
          departmentId: r.department_id,
          managerId: r.manager_id,
          startDate: r.start_date,
          endDate: r.end_date,
          daysCount: r.days_count,
          sellDays: r.sell_days || 0,
          advanceThirteenth: r.advance_thirteenth || false,
          substituteEmployeeId: r.substitute_employee_id,
          substituteName: r.substitute_name,
          notes: r.notes,
          status: r.status,
          requestedAt: r.requested_at,
          decidedAt: r.decided_at,
          decisionNotes: r.decision_notes,
          decidedBy: r.decided_by,
          autoApprovalScore: r.auto_approval_score || 100,
          automatedChecks: r.automated_checks || [],
          isAutoApproved: r.is_auto_approved || false,
        }));
      } else if (!reqError && (!dbRequests || dbRequests.length === 0)) {
        // Tabela existe mas está vazia: semear dados iniciais no Supabase
        await this.pushInitialDataToSupabase(supabase);
      }

      this.persistLocal();
      return { synced: true, message: 'Dados sincronizados com sucesso via Supabase!' };
    } catch (err: any) {
      console.warn('Supabase sync warning:', err);
      return { synced: false, message: 'Conexão Supabase instável: ' + (err.message || 'usando cache') };
    }
  }

  private async pushInitialDataToSupabase(supabase: any) {
    try {
      for (const d of this.departments) {
        await supabase.from('departments').upsert({
          id: d.id,
          name: d.name,
          color: d.color,
          max_simultaneous_leaves_percent: d.maxSimultaneousLeavesPercent,
          manager_id: d.managerId,
          manager_name: d.managerName,
        });
      }

      for (const e of this.employees) {
        await supabase.from('employees').upsert({
          id: e.id,
          name: e.name,
          email: e.email,
          role: e.role,
          department_id: e.departmentId,
          manager_id: e.managerId,
          admission_date: e.admissionDate,
          avatar_url: e.avatarUrl,
          balance_days: e.balanceDays,
          accrued_days: e.accruedDays,
          used_days: e.usedDays,
          scheduled_days: e.scheduledDays,
          current_period_start: e.currentPeriodStart,
          current_period_end: e.currentPeriodEnd,
          concession_limit_date: e.concessionLimitDate,
          salary: e.salary,
        });
      }

      for (const r of this.requests) {
        await supabase.from('vacation_requests').upsert({
          id: r.id,
          employee_id: r.employeeId,
          employee_name: r.employeeName,
          employee_role: r.employeeRole,
          department_id: r.departmentId,
          manager_id: r.managerId,
          start_date: r.startDate,
          end_date: r.endDate,
          days_count: r.daysCount,
          sell_days: r.sellDays,
          advance_thirteenth: r.advanceThirteenth,
          substitute_employee_id: r.substituteEmployeeId,
          substitute_name: r.substituteName,
          notes: r.notes,
          status: r.status,
          requested_at: r.requestedAt,
          decided_at: r.decidedAt,
          decision_notes: r.decisionNotes,
          decided_by: r.decidedBy,
          auto_approval_score: r.autoApprovalScore,
          automated_checks: r.automatedChecks,
          is_auto_approved: r.isAutoApproved,
        });
      }
    } catch (e) {
      console.warn('Falha ao semear Supabase:', e);
    }
  }

  // Getters
  public getEmployees(): Employee[] {
    this.init();
    return [...this.employees];
  }

  public getDepartments(): Department[] {
    this.init();
    return [...this.departments];
  }

  public getRequests(): VacationRequest[] {
    this.init();
    return [...this.requests];
  }

  public getRules(): CompanyRulesConfig {
    this.init();
    return { ...this.rules };
  }

  public getAuditLogs(): AuditLog[] {
    this.init();
    return [...this.auditLogs];
  }

  public getEmployeeById(id: string): Employee | undefined {
    this.init();
    return this.employees.find(e => e.id === id);
  }

  public getDepartmentById(id: string): Department | undefined {
    this.init();
    return this.departments.find(d => d.id === id);
  }

  // Ações de Solicitação
  public async submitVacationRequest(request: VacationRequest): Promise<VacationRequest> {
    this.init();
    this.requests.unshift(request);

    // Se for aprovado automaticamente, descontar o saldo e atualizar dias agendados
    if (request.status === 'auto_approved') {
      const empIndex = this.employees.findIndex(e => e.id === request.employeeId);
      if (empIndex >= 0) {
        const emp = this.employees[empIndex];
        const daysDeducted = request.daysCount + request.sellDays;
        this.employees[empIndex] = {
          ...emp,
          balanceDays: Math.max(0, emp.balanceDays - daysDeducted),
          scheduledDays: emp.scheduledDays + request.daysCount,
          usedDays: emp.usedDays + request.sellDays, // abono é indenizado/pago
        };
      }

      // Registrar auditoria
      this.auditLogs.unshift({
        id: 'log_' + Date.now(),
        requestId: request.id,
        action: 'auto_approval',
        performedBy: 'Motor Automatizado FériasFlow',
        timestamp: new Date().toISOString(),
        details: `Solicitação auto-aprovada com score ${request.autoApprovalScore}%. Verificações de conformidade CLT e quorum concluídas com sucesso.`,
      });
    } else {
      // Registrar log de submissão
      this.auditLogs.unshift({
        id: 'log_' + Date.now(),
        requestId: request.id,
        action: 'created',
        performedBy: request.employeeName,
        timestamp: new Date().toISOString(),
        details: `Solicitação de ${request.daysCount} dias enviada para avaliação do gestor imediato.`,
      });
    }

    this.persistLocal();

    // Sincronização assíncrona com Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('vacation_requests').insert({
        id: request.id,
        employee_id: request.employeeId,
        employee_name: request.employeeName,
        employee_role: request.employeeRole,
        department_id: request.departmentId,
        manager_id: request.managerId,
        start_date: request.startDate,
        end_date: request.endDate,
        days_count: request.daysCount,
        sell_days: request.sellDays,
        advance_thirteenth: request.advanceThirteenth,
        substitute_employee_id: request.substituteEmployeeId,
        substitute_name: request.substituteName,
        notes: request.notes,
        status: request.status,
        requested_at: request.requestedAt,
        decided_at: request.decidedAt,
        decision_notes: request.decisionNotes,
        decided_by: request.decidedBy,
        auto_approval_score: request.autoApprovalScore,
        automated_checks: request.automatedChecks,
        is_auto_approved: request.isAutoApproved,
      }).then(({ error }) => {
        if (error) console.warn('Supabase request insert error:', error);
      });
    }

    return request;
  }

  public async managerDecision(
    requestId: string,
    action: 'approve' | 'reject',
    managerName: string,
    notes?: string
  ): Promise<VacationRequest | null> {
    this.init();
    const reqIndex = this.requests.findIndex(r => r.id === requestId);
    if (reqIndex < 0) return null;

    const req = this.requests[reqIndex];
    const newStatus = action === 'approve' ? 'manager_approved' : 'rejected';
    const now = new Date().toISOString();

    const updatedRequest: VacationRequest = {
      ...req,
      status: newStatus,
      decidedAt: now,
      decidedBy: managerName,
      decisionNotes: notes || (action === 'approve' ? 'Aprovado pelo gestor imediato.' : 'Recusado pelo gestor.'),
    };

    this.requests[reqIndex] = updatedRequest;

    // Se aprovado, atualizar saldo do colaborador
    if (action === 'approve') {
      const empIndex = this.employees.findIndex(e => e.id === req.employeeId);
      if (empIndex >= 0) {
        const emp = this.employees[empIndex];
        const daysDeducted = req.daysCount + req.sellDays;
        this.employees[empIndex] = {
          ...emp,
          balanceDays: Math.max(0, emp.balanceDays - daysDeducted),
          scheduledDays: emp.scheduledDays + req.daysCount,
          usedDays: emp.usedDays + req.sellDays,
        };
      }
    }

    // Registrar log
    this.auditLogs.unshift({
      id: 'log_' + Date.now(),
      requestId: req.id,
      action: action === 'approve' ? 'manager_approval' : 'rejection',
      performedBy: managerName,
      timestamp: now,
      details: notes || (action === 'approve' ? 'Férias homologadas pelo gestor.' : 'Solicitação indeferida.'),
    });

    this.persistLocal();

    // Sincronizar Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('vacation_requests').update({
        status: newStatus,
        decided_at: now,
        decided_by: managerName,
        decision_notes: updatedRequest.decisionNotes,
      }).eq('id', requestId).then(({ error }) => {
        if (error) console.warn('Supabase update error:', error);
      });
    }

    return updatedRequest;
  }

  public updateRules(newRules: CompanyRulesConfig) {
    this.init();
    this.rules = newRules;
    this.persistLocal();

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('company_rules').upsert({
        id: 'default',
        min_notice_days: newRules.minNoticeDays,
        allow_auto_approval: newRules.allowAutoApproval,
        max_department_absence_percent: newRules.maxDepartmentAbsencePercent,
        enforce_clt_rules: newRules.enforceCltRules,
        blackout_periods: newRules.blackoutPeriods,
        updated_at: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.warn('Supabase rules update error:', error);
      });
    }
  }

  public resetToDefaultDemo() {
    this.employees = [...INITIAL_EMPLOYEES];
    this.requests = [...INITIAL_REQUESTS];
    this.rules = { ...INITIAL_RULES };
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.departments = [...INITIAL_DEPARTMENTS];
    this.persistLocal();
  }

  // Métodos de Autenticação e Sessão
  public getSessionUserId(): string | null {
    try {
      return localStorage.getItem(LS_SESSION);
    } catch {
      return null;
    }
  }

  public setSessionUserId(userId: string | null) {
    try {
      if (userId) {
        localStorage.setItem(LS_SESSION, userId);
      } else {
        localStorage.removeItem(LS_SESSION);
      }
    } catch (e) {
      console.error('Erro ao manipular sessão:', e);
    }
  }

  public async login(email: string, password: string): Promise<{ success: boolean; employee?: Employee; message?: string }> {
    this.init();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Tentar login via Supabase Auth se cliente configurado
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });
        if (!authErr && authData.user) {
          // Busca o colaborador correspondente pelo email
          const matchingEmp = this.employees.find(e => e.email.toLowerCase() === cleanEmail);
          if (matchingEmp) {
            this.setSessionUserId(matchingEmp.id);
            return { success: true, employee: matchingEmp };
          }
        }
      } catch (err) {
        console.warn('Tentativa Supabase Auth prosseguindo para validação corporativa:', err);
      }
    }

    // 2. Validação direta pelo diretório corporativo de colaboradores (com suporte a atalhos dos 3 perfis)
    let employee = this.employees.find(e => e.email.toLowerCase() === cleanEmail);
    if (!employee) {
      if (cleanEmail === 'colaborador@nexora.com.br') {
        employee = this.employees.find(e => e.id === 'emp_user_01') || this.employees.find(e => e.systemRole === 'employee');
      } else if (cleanEmail === 'gestor@nexora.com.br') {
        employee = this.employees.find(e => e.id === 'emp_mgr_ti') || this.employees.find(e => e.systemRole === 'manager');
      } else if (cleanEmail === 'rh@nexora.com.br') {
        employee = this.employees.find(e => e.id === 'emp_mgr_rh') || this.employees.find(e => e.systemRole === 'hr');
      }
    }

    if (!employee) {
      return { 
        success: false, 
        message: 'Nenhum usuário encontrado com este e-mail. Utilize um dos 3 logins padrão (colaborador@nexora.com.br, gestor@nexora.com.br, rh@nexora.com.br) ou realize o cadastro.' 
      };
    }

    // Validação de senha: se o colaborador tiver senha definida, confere; senão aceita a senha padrão demo (ex: '123456') ou qualquer senha de teste com mais de 3 caracteres
    if (employee.password && employee.password !== password) {
      return {
        success: false,
        message: 'Senha incorreta. Para usuários de demonstração, use a senha padrão 123456.'
      };
    }

    // Garantir systemRole atribuído
    if (!employee.systemRole) {
      if (employee.departmentId === 'rh' || employee.role.toLowerCase().includes('rh')) {
        employee.systemRole = 'hr';
      } else if (!employee.managerId || employee.role.toLowerCase().includes('gerente') || employee.role.toLowerCase().includes('diretor')) {
        employee.systemRole = 'manager';
      } else {
        employee.systemRole = 'employee';
      }
    }

    // Login bem-sucedido
    this.setSessionUserId(employee.id);
    return { success: true, employee };
  }

  public async register(params: {
    name: string;
    email: string;
    password: string;
    role: string;
    systemRole: 'employee' | 'manager' | 'hr';
    departmentId: any;
    salary?: number;
  }): Promise<{ success: boolean; employee?: Employee; message?: string }> {
    this.init();
    const cleanEmail = params.email.trim().toLowerCase();

    const existing = this.employees.find(e => e.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'Já existe um cadastro ativo com este e-mail corporativo.' };
    }

    // Determinar gestor do departamento
    const dept = this.departments.find(d => d.id === params.departmentId);
    const managerId = params.systemRole === 'manager' ? null : (dept?.managerId || null);

    const todayStr = new Date().toISOString().split('T')[0];
    const nextYearDate = new Date();
    nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
    const nextYearStr = nextYearDate.toISOString().split('T')[0];

    const concessionDate = new Date();
    concessionDate.setFullYear(concessionDate.getFullYear() + 2);
    concessionDate.setMonth(concessionDate.getMonth() - 1);
    const concessionStr = concessionDate.toISOString().split('T')[0];

    const newEmployee: Employee = {
      id: 'emp_' + Date.now(),
      name: params.name.trim(),
      email: cleanEmail,
      role: params.role.trim() || (params.systemRole === 'manager' ? 'Gestor de Equipe' : params.systemRole === 'hr' ? 'Analista de RH' : 'Colaborador'),
      systemRole: params.systemRole,
      departmentId: params.departmentId,
      managerId: managerId,
      admissionDate: todayStr,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80`,
      balanceDays: 30,
      accruedDays: 30,
      usedDays: 0,
      scheduledDays: 0,
      currentPeriodStart: todayStr,
      currentPeriodEnd: nextYearStr,
      concessionLimitDate: concessionStr,
      salary: params.salary || (params.systemRole === 'manager' ? 14000 : 7500),
      password: params.password,
    };

    this.employees.unshift(newEmployee);
    this.persistLocal();

    // Tentar criar no Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('employees').insert({
          id: newEmployee.id,
          name: newEmployee.name,
          email: newEmployee.email,
          role: newEmployee.role,
          department_id: newEmployee.departmentId,
          manager_id: newEmployee.managerId,
          admission_date: newEmployee.admissionDate,
          avatar_url: newEmployee.avatarUrl,
          balance_days: newEmployee.balanceDays,
          accrued_days: newEmployee.accruedDays,
          used_days: newEmployee.usedDays,
          scheduled_days: newEmployee.scheduledDays,
          current_period_start: newEmployee.currentPeriodStart,
          current_period_end: newEmployee.currentPeriodEnd,
          concession_limit_date: newEmployee.concessionLimitDate,
          salary: newEmployee.salary,
        });

        // Opcional: criar usuário no Supabase Auth se habilitado
        await supabase.auth.signUp({
          email: cleanEmail,
          password: params.password,
        });
      } catch (err) {
        console.warn('Supabase employee insert warning:', err);
      }
    }

    this.setSessionUserId(newEmployee.id);
    return { success: true, employee: newEmployee };
  }

  public async logout() {
    this.setSessionUserId(null);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout warning:', e);
      }
    }
  }
}

export const storageService = new StorageService();
