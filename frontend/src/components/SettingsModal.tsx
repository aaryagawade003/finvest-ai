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
  const [showGemini, setShowGemini] = useState(false);

  // Test state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestKeyResult | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getSettingsStatus().then(st => {
        setStatus(st);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestGemini = async () => {
    const keyToTest = geminiKey.trim();
    setTesting(true);
    try {
      const res = await testApiKey('gemini', keyToTest);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        valid: false,
        provider: 'Google Gemini',
        message: err.message || "Failed to connect to backend service"
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveGemini = async () => {
    setSaving(true);
    const payload: Record<string, string> = {
      DEFAULT_LLM_PROVIDER: 'gemini'
    };
    if (geminiKey.trim()) {
      payload.GEMINI_API_KEY = geminiKey.trim();
    }

    try {
      await updateApiKeys(payload);
      onKeysUpdated("Gemini API key saved and activated successfully for AI Copilot.");
      onClose();
    } catch (err: any) {
      alert("Failed to save key: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">FinVest AI Settings & Credentials</h3>
              <p className="text-[11px] text-slate-400">Dedicated Google Gemini Copilot & Zero-Key Yahoo Market Feed</p>
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
              <Cpu className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">AI Copilot Engine</span>
                <p className="font-bold text-emerald-400 text-xs">
                  🟢 Google Gemini Live
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Live Market Feeds</span>
                <p className="font-bold text-cyan-400 text-xs">🟢 Yahoo Finance (Zero-Key)</p>
              </div>
            </div>
          </div>

          {/* 1. Google Gemini (Exclusive AI Provider) */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">Google Gemini API</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  gemini-2.5-flash / gemini-flash-latest
                </span>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-400 hover:underline flex items-center space-x-1"
              >
                <span>AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Exclusively powers the multi-turn conversational AI Copilot, portfolio risk explanations, mathematical proofs, and stress testing insights.
            </p>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type={showGemini ? "text" : "password"}
                  placeholder={status?.providers?.gemini?.configured ? `Active Key: ${status.providers.gemini.masked_key}` : "Paste your Gemini API key (AQ...)"}
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
                onClick={handleTestGemini}
                disabled={testing}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-semibold text-xs flex items-center space-x-1.5 flex-shrink-0 transition-colors"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Verify Live Probe</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-2.5 rounded-xl border flex items-start space-x-2 text-[11px] ${
                testResult.valid 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                {testResult.valid ? <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />}
                <div>
                  <div className="font-semibold">{testResult.valid ? "Live Connection Verified" : "Verification Failed"}</div>
                  <div className="text-[10px] opacity-90">{testResult.message}</div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Zero-Key Yahoo Finance Feed Info */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">Yahoo Finance Autonomous Feed</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  Zero API Key Required
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Connected</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Provides real-time price quotes, historical adjusted close series, covariance matrices, and sector news for all supported US & Indian NSE/BSE tickers (<code className="text-cyan-300 font-mono">TCS.NS</code>, <code className="text-cyan-300 font-mono">RELIANCE.NS</code>, <code className="text-cyan-300 font-mono">GOLDBEES.NS</code>, <code className="text-cyan-300 font-mono">NVDA</code>, <code className="text-cyan-300 font-mono">AAPL</code>) without rate limits or keys.
            </p>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 flex items-start space-x-2 text-[11px] text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>
              Your Google Gemini key is stored strictly on your local machine in <code className="text-emerald-400 font-mono">backend-ai-service/.env</code>. It is excluded from Git via <code className="text-slate-300 font-mono">.gitignore</code> and never transmitted to any third-party analytics.
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            AI Provider: <strong className="text-emerald-400">Google Gemini Exclusively</strong>
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-semibold text-xs transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSaveGemini}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-500/20"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              <span>Save & Activate Key</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
