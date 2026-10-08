'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  RotateCcw, 
  Copy, 
  Check, 
  Bot, 
  User, 
  ChevronDown,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_ACTIONS = [
  { label: '📊 My Grades', query: 'What are my grades?' },
  { label: '📅 My Schedule', query: "What's my schedule today?" },
  { label: '📚 My Subjects', query: 'What subjects am I enrolled in?' },
  { label: '📢 Announcements', query: 'What are the latest announcements?' },
  { label: '👨‍🏫 My Instructors', query: 'Who are my instructors?' },
  { label: '❓ Help', query: 'How can you help me?' },
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
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span
                className={`font-bold text-sm leading-none mt-1 ${
                  isAssistant ? 'text-[#1D4ED8]' : 'text-blue-200'
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize conversation with personalized greeting
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: 'welcome-1',
        role: 'assistant',
        content: `Hi! I'm the **CEC AI Assistant**. I can help you check your **grades**, **class schedule**, **subjects**, **announcements**, and other information available in your school portal.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcomeMsg]);
    }
  }, [user, messages.length]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

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

    try {
      // Get auth token from localStorage if available
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
      if (!isOpen) setHasUnread(true);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content:
          "I'm having trouble connecting to the school portal assistant right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const userName = user?.name ? user.name.split(' ')[0] : 'Student';
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Conversation refreshed. Hello ${userName}! How can I help you today?`,
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
    <div className="fixed z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-300"
            aria-label="Open CEC AI Assistant"
          >
            <div className="relative">
              <Bot className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1D4ED8] animate-pulse" />
            </div>
            <span className="font-semibold text-xs sm:text-sm tracking-wide">
              CEC Assistant
            </span>
            {hasUnread && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white items-center justify-center">
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
          aria-labelledby="cec-ai-title"
          className="fixed inset-x-2 bottom-2 top-16 sm:inset-auto sm:bottom-5 sm:right-5 w-auto sm:w-[410px] sm:h-[580px] bg-slate-50 border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="bg-[#1D4ED8] text-white px-4 py-3 sm:py-3.5 flex items-center justify-between border-b border-blue-600 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 id="cec-ai-title" className="font-bold text-sm leading-tight text-white truncate">
                    CEC AI Assistant
                  </h3>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
                </div>
                <p className="text-[11px] text-blue-100 truncate">
                  Your School Portal Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="New Chat"
                className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs flex items-center gap-1"
                aria-label="Start new chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">New</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="bg-blue-50 border-b border-blue-100 px-3 py-1.5 text-[11px] text-blue-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Connected to CEC Portal Database</span>
            </div>
            <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
              Read-Only
            </span>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-start gap-2 max-w-[92%]">
                    {isAssistant && (
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`relative rounded-2xl px-3.5 py-2.5 shadow-xs ${
                        isAssistant
                          ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                          : 'bg-[#1D4ED8] text-white rounded-tr-xs'
                      }`}
                    >
                      <FormattedMessageText text={msg.content} isAssistant={isAssistant} />

                      {/* Message Footer: Timestamp and Copy Button */}
                      <div
                        className={`flex items-center justify-between gap-3 mt-1.5 pt-1 border-t text-[10px] ${
                          isAssistant
                            ? 'border-slate-100 text-slate-400'
                            : 'border-blue-400/40 text-blue-100'
                        }`}
                      >
                        <span>{msg.timestamp}</span>

                        {isAssistant && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="flex items-center gap-1 hover:text-slate-700 transition-colors py-0.5"
                            title="Copy reply"
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
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-3.5 py-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#1D4ED8] rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-[#1D4ED8] rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-[#1D4ED8] rounded-full animate-bounce" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      CEC AI Assistant is typing...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Action Suggestion Chips (shown after first greeting or when chat is idle) */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                  Suggested Questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ACTIONS.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(action.query)}
                      className="inline-flex items-center gap-1.5 text-left text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-[#1D4ED8] border border-slate-200 hover:border-blue-300 rounded-full px-3 py-1.5 transition-all shadow-2xs font-medium"
                    >
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Footer */}
          <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200">
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
                placeholder="Ask about your grades, schedule, subjects..."
                disabled={isLoading}
                className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#1D4ED8] focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-slate-300 text-white rounded-xl transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-300 shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 text-center">
              <span className="text-[10px] text-slate-400">
                Official Cebu Eastern College UIS Assistant
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiChatWidget;
