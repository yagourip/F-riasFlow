import React from 'react';
import { 
  Palmtree, 
  Settings2, 
  UserCheck, 
  Users, 
  ShieldCheck, 
  ChevronDown,
  LogOut,
  Database
} from 'lucide-react';
import { Employee, SystemRole } from '../types';

interface NavbarProps {
  currentRole: SystemRole;
  currentUser: Employee;
  onOpenSupabaseModal: () => void;
  onOpenRulesModal: () => void;
  onLogout: () => void;
  isSupabaseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentUser,
  onOpenSupabaseModal,
  onOpenRulesModal,
  onLogout,
  isSupabaseConnected,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Palmtree className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Férias<span className="text-indigo-600">Flow</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Auto-Approval CLT
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Gestão Corporativa & Aprovação Automatizada
              </p>
            </div>
          </div>

          {/* Badge Oficial do Cargo Atual do Usuário Conectado */}
          <div className="flex items-center gap-2">
            {currentRole === 'employee' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-sm">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Cargo: Colaborador</span>
              </div>
            )}
            {currentRole === 'manager' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-sm">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Cargo: Gestor Imediato</span>
              </div>
            )}
            {currentRole === 'hr' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-800 text-xs font-bold shadow-sm">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Cargo: Gente & RH</span>
              </div>
            )}
          </div>

          {/* Ações da direita: Regras, Perfil & Logout */}
          <div className="flex items-center gap-3">
            {/* Regras do Motor */}
            <button
              onClick={onOpenRulesModal}
              title="Regras do Motor de Aprovação Automatizada"
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* Perfil do Usuário Ativo */}
            <div className="relative group">
              <div className="flex items-center gap-2.5 pl-2 py-1 cursor-pointer">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-200"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Dropdown do perfil */}
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 hidden group-hover:block transition-all z-40">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <img
                    src={currentUser.avatarUrl}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-indigo-600 font-semibold truncate">{currentUser.role}</div>
                    <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                  </div>
                </div>

                <div className="pt-2.5 space-y-1">
                  <button
                    onClick={onOpenSupabaseModal}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span>Configurar Banco (Supabase)</span>
                  </button>

                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair da Conta (Logout)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Botão Rápido de Sair */}
            <button
              onClick={onLogout}
              title="Sair do sistema (Logout)"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
