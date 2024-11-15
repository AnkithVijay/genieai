import React from 'react';

type Section = {
  type: string;
  title?: string;
  content?: string | string[];
  data?: any;
  actions?: any[];
  tokens?: any[];
  examples?: string[];
};

type ParsedContent = {
  sections: Section[];
};

interface AIResponseProps {
  messages: Array<{
    role: 'user' | 'ai';
    content: string;
    type: string;
    isStreaming?: boolean;
  }>;
  handleSendMessage: (message: string) => void;
  handleSwap: (action: any) => void;
}

const PortfolioSection = ({ title, data, handleSwap }: { title?: string, data?: any, handleSwap: (action: any) => void }) => (
  <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow">
    <h3 className="text-lg font-bold">{title || "Portfolio Overview"}</h3>
    <div className="grid grid-cols-1 gap-4">
      {data?.tokens?.map((token: any) => (
        <div key={token.symbol} className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <div className="flex items-center gap-2">
            {token.icon && (
              <img src={token.icon} alt={token.symbol} className="w-8 h-8 rounded-full" />
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

export const AIResponse: React.FC<AIResponseProps> = ({ messages, handleSendMessage, handleSwap }) => {
  // Helper function to safely parse JSON or return existing object
  const safeJsonParse = (str: string) => {
    if (typeof str === 'object') return str;
    try {
      // Remove any backticks and "json" text that might be in the response
      const cleanStr = str.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanStr);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return { sections: [{ type: 'text', content: str }] };
    }
  };

  const renderSection = (section: Section, isStreaming: boolean, handleSwap: (action: any) => void) => {
    switch (section.type) {
      case 'portfolio':
        return <PortfolioSection title={section.title} data={section.data} handleSwap={handleSwap} />;

      case 'analysis':
        return (
          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg">
            {section.title && (
              <h3 className="text-lg font-bold flex items-center gap-2">
                {section.title}
                {isStreaming && (
                  <span className="inline-block animate-pulse">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                  </span>
                )}
              </h3>
            )}
            {section.content && <p className="text-gray-700 whitespace-pre-wrap">{section.content}</p>}
          </div>
        );

      case 'action':
        return (
          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg">
            {section.title && <h3 className="text-lg font-bold">{section.title}</h3>}
            {section.actions?.map((action, actionIdx) => (
              <div key={actionIdx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex flex-col">
                  <span className="font-medium">
                    {action.type}: {action.from_token} → {action.to_token}
                  </span>
                  <span className="text-sm text-gray-500">Amount: {action.amount}</span>
                  <span className="text-sm text-gray-500">{action.reason}</span>
                </div>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleSwap(action)}
                >
                  Execute
                </button>
              </div>
            ))}
          </div>
        );

      case 'token_list':
        return (
          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg">
            {section.title && <h3 className="text-lg font-bold">{section.title}</h3>}
            {section.tokens?.map((token: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
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

      case 'text':
        return (
          <div className="bg-white p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{section.content}</p>
          </div>
        );

      case 'capabilities':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Capabilities Overview</h2>
            <ul className="space-y-4">
              {Array.isArray(section.content) && section.content.map((capability: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-2 text-lg">•</span>
                  <span className="text-gray-700 text-lg">{capability}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'examples':
        return (
          <div className="bg-white p-6 rounded-lg shadow mt-4">
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
    <div className="flex flex-col gap-4 h-[600px] overflow-y-auto p-4 border rounded-lg">
      {messages.map((message, index) => (
        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[80%] p-4 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-100 text-black mr-auto'
              }`}
          >
            {message.role === 'user' ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <div className="flex flex-col gap-4">
                {(() => {
                  const parsedContent = safeJsonParse(message.content) as ParsedContent;
                  return parsedContent.sections.map((section, idx) => (
                    <div key={idx}>
                      {renderSection(section, message.isStreaming || false, handleSwap)}
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
