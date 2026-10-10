'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ArrowUp,
  ArrowUpRight,
  RotateCcw, 
  Copy, 
  Check, 
  Minus,
  Maximize2,
  RefreshCw,
  Square
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
  { 
    label: "Explain Java in simple terms.", 
    query: "Explain Java in simple terms.",
    icon: "☕"
  },
  { 
    label: "Help me debug my code.", 
    query: "Can you help me debug my programming code? Here is what I am trying to fix:",
    icon: "💻"
  },
  { 
    label: "Summarize my study notes.", 
    query: "Can you summarize key computer science concepts and study notes?",
    icon: "📝"
  },
  { 
    label: "Help me understand my class schedule.", 
    query: "Help me understand my class schedule",
    icon: "🗓️"
  },
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
      textareaRef.current.style.height = `${Math.min(Math.max(scrollH, 28), 120)}px`;
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
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
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
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        const lastQuery = messages[i].content;
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
    setMessages([]);
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
      {/* Floating Launcher Button */}
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
            className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 p-2.5 bg-white text-slate-800 rounded-full border border-slate-200/90 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200/60 cursor-pointer"
            aria-label="Open Lumi AI"
          >
            {/* Official Transparent Lumi AI Logo */}
            <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <LumiLogo className="w-full h-full" priority />
            </div>

            {/* Live Online Dot */}
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
            isMinimized ? 'sm:h-[64px]' : 'sm:h-[630px]'
          } bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95`}
        >
          {/* Header */}
          <div className="bg-white text-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar */}
              <div className="relative w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center p-1 shrink-0">
                <LumiLogo className="w-full h-full" priority />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border-1.5 border-white" />
              </div>

              <div className="min-w-0">
                <h3 id="lumi-ai-title" className="font-semibold text-sm leading-tight text-slate-900 tracking-tight">
                  Lumi AI
                </h3>
                <p className="text-[11px] text-slate-500 leading-tight">
                  AI Assistant • Ready to help
                </p>
              </div>
            </div>

            <div className="flex items-center gap-0.5 text-slate-400">
              {messages.length > 0 && !isMinimized && (
                <button
                  onClick={handleClearChat}
                  title="New conversation"
                  className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
                  aria-label="Start new chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px] font-medium">New</span>
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
                className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Lumi AI"
                className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Chat Viewport */}
              <div className="flex-1 overflow-y-auto bg-[#F8FAFC]/50 flex flex-col">
                {messages.length === 0 ? (
                  /* Welcome Screen (when no messages yet) */
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50/80 border border-blue-100/90 flex items-center justify-center p-2.5 sm:p-3 mb-3.5 shadow-xs shadow-blue-500/5">
                      <LumiLogo className="w-full h-full" priority />
                    </div>

                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      Hi! I&apos;m Lumi AI.
                    </h4>

                    <p className="text-xs sm:text-[13px] text-slate-500 max-w-[280px] sm:max-w-[320px] mt-1.5 mb-5 leading-relaxed">
                      Your AI assistant for learning, programming, and everyday questions.
                    </p>

                    <div className="w-full max-w-sm space-y-2 text-left">
                      {SUGGESTED_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(prompt.query)}
                          className="group w-full flex items-center justify-between p-2.5 sm:p-3 bg-white hover:bg-blue-50/50 active:bg-blue-50 border border-slate-200/80 hover:border-blue-200 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base shrink-0">{prompt.icon}</span>
                            <span className="text-xs sm:text-[13px] font-medium text-slate-700 group-hover:text-[#2563EB] truncate">
                              {prompt.label}
                            </span>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Message Thread */
                  <div className="p-4 space-y-4">
                    {messages.map((msg, idx) => {
                      const isAssistant = msg.role === 'assistant';
                      const isLastAssistant = isAssistant && idx === messages.length - 1;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                        >
                          {isAssistant ? (
                            /* Lumi AI Response (spacious, clean layout) */
                            <div className="flex items-start gap-2.5 w-full">
                              <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 p-1 shrink-0 flex items-center justify-center mt-0.5">
                                <LumiLogo className="w-full h-full" />
                              </div>

                              <div className="flex-1 min-w-0 bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs">
                                <MarkdownRenderer content={msg.content} isAssistant={true} />

                                {/* Response Actions Footer */}
                                <div className="flex items-center justify-between gap-3 mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                                  <span>{msg.timestamp}</span>

                                  <div className="flex items-center gap-1.5">
                                    {msg.isError && (
                                      <button
                                        onClick={handleRetry}
                                        className="flex items-center gap-1 text-[#2563EB] hover:text-[#1D4ED8] font-medium px-2 py-0.5 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                                        title="Retry request"
                                      >
                                        <RefreshCw className="w-3 h-3" />
                                        <span>Retry</span>
                                      </button>
                                    )}

                                    {isLastAssistant && !isLoading && (
                                      <button
                                        onClick={handleRegenerateLast}
                                        className="flex items-center gap-1 hover:text-slate-700 px-2 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                        title="Regenerate response"
                                      >
                                        <RefreshCw className="w-3 h-3" />
                                        <span>Regenerate</span>
                                      </button>
                                    )}

                                    <button
                                      onClick={() => handleCopy(msg.id, msg.content)}
                                      className="flex items-center gap-1 hover:text-slate-700 px-2 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
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
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* User Message Bubble */
                            <div className="max-w-[85%] bg-[#2563EB] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs sm:text-[13.5px] leading-relaxed shadow-xs break-words">
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              <div className="text-right mt-1">
                                <span className="text-[10px] text-blue-100/80">{msg.timestamp}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Subtle Typing Indicator */}
                    {isLoading && (
                      <div className="flex items-start gap-2.5 w-full">
                        <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 p-1 shrink-0 flex items-center justify-center mt-0.5">
                          <LumiLogo className="w-full h-full" />
                        </div>
                        <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full animate-bounce [animation-delay:-0.3s]" />
                              <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                              <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">
                              Lumi is thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Composer & Disclaimer Area */}
              <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative flex items-end gap-1.5 bg-slate-50/90 hover:bg-slate-50 border border-slate-200/90 focus-within:border-[#2563EB] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl p-1.5 pl-3.5 transition-all"
                >
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Lumi anything..."
                    disabled={isLoading}
                    className="flex-1 text-xs sm:text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 placeholder:text-slate-400 resize-none py-1.5 leading-relaxed max-h-28 min-h-[24px] disabled:opacity-50"
                  />

                  {isLoading ? (
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="p-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-all shadow-xs shrink-0 cursor-pointer flex items-center justify-center"
                      title="Stop generating"
                      aria-label="Stop generating"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="p-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-xl transition-all shadow-xs shrink-0 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center active:scale-95"
                      title="Send message"
                      aria-label="Send message"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  )}
                </form>

                {/* EXACT AI Disclaimer Text */}
                <p className="mt-2 text-center text-[11px] text-slate-400 select-none">
                  Lumi is AI and can make mistakes.
                </p>
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
