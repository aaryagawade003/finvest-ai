import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, AlertCircle, RefreshCw, ExternalLink, Shield, Cpu, Globe, Eye, EyeOff } from 'lucide-react';
import { SettingsStatus, TestKeyResult } from '../types';
import { getSettingsStatus, updateApiKeys, testApiKey } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysUpdated: (message: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onKeysUpdated
}) => {
  const [status, setStatus] = useState<SettingsStatus | null>(null);
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [finnhubKey, setFinnhubKey] = useState('');
  const [alphaKey, setAlphaKey] = useState('');
  const [preferredLlm, setPreferredLlm] = useState('gemini');

  // Reveal toggles
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showFinnhub, setShowFinnhub] = useState(false);
  const [showAlpha, setShowAlpha] = useState(false);

  // Test states
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestKeyResult>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getSettingsStatus().then(st => {
        setStatus(st);
        if (st.active_llm_provider.toLowerCase().includes('openai')) {
          setPreferredLlm('openai');
        } else {
          setPreferredLlm('gemini');
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async (provider: string, keyVal: string) => {
    if (!keyVal.trim()) {
      setTestResults(prev => ({
        ...prev,
        [provider]: { valid: false, provider, message: "Please paste a key first" }
      }));
      return;
    }

    setTestingProvider(provider);
    try {
      const res = await testApiKey(provider, keyVal.trim());
      setTestResults(prev => ({ ...prev, [provider]: res }));
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        [provider]: { valid: false, provider, message: err.message || "Failed to reach server" }
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const payload: Record<string, string> = {
      DEFAULT_LLM_PROVIDER: preferredLlm
    };
    if (geminiKey.trim()) payload.GEMINI_API_KEY = geminiKey.trim();
    if (openaiKey.trim()) payload.OPENAI_API_KEY = openaiKey.trim();
    if (finnhubKey.trim()) payload.FINNHUB_API_KEY = finnhubKey.trim();
    if (alphaKey.trim()) payload.ALPHA_VANTAGE_API_KEY = alphaKey.trim();

    try {
      await updateApiKeys(payload);
      onKeysUpdated("API keys saved successfully! Live integrations activated.");
      onClose();
    } catch (err: any) {
      alert("Failed to save keys: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">API Keys & Live Integrations</h3>
              <p className="text-[11px] text-slate-400">Configure real LLM intelligence and external market data providers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Active Status Ribbon */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Active AI Engine</span>
                <p className="font-bold text-white text-xs">
                  {status?.active_llm_provider && status.active_llm_provider !== 'None'
                    ? `🟢 ${status.active_llm_provider}`
                    : '🟡 Local Quant Engine (No API Key)'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Market Quotes Feed</span>
                <p className="font-bold text-emerald-400 text-xs">🟢 Live Feed (Yahoo Finance + APIs)</p>
              </div>
            </div>
          </div>

          {/* 1. Google Gemini */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">Google Gemini API</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  gemini-1.5-flash / 2.0-flash
                </span>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-400 hover:underline flex items-center space-x-1"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type={showGemini ? "text" : "password"}
                  placeholder={status?.providers?.gemini?.configured ? `Current: ${status.providers.gemini.masked_key}` : "Paste your Gemini API key (AIzaSy...)"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-slate-900 text-white px-3 py-2 pr-9 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  {showGemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                onClick={() => handleTest('gemini', geminiKey)}
                disabled={testingProvider === 'gemini'}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center space-x-1.5 flex-shrink-0"
              >
                {testingProvider === 'gemini' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Test Probe</span>
              </button>
            </div>

            {testResults['gemini'] && (
              <div className={`p-2.5 rounded-xl border flex items-start space-x-2 text-[11px] ${
                testResults['gemini'].valid 
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
              }`}>
                {testResults['gemini'].valid ? <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />}
                <span>{testResults['gemini'].message}</span>
              </div>
            )}
          </div>

          {/* 2. OpenAI */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">OpenAI API</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  gpt-4o-mini / gpt-4o
                </span>
              </div>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-400 hover:underline flex items-center space-x-1"
              >
                <span>Get API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type={showOpenai ? "text" : "password"}
                  placeholder={status?.providers?.openai?.configured ? `Current: ${status.providers.openai.masked_key}` : "Paste your OpenAI API key (sk-proj-...)"}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full bg-slate-900 text-white px-3 py-2 pr-9 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenai(!showOpenai)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  {showOpenai ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                onClick={() => handleTest('openai', openaiKey)}
                disabled={testingProvider === 'openai'}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center space-x-1.5 flex-shrink-0"
              >
                {testingProvider === 'openai' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Test Probe</span>
              </button>
            </div>

            {testResults['openai'] && (
              <div className={`p-2.5 rounded-xl border flex items-start space-x-2 text-[11px] ${
                testResults['openai'].valid 
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
              }`}>
                {testResults['openai'].valid ? <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />}
                <span>{testResults['openai'].message}</span>
              </div>
            )}
          </div>

          {/* 3. Finnhub */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">Finnhub Market & News API</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  Real-time Quotes & News
                </span>
              </div>
              <a
                href="https://finnhub.io/register"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-400 hover:underline flex items-center space-x-1"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type={showFinnhub ? "text" : "password"}
                  placeholder={status?.providers?.finnhub?.configured ? `Current: ${status.providers.finnhub.masked_key}` : "Paste your Finnhub key"}
                  value={finnhubKey}
                  onChange={(e) => setFinnhubKey(e.target.value)}
                  className="w-full bg-slate-900 text-white px-3 py-2 pr-9 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowFinnhub(!showFinnhub)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  {showFinnhub ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                onClick={() => handleTest('finnhub', finnhubKey)}
                disabled={testingProvider === 'finnhub'}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center space-x-1.5 flex-shrink-0"
              >
                {testingProvider === 'finnhub' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Test Probe</span>
              </button>
            </div>

            {testResults['finnhub'] && (
              <div className={`p-2.5 rounded-xl border flex items-start space-x-2 text-[11px] ${
                testResults['finnhub'].valid 
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
              }`}>
                {testResults['finnhub'].valid ? <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />}
                <span>{testResults['finnhub'].message}</span>
              </div>
            )}
          </div>

          {/* Preferred LLM Provider Selector */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-slate-300 font-semibold">Preferred AI Copilot Engine:</span>
            <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPreferredLlm('gemini')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  preferredLlm === 'gemini' 
                    ? 'bg-emerald-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Gemini
              </button>
              <button
                type="button"
                onClick={() => setPreferredLlm('openai')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  preferredLlm === 'openai' 
                    ? 'bg-cyan-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                OpenAI
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Keys are saved to local <code className="text-emerald-400 font-mono">.env</code> and loaded securely.
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-500/20"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              <span>Save & Activate Keys</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
