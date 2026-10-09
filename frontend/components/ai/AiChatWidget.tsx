'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  RotateCcw, 
  Copy, 
  Check, 
  Minus,
  Maximize2,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { LumiLogo } from './LumiLogo';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}

const SUGGESTED_PROMPTS = [
  { label: "What's my current grade?", query: "What's my current grade?" },
  { label: "Show my class schedule", query: "Show my class schedule" },
  { label: "Check my announcements", query: "Check my announcements" },
  { label: "Help me navigate the portal", query: "Help me navigate the portal" },
];

/**
 * Clean formatter for chat text with support for bold (**text**),
 * bullet lists (• or -), and formatted paragraphs.
 */
function FormattedMessageText({ text, isAssistant = true }: { text: string; isAssistant?: boolean }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-[13px] leading-relaxed break-words">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Parse bold segments **word**
        const renderFormattedLine = (content: string) => {
          const parts = content.split(/(\*\*.*?\*\*)/g);
          return parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong
                  key={pIdx}
                  className={`font-semibold ${isAssistant ? 'text-slate-900' : 'text-white'}`}
                >
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });
        };

        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          const bulletContent = trimmed.replace(/^[•\-]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span
                className={`font-bold text-sm leading-none mt-1 shrink-0 ${
                  isAssistant ? 'text-[#2563EB]' : 'text-blue-200'
                }`}
              >
                •
              </span>
              <div className="flex-1">{renderFormattedLine(bulletContent)}</div>
            </div>
          );
        }

        return <p key={idx}>{renderFormattedLine(line)}</p>;
      })}
    </div>
  );
}

export function AiChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize conversation with official welcome greeting
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: 'welcome-1',
        role: 'assistant',
        content: `Hi! I'm Lumi AI, your CEC School Portal Assistant. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcomeMsg]);
    }
  }, [messages.length]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  // Focus input when opened or un-minimized
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, newUserMsg];
    setMessages(updatedHistory);
    setInputValue('');
    setIsLoading(true);
    setLastFailedMessage(null);

    try {
      // Retrieve auth token from localStorage if present
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localToken ? { Authorization: `Bearer ${localToken}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          role: user?.role || 'student',
          name: user?.name || 'Student',
          history: updatedHistory.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to fetch AI response');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (!isOpen || isMinimized) setHasUnread(true);
    } catch (err: any) {
      console.error('Lumi AI Chat error:', err);
      setLastFailedMessage(text);
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        isError: true,
        content:
          "I'm having trouble connecting to the school portal assistant right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSendMessage(lastFailedMessage);
    }
  };

  const handleClearChat = () => {
    setLastFailedMessage(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Hi! I'm Lumi AI, your CEC School Portal Assistant. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed z-40 select-none">
      {/* Floating Trigger Button with Tooltip */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 group">
          {/* Tooltip on Hover */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 -translate-x-1 group-hover:translate-x-0 hidden sm:flex items-center gap-1.5 border border-slate-700/50">
            <span>Chat with Lumi AI</span>
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-900" />
          </div>

          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="relative flex items-center justify-center w-14 h-14 sm:w-15 sm:h-15 bg-white text-slate-800 rounded-full border border-slate-200/90 shadow-lg shadow-blue-500/15 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200/60"
            aria-label="Chat with Lumi AI"
          >
            {/* Soft cyan-blue radial backdrop hint */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-50/50 to-blue-50/50 -z-10" />

            {/* Official Lumi AI Logo */}
            <LumiLogo size={36} className="transition-transform duration-300 group-hover:scale-110" priority />

            {/* Live Online Badge */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs" title="Lumi AI Online" />

            {/* Unread Message Badge */}
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#2563EB] text-[9px] font-bold text-white items-center justify-center">
                  1
                </span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* Floating Dialog / Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="lumi-ai-title"
          className={`fixed inset-x-2 bottom-2 top-16 sm:inset-auto sm:bottom-5 sm:right-5 w-auto sm:w-[420px] ${
            isMinimized ? 'sm:h-[68px]' : 'sm:h-[600px]'
          } bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95`}
        >
          {/* Clean White Chat Header with subtle cyan/blue accents */}
          <div className="bg-white text-slate-900 px-4 py-3 sm:py-3.5 flex items-center justify-between border-b border-blue-100 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative p-1 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-blue-100/80 shrink-0 shadow-2xs">
                <LumiLogo size={30} priority />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 id="lumi-ai-title" className="font-bold text-sm leading-tight text-slate-900 tracking-tight flex items-center gap-1">
                    Lumi AI
                  </h3>
                  <span className="text-[10px] font-medium bg-blue-50 text-[#2563EB] px-1.5 py-0.2 rounded-full border border-blue-100/80">
                    Official
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal truncate">
                  Your CEC School Portal Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              {!isMinimized && (
                <button
                  onClick={handleClearChat}
                  title="New conversation"
                  className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1"
                  aria-label="Start new chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">New</span>
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
                className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Lumi AI"
                className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Connected Portal Context Sub-Header */}
              <div className="bg-[#F0F7FF] border-b border-blue-100/70 px-3.5 py-1.5 text-[11px] text-blue-900 flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                  <span className="font-medium truncate">Connected to CEC School Portal Data</span>
                </div>
                <span className="text-[10px] font-mono font-medium bg-white text-[#2563EB] px-2 py-0.5 rounded-full border border-blue-200/60 shadow-2xs">
                  Read-Only
                </span>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-[#F8FAFC]">
                {messages.map((msg) => {
                  const isAssistant = msg.role === 'assistant';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-start gap-2 max-w-[92%]">
                        {isAssistant && (
                          <div className="shrink-0 mt-0.5">
                            <div className="w-7 h-7 rounded-full bg-white border border-blue-100 shadow-2xs flex items-center justify-center p-0.5">
                              <LumiLogo size={20} />
                            </div>
                          </div>
                        )}

                        <div
                          className={`relative rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                            isAssistant
                              ? 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                              : 'bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white rounded-tr-xs shadow-blue-500/10'
                          }`}
                        >
                          <FormattedMessageText text={msg.content} isAssistant={isAssistant} />

                          {/* Message Footer: Timestamp and Action Buttons */}
                          <div
                            className={`flex items-center justify-between gap-3 mt-1.5 pt-1 border-t text-[10px] ${
                              isAssistant
                                ? 'border-slate-100 text-slate-400'
                                : 'border-blue-400/30 text-blue-100'
                            }`}
                          >
                            <span>{msg.timestamp}</span>

                            <div className="flex items-center gap-2">
                              {msg.isError && (
                                <button
                                  onClick={handleRetry}
                                  className="flex items-center gap-1 text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors"
                                  title="Retry request"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Retry</span>
                                </button>
                              )}

                              {isAssistant && (
                                <button
                                  onClick={() => handleCopy(msg.id, msg.content)}
                                  className="flex items-center gap-1 hover:text-slate-700 transition-colors py-0.5"
                                  title="Copy response"
                                >
                                  {copiedId === msg.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-600 font-medium">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Animated Typing Indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="shrink-0 mt-0.5">
                      <div className="w-7 h-7 rounded-full bg-white border border-blue-100 shadow-2xs flex items-center justify-center p-0.5">
                        <LumiLogo size={20} />
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 bg-[#1D4ED8] rounded-full animate-bounce" />
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Lumi AI is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested Prompt Chips */}
                {messages.length <= 2 && !isLoading && (
                  <div className="pt-2">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                      Suggested Prompts
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_PROMPTS.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(action.query)}
                          className="inline-flex items-center gap-1.5 text-left text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-[#2563EB] border border-slate-200/80 hover:border-blue-300 rounded-full px-3 py-1.5 transition-all shadow-2xs font-medium cursor-pointer"
                        >
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Field and Action Bar */}
              <div className="p-3 bg-white border-t border-slate-200/90">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask Lumi AI about your grades, schedule, portal..."
                    disabled={isLoading}
                    className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-300 focus:border-[#2563EB] focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white rounded-xl transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-300 shrink-0 cursor-pointer"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="mt-1.5 text-center flex items-center justify-center gap-1.5">
                  <span className="text-[10px] text-slate-400">
                    Lumi AI • Official Cebu Eastern College Portal Assistant
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export const LumiAiWidget = AiChatWidget;
export default AiChatWidget;
