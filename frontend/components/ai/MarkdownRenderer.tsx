import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple, effective syntax colorizer for keywords, strings, comments, numbers
  const highlightTokens = (rawCode: string) => {
    const lines = rawCode.split('\n');
    return lines.map((line, lIdx) => {
      // Comments
      if (/^\s*(\/\/|#|--)/.test(line)) {
        return (
          <div key={lIdx} className="text-emerald-400 italic">
            {line}
          </div>
        );
      }

      // Tokenize by string literals, keywords, numbers
      const parts = line.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:class|public|static|void|def|function|return|if|else|for|while|import|from|const|let|var|new|package|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE)\b|\b\d+\b)/g);

      return (
        <div key={lIdx} className="leading-relaxed">
          {parts.map((token, tIdx) => {
            if (/^["'].*["']$/.test(token)) {
              return <span key={tIdx} className="text-amber-300">{token}</span>;
            }
            if (/^(class|public|static|void|def|function|return|if|else|for|while|import|from|const|let|var|new|package|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE)$/.test(token)) {
              return <span key={tIdx} className="text-sky-400 font-semibold">{token}</span>;
            }
            if (/^\d+$/.test(token)) {
              return <span key={tIdx} className="text-purple-300">{token}</span>;
            }
            return <span key={tIdx}>{token}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] shadow-md text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#1E293B] border-b border-slate-700/60 text-slate-300">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-medium lowercase text-sky-400">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-0.5 rounded hover:bg-slate-700/60 transition-colors cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-3.5 overflow-x-auto font-mono text-slate-100 text-[12px] leading-relaxed selection:bg-blue-600/40">
        {highlightTokens(code)}
      </div>
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
  isAssistant?: boolean;
}

/**
 * Robust, lightweight Markdown & Code parser for Lumi AI.
 * Handles headings, tables, code blocks, lists, blockquotes, bold, italic, and links.
 */
export function MarkdownRenderer({ content, isAssistant = true }: MarkdownRendererProps) {
  // 1. Separate code blocks from normal text
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const segments: Array<{ type: 'text' | 'code'; language?: string; value: string }> = [];

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        value: content.slice(lastIndex, match.index),
      });
    }
    segments.push({
      type: 'code',
      language: match[1]?.trim() || 'code',
      value: match[2]?.trimEnd() || '',
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      value: content.slice(lastIndex),
    });
  }

  // Render inline formatting (bold, italic, inline code, links)
  const renderInlineFormatted = (text: string) => {
    // Regex splits for:
    // **bold**
    // `inline_code`
    // *italic*
    // [link_label](url)
    const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*|\[.*?\]\(.*?\))/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className={`font-semibold ${isAssistant ? 'text-slate-900' : 'text-white'}`}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
              isAssistant
                ? 'bg-blue-50 text-[#1D4ED8] border border-blue-200/60'
                : 'bg-white/20 text-white'
            }`}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline font-medium hover:opacity-80 ${isAssistant ? 'text-[#2563EB]' : 'text-blue-100'}`}
          >
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  // Render a block of text containing paragraphs, lists, tables, headings
  const renderTextBlock = (text: string, blockKey: number) => {
    const rawLines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let listType: 'bullet' | 'number' | null = null;
    let tableRows: string[] = [];

    const flushList = () => {
      if (listItems.length > 0 && listType) {
        const items = [...listItems];
        const type = listType;
        elements.push(
          <div key={`list-${elements.length}`} className="my-1.5 space-y-1 pl-1">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className={`shrink-0 font-bold ${type === 'number' ? 'text-xs' : 'text-sm'} leading-none mt-1 ${isAssistant ? 'text-[#2563EB]' : 'text-blue-200'}`}>
                  {type === 'number' ? `${idx + 1}.` : '•'}
                </span>
                <div className="flex-1 text-[13px] leading-relaxed">
                  {renderInlineFormatted(item)}
                </div>
              </div>
            ))}
          </div>
        );
        listItems = [];
        listType = null;
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        const rows = [...tableRows];
        elements.push(
          <div key={`table-${elements.length}`} className="my-2.5 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-xs text-left">
              <tbody>
                {rows.map((row, rIdx) => {
                  const cells = row.split('|').filter((_, cIdx, arr) => cIdx > 0 && cIdx < arr.length - 1).map((c) => c.trim());
                  // Skip separator line |---|---|
                  if (cells.every((c) => /^[-:]+$/.test(c))) return null;

                  const isHeader = rIdx === 0;
                  return (
                    <tr key={rIdx} className={isHeader ? 'bg-slate-50 border-b border-slate-200 font-semibold text-slate-800' : 'border-b border-slate-100 last:border-none'}>
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-1.5">
                          {renderInlineFormatted(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
    };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trimEnd();
      const trimmed = line.trim();

      // Check Table line
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushList();
        tableRows.push(trimmed);
        continue;
      } else {
        flushTable();
      }

      // Check Heading
      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h4 key={`h4-${elements.length}`} className="font-bold text-sm text-slate-900 mt-2.5 mb-1">
            {renderInlineFormatted(trimmed.slice(4))}
          </h4>
        );
        continue;
      }
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${elements.length}`} className="font-bold text-sm text-slate-900 mt-3 mb-1.5">
            {renderInlineFormatted(trimmed.slice(3))}
          </h3>
        );
        continue;
      }
      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${elements.length}`} className="font-bold text-base text-slate-900 mt-3.5 mb-1.5">
            {renderInlineFormatted(trimmed.slice(2))}
          </h2>
        );
        continue;
      }

      // Check Bullet List item
      if (/^[-*•]\s+/.test(trimmed)) {
        if (listType !== 'bullet') flushList();
        listType = 'bullet';
        listItems.push(trimmed.replace(/^[-*•]\s+/, ''));
        continue;
      }

      // Check Numbered List item
      if (/^\d+\.\s+/.test(trimmed)) {
        if (listType !== 'number') flushList();
        listType = 'number';
        listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
        continue;
      }

      // Normal text or empty line
      flushList();

      if (!trimmed) {
        elements.push(<div key={`sp-${elements.length}`} className="h-1.5" />);
      } else {
        elements.push(
          <p key={`p-${elements.length}`} className="text-[13px] leading-relaxed">
            {renderInlineFormatted(trimmed)}
          </p>
        );
      }
    }

    flushList();
    flushTable();

    return <div key={blockKey} className="space-y-1.5">{elements}</div>;
  };

  return (
    <div className="text-[13px] leading-relaxed break-words">
      {segments.map((seg, idx) => {
        if (seg.type === 'code') {
          return <CodeBlock key={idx} language={seg.language || 'code'} code={seg.value} />;
        }
        return renderTextBlock(seg.value, idx);
      })}
    </div>
  );
}

export default MarkdownRenderer;
