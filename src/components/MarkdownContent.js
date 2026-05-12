"use client";
import ReactMarkdown from 'react-markdown';

/**
 * Renders text as markdown with styled typography.
 * Used for post experience text that may contain markdown from AI rephrasing.
 * Falls back gracefully — plain text renders normally too.
 *
 * Props:
 *   content   - the raw text (may or may not contain markdown)
 *   className - additional CSS classes for the wrapper
 */
export default function MarkdownContent({ content, className = '' }) {
  if (!content) return null;

  return (
    <div className={`prose prose-sm max-w-none ${className}`.trim()}>
      <ReactMarkdown
        components={{
          // Headings
          h1: ({ children }) => <h3 className="text-base font-black uppercase tracking-tight mt-4 mb-2">{children}</h3>,
          h2: ({ children }) => <h4 className="text-sm font-black uppercase tracking-tight mt-3 mb-1.5">{children}</h4>,
          h3: ({ children }) => <h5 className="text-sm font-bold mt-2 mb-1">{children}</h5>,

          // Paragraphs
          p: ({ children }) => <p className="text-sm text-gray-700 leading-relaxed mb-2">{children}</p>,

          // Lists
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-3 text-sm text-gray-700">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-3 text-sm text-gray-700">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,

          // Inline
          strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,

          // Block
          blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-300 pl-3 italic text-gray-500 my-2">{children}</blockquote>,
          hr: () => <hr className="border-gray-200 my-3" />,

          // Links
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline underline-offset-2 hover:text-blue-800">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
