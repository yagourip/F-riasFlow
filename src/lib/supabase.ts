import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'feriasflow_supabase_url';
const STORAGE_KEY_KEY = 'feriasflow_supabase_key';

export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const storedKey = localStorage.getItem(STORAGE_KEY_KEY) || '';

  return {
    url: storedUrl || envUrl,
    key: storedKey || envKey,
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (key) localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEY_KEY);
  
  // Reset client instance
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  try {
    cachedClient = createClient(url, key);
    return cachedClient;
  } catch (err) {
    console.warn('Erro ao inicializar cliente Supabase:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url, key);
    // Tenta uma consulta rápida ou verificação de autenticação
    const { error } = await testClient.from('vacation_requests').select('id').limit(1);
    
    // Se a tabela não existir ainda, mas a resposta de autorização for válida, consideramos conectado ao projeto
    if (error && error.code === '42P01') {
      return { 
        success: true, 
        message: 'Conectado com sucesso ao Supabase! (Aviso: execute o script SQL abaixo para criar as tabelas)' 
      };
    }

    if (error && (error.code === 'PGRST301' || error.message.includes('JWT') || error.message.includes('API key'))) {
      return { success: false, message: 'Chave Anon ou URL inválida: ' + error.message };
    }

    return { success: true, message: 'Conexão com Supabase estabelecida e tabelas acessíveis!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Falha ao conectar ao Supabase' };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- SCHEMA DO BANCO DE DADOS SUPABASE PARA FÉRIASFLOW (EMPRESA DE MÉDIO PORTE)
-- Copie e cole este script no SQL Editor do seu projeto Supabase:

-- 1. Tabela de Departamentos
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  max_simultaneous_leaves_percent INT DEFAULT 20,
  manager_id TEXT,
  manager_name TEXT
);

-- 2. Tabela de Funcionários
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  department_id TEXT REFERENCES departments(id),
  manager_id TEXT,
  admission_date DATE NOT NULL,
  avatar_url TEXT,
  balance_days INT DEFAULT 30,
  accrued_days INT DEFAULT 30,
  used_days INT DEFAULT 0,
  scheduled_days INT DEFAULT 0,
  current_period_start DATE,
  current_period_end DATE,
  concession_limit_date DATE,
  salary NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Solicitações de Férias
CREATE TABLE IF NOT EXISTS vacation_requests (
  id TEXT PRIMARY KEY,
  employee_id TEXT REFERENCES employees(id),
  employee_name TEXT NOT NULL,
  employee_role TEXT NOT NULL,
  department_id TEXT REFERENCES departments(id),
  manager_id TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INT NOT NULL,
  sell_days INT DEFAULT 0,
  advance_thirteenth BOOLEAN DEFAULT FALSE,
  substitute_employee_id TEXT,
  substitute_name TEXT,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('auto_approved', 'manager_approved', 'pending_manager', 'rejected', 'cancelled')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  decided_at TIMESTAMP WITH TIME ZONE,
  decision_notes TEXT,
  decided_by TEXT,
  auto_approval_score INT DEFAULT 100,
  automated_checks JSONB,
  is_auto_approved BOOLEAN DEFAULT FALSE
);

-- 4. Tabela de Regras Globais de Aprovação
CREATE TABLE IF NOT EXISTS company_rules (
  id TEXT PRIMARY KEY DEFAULT 'default',
  min_notice_days INT DEFAULT 30,
  allow_auto_approval BOOLEAN DEFAULT TRUE,
  max_department_absence_percent INT DEFAULT 20,
  enforce_clt_rules BOOLEAN DEFAULT TRUE,
  blackout_periods JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Logs de Auditoria de Decisões
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  request_id TEXT REFERENCES vacation_requests(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details TEXT
);

-- Ativação de RLS (Row Level Security) básica
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Público para Demonstração/Chave Anon
CREATE POLICY "Permitir leitura anon" ON departments FOR SELECT USING (true);
CREATE POLICY "Permitir modificação anon" ON departments FOR ALL USING (true);

CREATE POLICY "Permitir leitura anon employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Permitir modificação anon employees" ON employees FOR ALL USING (true);

CREATE POLICY "Permitir leitura anon vacation_requests" ON vacation_requests FOR SELECT USING (true);
CREATE POLICY "Permitir inserção anon vacation_requests" ON vacation_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização anon vacation_requests" ON vacation_requests FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura anon company_rules" ON company_rules FOR SELECT USING (true);
CREATE POLICY "Permitir atualização anon company_rules" ON company_rules FOR ALL USING (true);

CREATE POLICY "Permitir leitura anon audit_logs" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Permitir inserção anon audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);
`;
