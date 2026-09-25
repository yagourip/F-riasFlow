import React, { useState } from 'react';
import { 
  Palmtree, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  UserCheck, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Database,
  AlertCircle,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { DepartmentId, SystemRole } from '../types';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  onRegister: (params: {
    name: string;
    email: string;
    password: string;
    role: string;
    systemRole: SystemRole;
    departmentId: DepartmentId;
    salary?: number;
  }) => Promise<{ success: boolean; message?: string }>;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
}

interface RoleConfig {
  id: SystemRole;
  title: string;
  badge: string;
  defaultEmail: string;
  defaultName: string;
  defaultJobTitle: string;
  department: string;
  avatar: string;
  icon: React.ElementType;
  description: string;
  bgGradient: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  btnGradient: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onRegister,
  onOpenSupabaseModal,
  isSupabaseConnected,
}) => {
  // Configuração dos 3 Cargos Separados
  const roles: RoleConfig[] = [
    {
      id: 'employee',
      title: 'Colaborador',
      badge: 'Solicitante',
      defaultEmail: 'colaborador@nexora.com.br',
      defaultName: 'Lucas Ferreira da Silva',
      defaultJobTitle: 'Engenheiro de Software Pleno',
      department: 'Tecnologia & TI',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      icon: UserCheck,
      description: 'Solicitar férias, acompanhar saldo CLT, simular pagamento e emitir recibos.',
      bgGradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
      borderColor: 'border-indigo-400',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-800',
      btnGradient: 'from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500',
    },
    {
      id: 'manager',
      title: 'Gestor Imediato',
      badge: 'Aprovador de Equipe',
      defaultEmail: 'gestor@nexora.com.br',
      defaultName: 'Carlos Mendonça',
      defaultJobTitle: 'Gerente de Engenharia & TI',
      department: 'Tecnologia & TI',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80',
      icon: Users,
      description: 'Avaliar solicitações da equipe imediata, aprovar ou recusar férias e gerir quorum.',
      bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      borderColor: 'border-emerald-400',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      btnGradient: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
    },
    {
      id: 'hr',
      title: 'Gente & RH',
      badge: 'Governança & DP',
      defaultEmail: 'rh@nexora.com.br',
      defaultName: 'Juliana Pires',
      defaultJobTitle: 'Gerente de Recursos Humanos',
      department: 'Gente & Gestão',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
      icon: ShieldCheck,
      description: 'Painel executivo, controle de passivo/dobra CLT, provisões e regras de auto-aprovação.',
      bgGradient: 'from-purple-500/10 via-pink-500/5 to-transparent',
      borderColor: 'border-purple-400',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      btnGradient: 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500',
    },
  ];

  const [selectedRole, setSelectedRole] = useState<SystemRole>('employee');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Campos do formulário
  const currentRoleConfig = roles.find(r => r.id === selectedRole) || roles[0];
  const [email, setEmail] = useState<string>(currentRoleConfig.defaultEmail);
  const [password, setPassword] = useState<string>('123456');

  // Campos de Cadastro
  const [regRoleCategory, setRegRoleCategory] = useState<SystemRole>('employee');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('123456');
  const [regJobTitle, setRegJobTitle] = useState('');
  const [regDepartment, setRegDepartment] = useState<DepartmentId>('ti');
  const [regSalary, setRegSalary] = useState('7500');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Trocar cargo selecionado
  const handleSelectRole = (roleId: SystemRole) => {
    setSelectedRole(roleId);
    const target = roles.find(r => r.id === roleId);
    if (target) {
      setEmail(target.defaultEmail);
      setPassword('123456');
    }
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await onLogin(email, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Erro ao realizar login. Verifique suas credenciais.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectQuickLogin = async (roleId: SystemRole) => {
    const target = roles.find(r => r.id === roleId);
    if (!target) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await onLogin(target.defaultEmail, '123456');
      if (!res.success) {
        setErrorMessage(res.message || 'Erro ao autenticar cargo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await onRegister({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regJobTitle || (regRoleCategory === 'manager' ? 'Gestor de Equipe' : regRoleCategory === 'hr' ? 'Analista de RH' : 'Colaborador'),
        systemRole: regRoleCategory,
        departmentId: regDepartment,
        salary: Number(regSalary) || 7500,
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Falha ao registrar novo acesso.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Luzes de ambientação */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-3xl z-10 space-y-6">
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-xl shadow-indigo-500/25 ring-4 ring-white/10 mb-1">
            <Palmtree className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Férias<span className="text-indigo-400">Flow</span>
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 font-medium max-w-md mx-auto">
            Acesso Individual e Separado por Cargo: Colaborador, Gestor Imediato e Gente & RH
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100/90 overflow-hidden">
          {/* Alternador Entrar vs Criar Novo Cargo */}
          <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5">
            <button
              onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-2xl transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Entrar por Cargo (Logins Individuais)
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-2xl transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Cadastrar Novo Usuário em um Cargo
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Mensagem de Erro */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {activeTab === 'login' ? (
              <div className="space-y-6">
                {/* 1. SELETOR DOS 3 CARGOS INDIVIDUAIS */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      1. Escolha o Cargo para Acessar:
                    </span>
                    <span className="text-[11px] text-indigo-600 font-semibold">
                      3 Perfis Independentes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {roles.map(r => {
                      const Icon = r.icon;
                      const isSelected = selectedRole === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => handleSelectRole(r.id)}
                          className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all text-left flex flex-col justify-between ${
                            isSelected
                              ? `${r.borderColor} bg-gradient-to-b ${r.bgGradient} shadow-md ring-2 ring-indigo-200/50`
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.badgeBg} ${r.badgeText}`}>
                                {r.badge}
                              </span>
                            </div>

                            <div className="font-extrabold text-sm text-slate-900">
                              {r.title}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                              {r.description}
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {r.defaultEmail.split('@')[0]}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. FORMULÁRIO DO CARGO SELECIONADO */}
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80">
                    <img
                      src={currentRoleConfig.avatar}
                      alt={currentRoleConfig.defaultName}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-200 shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Credenciais de Login: <span className="text-indigo-600">{currentRoleConfig.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {currentRoleConfig.defaultName} • {currentRoleConfig.defaultJobTitle}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        E-mail de Login do {currentRoleConfig.title}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Senha
                        </label>
                        <span className="text-[11px] text-slate-400">Padrão demo: 123456</span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${currentRoleConfig.btnGradient} disabled:opacity-50`}
                      >
                        {isLoading ? (
                          <span>Entrando no painel...</span>
                        ) : (
                          <>
                            <span>Entrar como {currentRoleConfig.title}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDirectQuickLogin(selectedRole)}
                        disabled={isLoading}
                        className="w-full sm:w-auto shrink-0 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Entrar com 1 Clique</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              /* ABA DE CADASTRO COM SELEÇÃO DO CARGO */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    1. Selecione o Cargo que deseja atribuir:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {roles.map(r => (
                      <label
                        key={r.id}
                        onClick={() => setRegRoleCategory(r.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                          regRoleCategory === r.id
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold shadow-sm'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="regRole"
                          checked={regRoleCategory === r.id}
                          onChange={() => setRegRoleCategory(r.id)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="text-xs">
                          <div>{r.title}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{r.badge}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Gabriela Castro"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      E-mail Corporativo
                    </label>
                    <input
                      type="email"
                      placeholder="gabriela.castro@nexora.com.br"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Departamento
                    </label>
                    <select
                      value={regDepartment}
                      onChange={e => setRegDepartment(e.target.value as DepartmentId)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option value="ti">Tecnologia & TI</option>
                      <option value="comercial">Comercial & Vendas</option>
                      <option value="marketing">Marketing & Growth</option>
                      <option value="financeiro">Financeiro</option>
                      <option value="rh">Gente & Gestão (RH)</option>
                      <option value="operacoes">Operações</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cargo / Função no Contrato
                    </label>
                    <input
                      type="text"
                      placeholder={regRoleCategory === 'manager' ? 'Gerente / Coordenador' : regRoleCategory === 'hr' ? 'Analista de RH' : 'Analista / Engenheiro'}
                      value={regJobTitle}
                      onChange={e => setRegJobTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Senha de Acesso
                  </label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Cadastrando novo acesso...</span>
                  ) : (
                    <>
                      <span>Criar Conta de {roles.find(r => r.id === regRoleCategory)?.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Rodapé informativo discreto */}
        <div className="text-center text-xs text-indigo-300/60 font-medium">
          Sistema Corporativo de Gestão de Férias • Conformidade CLT Art. 134 e 143
        </div>
      </div>

      {/* Ícone pequeno e discreto no canto para o Supabase */}
      <button
        type="button"
        onClick={onOpenSupabaseModal}
        title={isSupabaseConnected ? "Supabase Conectado" : "Configurações do Banco Supabase"}
        className="fixed bottom-3 right-3 z-30 p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-500 hover:text-emerald-400 border border-slate-700/40 backdrop-blur-sm transition-all hover:scale-105"
      >
        <Database className="w-3.5 h-3.5" />
        <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
          isSupabaseConnected ? 'bg-emerald-400' : 'bg-slate-600'
        }`} />
      </button>
    </div>
  );
};
