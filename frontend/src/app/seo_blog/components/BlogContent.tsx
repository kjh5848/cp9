'use client'

import { GlassCard } from '@/shared/components/advanced-ui'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface BlogContentProps {
  content: string
}

export function BlogContent({ content }: BlogContentProps) {
  return (
    <GlassCard className="prose prose-lg dark:prose-invert max-w-none p-8">
      <ReactMarkdown
        components={{
          // 헤딩 컴포넌트 커스터마이징
          h1: ({ children }) => (
            <h1 
              id={children?.toString().toLowerCase().replace(/\s+/g, '-')} 
              className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-8 pb-2 border-b border-gray-200 dark:border-gray-700"
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 
              id={children?.toString().toLowerCase().replace(/\s+/g, '-')} 
              className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8 pb-2 border-b border-gray-200 dark:border-gray-700"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 
              id={children?.toString().toLowerCase().replace(/\s+/g, '-')} 
              className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6"
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4">
              {children}
            </h4>
          ),
          
          // 단락 스타일링
          p: ({ children }) => (
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {children}
            </p>
          ),
          
          // 목록 스타일링
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-2">
              {children}
            </li>
          ),
          
          // 코드 블록 스타일링
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            const isInline = !match
            
            return !isInline && match ? (
              <div className="my-6">
                <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-medium rounded-t-lg flex items-center justify-between">
                  <span>{language.toUpperCase()}</span>
                  <button 
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={() => navigator.clipboard.writeText(String(children))}
                  >
                    복사
                  </button>
                </div>
                <SyntaxHighlighter
                  style={oneDark as any}
                  language={language}
                  PreTag="div"
                  className="rounded-t-none"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code 
                className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-red-600 dark:text-red-400" 
                {...props}
              >
                {children}
              </code>
            )
          },
          
          // 인용구 스타일링
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-6 py-2 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
              <div className="text-gray-700 dark:text-gray-300 italic">
                {children}
              </div>
            </blockquote>
          ),
          
          // 링크 스타일링
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 hover:decoration-blue-600 transition-colors"
            >
              {children}
            </a>
          ),
          
          // 표 스타일링
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
              {children}
            </td>
          ),
          
          // 이미지 스타일링
          img: ({ src, alt }) => (
            <div className="my-8">
              <img
                src={src}
                alt={alt}
                className="w-full h-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
              />
              {alt && (
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                  {alt}
                </p>
              )}
            </div>
          ),
          
          // 수평선 스타일링
          hr: () => (
            <hr className="my-8 border-gray-300 dark:border-gray-600" />
          ),
          
          // 강조 텍스트 스타일링
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900 dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800 dark:text-gray-200">
              {children}
            </em>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </GlassCard>
  )
}

// CSS 스타일 (globals.css에 추가하거나 여기서 사용)
const styles = `
.blog-content {
  line-height: 1.8;
}

.blog-content pre {
  background: transparent !important;
  margin: 0 !important;
  padding: 1rem !important;
  border-radius: 0 0 0.5rem 0.5rem !important;
}

.blog-content pre code {
  background: transparent !important;
  color: inherit !important;
  font-size: 0.875rem !important;
  padding: 0 !important;
}

.blog-content h1:hover::after,
.blog-content h2:hover::after,
.blog-content h3:hover::after {
  content: "#";
  color: #3b82f6;
  margin-left: 0.5rem;
  opacity: 0.7;
  font-weight: normal;
}

.blog-content h1,
.blog-content h2,
.blog-content h3 {
  cursor: pointer;
  position: relative;
}
`