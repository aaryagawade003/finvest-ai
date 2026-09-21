import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, CornerDownLeft, RefreshCw, BarChart2, Shield } from 'lucide-react';
import { PortfolioSummary, CopilotResponse } from '../types';
import { askCopilot } from '../services/api';

interface AiCopilotChatProps {
  portfolio: PortfolioSummary;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  metrics?: Record<string, any>;
  followups?: string[];
  timestamp: string;
}

const PRESET_PROMPTS = [
  "What is the biggest risk in my portfolio?",
  "Why did my portfolio move today?",
  "How does my portfolio compare with the benchmark?",
  "How diversified is my portfolio?",
  "Which holdings contributed most to my returns?"
];

export const AiCopilotChat: React.FC<AiCopilotChatProps> = ({ portfolio }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: `Hello! I'm **FinVest AI Copilot**, your portfolio intelligence assistant.\n\nI have reviewed your **${portfolio.name}** (Valued at ₹${portfolio.metrics.total_portfolio_value.toLocaleString('en-IN')}). All numbers I cite are grounded directly in quantitative risk calculations.\n\nHow can I help you analyze your portfolio today?`,
      timestamp: 'Just now',
      followups: PRESET_PROMPTS.slice(0, 3)
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response: CopilotResponse = await askCopilot(textToSend, portfolio);
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        metrics: response.referenced_metrics,
        followups: response.suggested_followups,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I encountered an error retrieving analytics for that question. Please try asking again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[650px]">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950">
            <Bot className="w-5 h-5 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">FinVest AI Copilot</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Grounded in Quant Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Context: {portfolio.name} (Risk Tier: {portfolio.metrics.risk_level})</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Preset Prompts bar */}
      <div className="px-4 py-2.5 bg-slate-950/20 border-b border-slate-800/60 flex items-center space-x-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[11px] text-slate-400 font-semibold uppercase flex-shrink-0 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-teal-400" />
          <span>Suggested:</span>
        </span>
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isAi = msg.sender === 'assistant';
          return (
            <div key={msg.id} className={`flex items-start space-x-3 ${isAi ? '' : 'flex-row-reverse space-x-reverse'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                isAi 
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950' 
                  : 'bg-indigo-600 text-white'
              }`}>
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div className={`max-w-[85%] space-y-2`}>
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  isAi 
                    ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80 shadow-md whitespace-pre-line' 
                    : 'bg-emerald-600 text-slate-950 font-medium font-sans'
                }`}>
                  {msg.text}
                </div>

                {/* Referenced Metrics badges if present */}
                {msg.metrics && Object.keys(msg.metrics).length > 0 && (
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-500">Verified Metrics:</span>
                    {msg.metrics.sharpe_ratio && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-emerald-400">
                        Sharpe: {msg.metrics.sharpe_ratio}
                      </span>
                    )}
                    {msg.metrics.volatility && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-400">
                        Vol: {msg.metrics.volatility}%
                      </span>
                    )}
                    {msg.metrics.beta && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-violet-400">
                        Beta: {msg.metrics.beta}
                      </span>
                    )}
                  </div>
                )}

                {/* Follow-up suggested buttons */}
                {msg.followups && msg.followups.length > 0 && (
                  <div className="pt-1 flex items-center space-x-1.5 flex-wrap gap-y-1.5">
                    {msg.followups.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(f)}
                        className="text-[11px] text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg px-2.5 py-1 transition-colors"
                      >
                        {f} →
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] text-slate-500 ${isAi ? '' : 'text-right'}`}>
                  {msg.timestamp}
                </div>

              </div>

            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-2xl text-xs text-slate-300 flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Analyzing portfolio metrics & cross-referencing market data...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask about risks, returns, benchmark comparison, or scenario impacts..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-900 text-xs text-white px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

    </div>
  );
};
