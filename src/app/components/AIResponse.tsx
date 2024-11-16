import { Loader2 } from 'lucide-react';
import React from 'react';

interface AIResponseProps {
  messages: Array<{
    role: "user" | "ai";
    content: string;
    type: string;
    isStreaming?: boolean;
  }>;
  handleSendMessage: (message: string) => void;
}

interface Section {
  type: 'text' | 'analysis' | 'markdown' | 'table' | 'list' | 'link' | 'image' | 'FUNCTION_CALL' | 'portfolio' | 'token_list' | 'capabilities' | 'examples' | 'token_balance' | 'function';
  content: any;
  title?: string;
  display?: {
    title: string;
    description: string;
    details?: string;
  };
  data?: any;
  tokens?: Token[];
  examples?: string[];
}

interface Token {
  symbol: string;
  name: string;
  address: string;
  logoURI?: string;
  balance?: string;
  value_usd?: number;
  icon?: string;
}

const PortfolioSection = ({ title, data }: { title?: string, data?: any }) => (
  <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow">
    <h3 className="text-lg font-bold">{title || "Portfolio Overview"}</h3>
    <div className="grid grid-cols-1 gap-4">
      {data?.tokens?.map((token: any) => (
        <div
          key={token.symbol}
          className="flex items-center justify-between p-2 bg-gray-50 rounded"
        >
          <div className="flex items-center gap-2">
            {token.icon && (
              <img
                src={token.icon}
                alt={token.symbol}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="font-medium">{token.symbol}</span>
          </div>
          <div className="text-right">
            <div>{parseFloat(token.balance).toFixed(6)}</div>
            <div className="text-sm text-gray-500">
              ${parseFloat(token.value_usd).toFixed(2)}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const formatText = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Italic text
    .replace(/`(.*?)`/g, '<code>$1</code>')            // Code
    .replace(/\n/g, '<br />')                          // Line breaks
};

export const AIResponse: React.FC<AIResponseProps> = ({ messages, handleSendMessage }) => {

  const safeJsonParse = (str: string): any => {
    if (typeof str === 'object') return str;
    try {
      const cleanStr = str.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanStr);
    } catch (e) {
      return {
        sections: [{ type: "text", content: str }],
      };
    }
  };

  const renderSection = (section: Section, isStreaming: boolean) => {
    switch (section.type) {
      case 'text':
        return (
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-start items-start text-left">
            <p
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatText(section.content) }}
            />
          </div>
        );

      case 'token_balance':
        return (
          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-sm flex flex-col justify-start items-start text-left">
            <div className="flex items-center gap-2">
              <img src={section.content.image} alt={section.content.symbol} className="w-8 h-8 rounded-full" />
              <span className="font-medium">{section.content.symbol}</span>
            </div>
            <div className="text-sm text-gray-500">
              {parseFloat(section.content.balance).toFixed(6)} {section.content.symbol}
            </div>
          </div>
        );

      case 'function':
        return (
          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-sm flex flex-col justify-start items-start text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium">{section.content.function}</span>
              <span className="text-sm text-gray-500">({section.content.args.join(', ')})</span>
            </div>
          </div>
        );

      case 'FUNCTION_CALL':
        return (
          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-sm flex flex-col justify-start items-start text-left">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex flex-col gap-1">
                <span className="font-medium text-blue-900">
                  {formatText(section.display?.title || '')}
                </span>
                <span className="text-sm text-blue-700">
                  {formatText(section.display?.description || '')}
                </span>
                {section.display?.details && (
                  <span className="text-sm text-blue-600 mt-1">
                    {formatText(section.display.details)}
                  </span>
                )}
              </div>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
              >
                <span>Execute</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        );

      case 'link':
        return (
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-start items-start text-left">
            <a
              href={section.content}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {section.title || section.content}
            </a>
          </div>
        );

      case 'token_list':
        return (
          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-sm flex flex-col justify-start items-start text-left">
            {section.title && (
              <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
            )}
            {section.tokens?.map((token, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  {token.logoURI && (
                    <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 rounded-full" />
                  )}
                  <span className="font-medium">{token.symbol}</span>
                  <span className="text-sm text-gray-500">({token.name})</span>
                </div>
                <span className="text-sm">{token.address}</span>
              </div>
            ))}
          </div>
        );

      case "table":
        return (
          <div className="bg-white p-4 rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {Array.isArray(section.content) && section.content.map((row: any, rowIdx: number) => (
                <tr key={rowIdx} className={rowIdx === 0 ? 'bg-gray-50' : 'bg-white'}>
                  {Array.isArray(row) && row.map((cell: any, cellIdx: number) => (
                    rowIdx === 0 ? (
                      <th key={cellIdx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {cell}
                      </th>
                    ) : (
                      <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cell}
                      </td>
                    )
                  ))}
                </tr>
              ))}
            </table>
          </div>
        );

      case "list":
        return (
          <div className="bg-white p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-2 text-left">
              {Array.isArray(section.content) && section.content.map((item: any, idx: number) => (
                <li key={idx} className="text-gray-700">
                  {typeof item === 'object' ? (
                    <div className="ml-2">
                      {Object.entries(item).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2">
                          <span className="font-medium">{key}:</span>
                          <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    item.toString()
                  )}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'image':
        return (
          <div className="bg-white p-4 rounded-lg">
            <img
              src={section.content as string}
              alt={section.title || "AI Response Image"}
              className="max-w-full h-auto rounded"
            />
          </div>
        );

      case 'portfolio':
        return <PortfolioSection title={section.title} data={section.data} />;

      case 'capabilities':
        return (
          <div className="bg-white p-6 rounded-lg shadow text-left">
            <h2 className="text-2xl font-bold mb-4">Capabilities Overview</h2>
            <ul className="space-y-4">
              {Array.isArray(section.content) &&
                section.content.map((capability: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2 text-lg">•</span>
                    <span className="text-gray-700 text-lg">{capability}</span>
                  </li>
                ))}
            </ul>
          </div>
        );

      case "examples":
        return (
          <div className="bg-white p-6 rounded-lg shadow text-left mt-4">
            <h2 className="text-2xl font-bold mb-4">Example Queries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {section.examples?.map((example: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => handleSendMessage(example)}
                  className="p-3 bg-blue-50 rounded-lg text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors text-lg"
                >
                  {example}
                </div>
              ))}
            </div>
          </div>
        );

      case "analysis":
        return <Loader2 className="w-8 h-8 animate-spin" />;

      default:
        return (
          <div className="bg-white p-4 rounded-lg">
            <pre className="text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(section, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col flex-grow gap-4 overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
            }`}
        >
          <div className={`max-w-[80%] p-4 rounded-lg`}>
            {message.role === "user" ? (
              <div
                className={
                  "whitespace-pre-wrap bg-secondary/20 text-secondary px-4 py-2 rounded-lg"
                }
              >
                {message.content}{" "}
              </div>
            ) : (
              <div className="flex flex-col justify-start items-start gap-4">
                {(() => {
                  const parsedContent = safeJsonParse(message.content);
                  return parsedContent.sections.map((section: any, idx: number) => (
                    <div key={idx}>
                      {renderSection(section, message.isStreaming || false)}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
