import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { HRDashboard } from './components/HRDashboard';
import { VacationCalendar } from './components/VacationCalendar';
import { RequestVacationModal } from './components/RequestVacationModal';
import { SupabaseModal } from './components/SupabaseModal';
import { RuleSettingsModal } from './components/RuleSettingsModal';
import { VacationVoucherModal } from './components/VacationVoucherModal';
import { AuditDetailsModal } from './components/AuditDetailsModal';
import { LoginScreen } from './components/LoginScreen';
import { storageService } from './services/storageService';
import { Employee, VacationRequest, CompanyRulesConfig, Department, DepartmentId } from './types';
import { Calendar, LayoutDashboard, ShieldCheck, Sparkles, Check, Database, RefreshCw } from 'lucide-react';
import { getSupabaseCredentials } from './lib/supabase';

export default function App() {
  const [currentRole, setCurrentRole] = useState<'employee' | 'manager' | 'hr'>('employee');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rules, setRules] = useState<CompanyRulesConfig>(storageService.getRules());

  // Autenticação e Usuário ativo no sistema
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>('emp_user_01');

  // Sub-abas (Visão Geral vs Calendário)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar'>('dashboard');

  // Modais
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [voucherRequest, setVoucherRequest] = useState<VacationRequest | null>(null);
  const [auditRequest, setAuditRequest] = useState<VacationRequest | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Status Supabase
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Inicialização do Storage e Verificação de Sessão
  useEffect(() => {
    storageService.init();
    refreshLocalData();

    // Checar se há usuário autenticado salvo
    const sessionUserId = storageService.getSessionUserId();
    if (sessionUserId) {
      const allEmps = storageService.getEmployees();
      const existingUser = allEmps.find(e => e.id === sessionUserId);
      if (existingUser) {
        setCurrentUserId(existingUser.id);
        setIsAuthenticated(true);
        if (existingUser.departmentId === 'rh' || existingUser.role.toLowerCase().includes('rh')) {
          setCurrentRole('hr');
        } else if (!existingUser.managerId || existingUser.role.toLowerCase().includes('gerente') || existingUser.role.toLowerCase().includes('diretor')) {
          setCurrentRole('manager');
        } else {
          setCurrentRole('employee');
        }
      }
    }

    const creds = getSupabaseCredentials();
    if (creds.url && creds.key) {
      setIsSupabaseConnected(true);
      storageService.syncFromSupabaseIfAvailable().then(res => {
        if (res.synced) {
          refreshLocalData();
        }
      });
    }
  }, []);

  const refreshLocalData = () => {
    setEmployees(storageService.getEmployees());
    setRequests(storageService.getRequests());
    setDepartments(storageService.getDepartments());
    setRules(storageService.getRules());
  };

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Funções de Autenticação
  const handleLogin = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const res = await storageService.login(email, pass);
    if (res.success && res.employee) {
      setCurrentUserId(res.employee.id);
      setIsAuthenticated(true);
      if (res.employee.departmentId === 'rh' || res.employee.role.toLowerCase().includes('rh')) {
        setCurrentRole('hr');
      } else if (!res.employee.managerId || res.employee.role.toLowerCase().includes('gerente') || res.employee.role.toLowerCase().includes('diretor')) {
        setCurrentRole('manager');
      } else {
        setCurrentRole('employee');
      }
      refreshLocalData();
      showToast(`Bem-vindo, ${res.employee.name.split(' ')[0]}!`, 'success');
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  const handleRegister = async (params: {
    name: string;
    email: string;
    password: string;
    role: string;
    departmentId: DepartmentId;
    salary?: number;
  }): Promise<{ success: boolean; message?: string }> => {
    const res = await storageService.register(params);
    if (res.success && res.employee) {
      setCurrentUserId(res.employee.id);
      setIsAuthenticated(true);
      setCurrentRole('employee');
      refreshLocalData();
      showToast(`Conta criada com sucesso! Olá, ${res.employee.name}!`, 'success');
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  const handleLogout = async () => {
    await storageService.logout();
    setIsAuthenticated(false);
    showToast('Você saiu do sistema com segurança.', 'info');
  };

  // Atualizar papel e selecionar usuário padrão do perfil
  const handleRoleChange = (role: 'employee' | 'manager' | 'hr') => {
    setCurrentRole(role);
    if (role === 'employee') {
      setCurrentUserId('emp_user_01'); // Lucas (Colaborador)
    } else if (role === 'manager') {
      setCurrentUserId('emp_mgr_ti'); // Carlos (Gestor de TI)
    } else if (role === 'hr') {
      setCurrentUserId('emp_mgr_rh'); // Juliana (RH)
    }
  };

  const currentUser = useMemo(() => {
    return employees.find(e => e.id === currentUserId) || employees[0] || {
      id: 'emp_user_01',
      name: 'Lucas Ferreira da Silva',
      email: 'lucas.silva@nexora.com.br',
      role: 'Engenheiro de Software Pleno',
      departmentId: 'ti',
      managerId: 'emp_mgr_ti',
      admissionDate: '2023-04-10',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      balanceDays: 20,
      accruedDays: 30,
      usedDays: 10,
      scheduledDays: 0,
      currentPeriodStart: '2025-04-10',
      currentPeriodEnd: '2026-04-09',
      concessionLimitDate: '2027-03-09',
      salary: 8500,
    };
  }, [employees, currentUserId]);

  const currentDepartment = useMemo(() => {
    return departments.find(d => d.id === currentUser.departmentId) || departments[0] || {
      id: 'ti',
      name: 'Tecnologia & Engenharia',
      color: 'indigo',
      maxSimultaneousLeavesPercent: 20,
      managerId: 'emp_mgr_ti',
      managerName: 'Carlos Mendonça',
    };
  }, [departments, currentUser]);

  // Colegas do departamento
  const allDepartmentEmployees = useMemo(() => {
    return employees.filter(e => e.departmentId === currentDepartment.id);
  }, [employees, currentDepartment]);

  // Submeter nova solicitação
  const handleSubmitRequest = async (newRequest: VacationRequest) => {
    await storageService.submitVacationRequest(newRequest);
    refreshLocalData();

    if (newRequest.status === 'auto_approved') {
      showToast('🎉 Férias APROVADAS AUTOMATICAMENTE pelo motor inteligente!', 'success');
    } else {
      showToast('📬 Solicitação enviada com sucesso para homologação do gestor imediato.', 'info');
    }
  };

  // Decisão do Gestor Imediato
  const handleManagerDecision = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    await storageService.managerDecision(requestId, action, currentUser.name, notes);
    refreshLocalData();

    if (action === 'approve') {
      showToast('✅ Férias homologadas com sucesso!', 'success');
    } else {
      showToast('Solicitação de férias recusada.', 'info');
    }
  };

  // Salvar Regras
  const handleSaveRules = (newRules: CompanyRulesConfig) => {
    storageService.updateRules(newRules);
    setRules(newRules);
    showToast('⚙️ Regras do motor de aprovação atualizadas com sucesso!', 'success');
  };

  // Sincronizar com Supabase
  const handleSupabaseSync = async () => {
    const res = await storageService.syncFromSupabaseIfAvailable();
    refreshLocalData();
    setIsSupabaseConnected(res.synced);
    showToast(res.message, res.synced ? 'success' : 'info');
  };

  // Se não estiver autenticado, exibe a tela corporativa de Login
  if (!isAuthenticated) {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-6 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}>
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        <LoginScreen
          onLogin={handleLogin}
          onRegister={handleRegister}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          isSupabaseConnected={isSupabaseConnected}
        />

        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          onSync={handleSupabaseSync}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        currentUser={currentUser}
        allEmployees={employees}
        onSelectUser={u => setCurrentUserId(u.id)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        onLogout={handleLogout}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}>
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Barra Secundária de Abas: Dashboard vs Calendário */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>
                {currentRole === 'employee' ? 'Meu Painel de Férias' : currentRole === 'manager' ? 'Fila do Gestor' : 'Visão Geral RH'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Radar da Equipe & Calendário</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Motor de Auto-Aprovação Ativo (CLT Art. 134/135)</span>
          </div>
        </div>

        {/* Exibição condicional da tela selecionada */}
        {activeTab === 'calendar' ? (
          <VacationCalendar
            requests={requests}
            employees={employees}
            departments={departments}
            selectedDepartmentId={currentRole === 'hr' ? undefined : currentDepartment.id}
          />
        ) : (
          <>
            {currentRole === 'employee' && (
              <EmployeeDashboard
                currentUser={currentUser}
                department={currentDepartment}
                requests={requests}
                onOpenRequestModal={() => setIsRequestModalOpen(true)}
                onViewVoucher={req => setVoucherRequest(req)}
                onViewAudit={req => setAuditRequest(req)}
              />
            )}

            {currentRole === 'manager' && (
              <ManagerDashboard
                currentManager={currentUser}
                department={currentDepartment}
                allDepartmentEmployees={allDepartmentEmployees}
                requests={requests}
                rules={rules}
                onDecision={handleManagerDecision}
                onViewAudit={req => setAuditRequest(req)}
                onViewVoucher={req => setVoucherRequest(req)}
              />
            )}

            {currentRole === 'hr' && (
              <HRDashboard
                employees={employees}
                departments={departments}
                requests={requests}
                rules={rules}
                onOpenRulesModal={() => setIsRulesModalOpen(true)}
                onViewVoucher={req => setVoucherRequest(req)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">FériasFlow</span>
            <span>•</span>
            <span>Sistema Corporativo de Gestão e Aprovação Automatizada de Férias</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Conformidade CLT Art. 134 e 143</span>
            <span>•</span>
            <span>Ambiente Corporativo</span>
          </div>
        </div>
      </footer>

      {/* Ícone pequeno e discreto no canto para o Supabase */}
      <button
        type="button"
        onClick={() => setIsSupabaseModalOpen(true)}
        title={isSupabaseConnected ? "Supabase Conectado" : "Configurações do Banco Supabase"}
        className="fixed bottom-3 right-3 z-30 p-2 rounded-xl bg-white/80 hover:bg-white text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-200/80 backdrop-blur-sm transition-all hover:scale-105"
      >
        <Database className="w-3.5 h-3.5" />
        <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
          isSupabaseConnected ? 'bg-emerald-500' : 'bg-slate-300'
        }`} />
      </button>

      {/* Modais de Fluxo */}
      <RequestVacationModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        currentUser={currentUser}
        allEmployees={employees}
        existingRequests={requests}
        rules={rules}
        onSubmit={handleSubmitRequest}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onSync={handleSupabaseSync}
      />

      <RuleSettingsModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={rules}
        onSave={handleSaveRules}
      />

      <VacationVoucherModal
        request={voucherRequest}
        employee={employees.find(e => e.id === voucherRequest?.employeeId)}
        department={departments.find(d => d.id === voucherRequest?.departmentId)}
        onClose={() => setVoucherRequest(null)}
      />

      <AuditDetailsModal
        request={auditRequest}
        onClose={() => setAuditRequest(null)}
      />
    </div>
  );
}
