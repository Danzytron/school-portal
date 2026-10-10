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
  Sparkles,
  Square,
  Compass
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { LumiLogo } from './LumiLogo';
import { MarkdownRenderer } from './MarkdownRenderer';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}

const SUGGESTED_PROMPTS = [
  { label: "📅 What is today's date?", query: "What is today's date?" },
  { label: "☕ Explain Java", query: "What is Java and what are its key features?" },
  { label: "🐍 Give me a Python example", query: "Give me an example of a Python program and explain how it works." },
  { label: "💻 Help me with programming", query: "How can you help me with IT and computer science coursework?" },
  { label: "🗓️ Show my class schedule", query: "Show my class schedule" },
  { label: "📊 What are my grades?", query: "What's my current grade and GPA?" },
];

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize conversation with welcome greeting
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: 'welcome-1',
        role: 'assistant',
        content: `Hi! I'm **Lumi AI**, your intelligent assistant for Cebu Eastern College.\n\nI can answer **general knowledge questions**, explain programming concepts in **Java, Python, C++, and SQL**, help you study, or check your **verified class schedule, grades, and campus bulletins**.\n\nHow can I help you today?`,
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

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setHasUnread(false);
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollH, 40), 120)}px`;
    }
  }, [inputValue]);

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
    if (textareaRef.current) textareaRef.current.style.height = '40px';
    setIsLoading(true);
    setLastFailedMessage(null);

    // Create abort controller for stop-generation button
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
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
          history: updatedHistory.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
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
      if (err.name === 'AbortError') {
        const abortedMsg: ChatMessage = {
          id: `assistant-abort-${Date.now()}`,
          role: 'assistant',
          content: '_Generation stopped by user._',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, abortedMsg]);
      } else {
        console.error('Lumi AI Chat error:', err);
        setLastFailedMessage(text);
        const errorMsg: ChatMessage = {
          id: `assistant-err-${Date.now()}`,
          role: 'assistant',
          isError: true,
          content:
            "I'm having trouble connecting right now. Please try again or check your server API configuration.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRegenerateLast = () => {
    // Find last user message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        const lastQuery = messages[i].content;
        // Remove subsequent assistant replies
        setMessages((prev) => prev.slice(0, i));
        handleSendMessage(lastQuery);
        break;
      }
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
        content: `Conversation refreshed! Hi! I'm **Lumi AI**, your CEC School Portal Assistant. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
            className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 p-2 bg-white text-slate-800 rounded-full border border-slate-200/90 shadow-lg shadow-blue-500/15 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200/60 cursor-pointer"
            aria-label="Chat with Lumi AI"
          >
            {/* Official Transparent Lumi AI Logo */}
            <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <LumiLogo className="w-full h-full" priority />
            </div>

            {/* Live Online Badge */}
            <span 
              className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs" 
              title="Lumi AI Online" 
            />

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
          className={`fixed inset-x-2 bottom-2 top-14 sm:inset-auto sm:bottom-5 sm:right-5 w-auto sm:w-[440px] ${
            isMinimized ? 'sm:h-[68px]' : 'sm:h-[630px]'
          } bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95`}
        >
          {/* Clean White Chat Header */}
          <div className="bg-white text-slate-900 px-4 py-3 sm:py-3.5 flex items-center justify-between border-b border-blue-100 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              {/* Header Avatar: Transparent, perfectly fitted */}
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
                <LumiLogo className="w-full h-full" priority />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 id="lumi-ai-title" className="font-bold text-sm leading-tight text-slate-900 tracking-tight flex items-center gap-1">
                    Lumi AI
                  </h3>
                  <span className="text-[10px] font-medium bg-blue-50 text-[#2563EB] px-1.5 py-0.2 rounded-full border border-blue-100/80">
                    CEC Assistant
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal truncate">
                  AI Knowledge, Coding & Portal Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              {!isMinimized && (
                <button
                  onClick={handleClearChat}
                  title="New conversation"
                  className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
                  aria-label="Start new chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">New</span>
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
                className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Lumi AI"
                className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
                  <span className="font-medium truncate">Powered by Groq • Manila Time (UTC+8)</span>
                </div>
                <span className="text-[10px] font-mono font-medium bg-white text-[#2563EB] px-2 py-0.5 rounded-full border border-blue-200/60 shadow-2xs">
                  Active
                </span>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-[#F8FAFC]">
                {messages.map((msg, idx) => {
                  const isAssistant = msg.role === 'assistant';
                  const isLastAssistant = isAssistant && idx === messages.length - 1;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-start gap-2.5 max-w-[94%]">
                        {isAssistant && (
                          <div className="shrink-0 mt-0.5 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
                            <LumiLogo className="w-full h-full" />
                          </div>
                        )}

                        <div
                          className={`relative rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                            isAssistant
                              ? 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                              : 'bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white rounded-tr-xs shadow-blue-500/10'
                          }`}
                        >
                          {/* Markdown & Code Renderer */}
                          <MarkdownRenderer content={msg.content} isAssistant={isAssistant} />

                          {/* Message Footer: Timestamp, Regenerate, Copy */}
                          <div
                            className={`flex items-center justify-between gap-3 mt-2 pt-1 border-t text-[10px] ${
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
                                  className="flex items-center gap-1 text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors cursor-pointer"
                                  title="Retry request"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Retry</span>
                                </button>
                              )}

                              {isLastAssistant && !isLoading && (
                                <button
                                  onClick={handleRegenerateLast}
                                  className="flex items-center gap-1 hover:text-slate-700 transition-colors py-0.5 cursor-pointer text-slate-400"
                                  title="Regenerate response"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Regenerate</span>
                                </button>
                              )}

                              {isAssistant && (
                                <button
                                  onClick={() => handleCopy(msg.id, msg.content)}
                                  className="flex items-center gap-1 hover:text-slate-700 transition-colors py-0.5 cursor-pointer"
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
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    <div className="shrink-0 mt-0.5 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
                      <LumiLogo className="w-full h-full" />
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

                {/* Suggested Prompt Chips (when few messages) */}
                {messages.length <= 2 && !isLoading && (
                  <div className="pt-2">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-[#2563EB]" />
                      <span>Suggested Prompts</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_PROMPTS.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(action.query)}
                          className="inline-flex items-center gap-1 text-left text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-[#2563EB] border border-slate-200/80 hover:border-blue-300 rounded-full px-3 py-1.5 transition-all shadow-2xs font-medium cursor-pointer"
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
                  className="flex items-end gap-2"
                >
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Lumi AI anything (Shift+Enter for newline)..."
                    disabled={isLoading}
                    className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-300 focus:border-[#2563EB] focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 disabled:opacity-50 resize-none max-h-30 leading-normal"
                  />

                  {isLoading ? (
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-red-300 shrink-0 cursor-pointer flex items-center justify-center"
                      title="Stop generating"
                      aria-label="Stop generating"
                    >
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="p-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-300 shrink-0 cursor-pointer flex items-center justify-center"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </form>

                <div className="mt-1.5 text-center flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                  <span>Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[9px]">Shift+Enter</kbd> for new line</span>
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
