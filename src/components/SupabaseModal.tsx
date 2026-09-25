import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Key, 
  Link as LinkIcon,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  testSupabaseConnection, 
  SUPABASE_SQL_SCHEMA 
} from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: () => Promise<void>;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onSync,
}) => {
  const initialCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(initialCreds.url);
  const [key, setKey] = useState(initialCreds.key);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!url || !key) {
      setTestResult({ success: false, message: 'Por favor, preencha a URL e a Anon Key do seu projeto Supabase.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url, key);
      setTestResult(res);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    saveSupabaseCredentials(url, key);
    await onSync();
    onClose();
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Conexão com Banco de Dados Supabase</h2>
              <p className="text-xs text-emerald-200/80">
                Armazenamento em nuvem em tempo real para solicitações de férias
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Credenciais do Supabase
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Script SQL das Tabelas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              Copiar
            </span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'config' ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Pronto para Conectar ao seu Supabase</span>
                </div>
                <p>
                  Insira abaixo as credenciais do seu projeto Supabase (encontradas em <em>Project Settings &gt; API</em>).
                  Se nenhuma credencial for informada, o sistema opera de forma autônoma e segura através de armazenamento local instantâneo com suporte a todos os fluxos.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Project URL</span>
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span>Project API Anon Key (Public)</span>
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              {testResult && (
                <div className={`p-4 rounded-xl text-xs font-medium border flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}>
                  {testResult.success ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testando Conexão...' : 'Testar Conexão'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                  >
                    Salvar e Conectar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Estrutura de Tabelas e RLS para o Supabase
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Execute no Supabase SQL Editor para criar `departments`, `employees`, `vacation_requests`, etc.
                  </p>
                </div>
                <button
                  onClick={copySqlToClipboard}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Copiado!' : 'Copiar SQL'}</span>
                </button>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto max-h-80 border border-slate-800 font-mono text-[11px] text-emerald-400">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
