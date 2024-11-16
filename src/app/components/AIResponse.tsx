import React from "react";
import {
  AIResponseFormat,
  validateResponseFormat,
} from "../utils/responseHelpers";
import Image from "next/image";

type BaseSection = {
  type: string;
  title?: string;
  content?: string | string[];
};

type TextSection = BaseSection & {
  type: "text" | "markdown";
  content: string;
};

type TableSection = BaseSection & {
  type: "table";
  content: Array<Array<string>>;
};

type ListSection = BaseSection & {
  type: "list";
  content: string[];
};

type LinkSection = BaseSection & {
  type: "link";
  content: string;
  title?: string;
};

type ImageSection = BaseSection & {
  type: "image";
  content: string;
  title?: string;
};

type FunctionCallSection = {
  type: "FUNCTION_CALL";
  function: string;
  params: {
    amount?: string | number;
    chainId?: number;
    [key: string]: any;
  };
  display: {
    title: string;
    description: string;
    from_token?: string;
    to_token?: string;
    amount?: string;
    details?: string;
  };
};

type PortfolioSection = BaseSection & {
  type: "portfolio";
  title?: string;
  data?: {
    tokens?: Array<{
      symbol: string;
      icon?: string;
      balance: string;
      value_usd: string;
    }>;
  };
};

type TokenListSection = BaseSection & {
  type: "token_list";
  title?: string;
  tokens?: Array<{
    symbol: string;
    name: string;
    address: string;
    logoURI?: string;
  }>;
};

type CapabilitiesSection = BaseSection & {
  type: "capabilities";
  content: string[];
};

type ExamplesSection = BaseSection & {
  type: "examples";
  examples: string[];
};

type Section =
  | TextSection
  | TableSection
  | ListSection
  | LinkSection
  | ImageSection
  | FunctionCallSection
  | PortfolioSection
  | TokenListSection
  | CapabilitiesSection
  | ExamplesSection;

type ParsedContent = {
  sections: Section[];
};

interface AIResponseProps {
  messages: Array<{
    role: "user" | "ai";
    content: string;
    type: string;
    isStreaming?: boolean;
  }>;
  handleSendMessage: (message: string) => void;
}

const PortfolioSection = ({ title, data }: { title?: string; data?: any }) => (
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

export const AIResponse: React.FC<AIResponseProps> = ({
  messages,
  handleSendMessage,
}) => {
  const safeJsonParse = (str: string): AIResponseFormat => {
    if (typeof str === "object") return validateResponseFormat(str);
    try {
      const cleanStr = str.replace(/```json\n?|\n?```/g, "").trim();
      return validateResponseFormat(JSON.parse(cleanStr));
    } catch (e) {
      return {
        sections: [{ type: "text", content: str }],
      };
    }
  };

  const renderSection = (section: Section, isStreaming: boolean) => {
    switch (section.type) {
      case "text":
      case "markdown":
        return (
          <div className="bg-white p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">
              {section.content}
            </p>
          </div>
        );

      case "table":
        return (
          <div className="bg-white p-4 rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {Array.isArray(section.content) &&
                section.content.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={rowIdx === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    {Array.isArray(row) &&
                      row.map((cell, cellIdx) =>
                        rowIdx === 0 ? (
                          <th
                            key={cellIdx}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {cell}
                          </th>
                        ) : (
                          <td
                            key={cellIdx}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {cell}
                          </td>
                        )
                      )}
                  </tr>
                ))}
            </table>
          </div>
        );

      case "list":
        return (
          <div className="bg-white p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-2">
              {Array.isArray(section.content) &&
                section.content.map((item, idx) => (
                  <li key={idx} className="text-gray-700">
                    {item}
                  </li>
                ))}
            </ul>
          </div>
        );

      case "link":
        return (
          <div className="bg-white p-4 rounded-lg">
            <a
              href={section.content as string}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 underline"
            >
              {section.title || section.content}
            </a>
          </div>
        );

      case "image":
        return (
          <div className="bg-white p-4 rounded-lg">
            <img
              src={section.content as string}
              alt={section.title || "AI Response Image"}
              className="max-w-full h-auto rounded"
            />
          </div>
        );

      case "FUNCTION_CALL":
        return (
          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex flex-col">
                <span className="font-medium">{section.display?.title}</span>
                <span className="text-sm text-gray-500">
                  {section.display?.description}
                </span>
                {section.display?.details && (
                  <span className="text-sm text-gray-500">
                    {section.display.details}
                  </span>
                )}
              </div>
              <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80">
                Execute
              </button>
            </div>
          </div>
        );

      case "portfolio":
        return <PortfolioSection title={section.title} data={section.data} />;

      case "token_list":
        return (
          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg">
            {section.title && (
              <h3 className="text-lg font-bold">{section.title}</h3>
            )}
            {section.tokens?.map((token: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2">
                  {token.logoURI && (
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-medium">{token.symbol}</span>
                  <span className="text-sm text-gray-500">({token.name})</span>
                </div>
                <span className="text-sm">{token.address}</span>
              </div>
            ))}
          </div>
        );

      case "capabilities":
        return (
          <div className="bg-white p-6 rounded-lg shadow">
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
    <div className="flex flex-col flex-grow gap-4 overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
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
              <div className="flex flex-col gap-4">
                {(() => {
                  const parsedContent = safeJsonParse(
                    message.content
                  ) as ParsedContent;
                  return parsedContent.sections.map((section, idx) => (
                    <div
                      className="flex flex-row justify-start items-center gap-2"
                      key={idx}
                    >
                      <Image
                        src="/logo/icon.svg"
                        alt="Icon"
                        width={30}
                        height={30}
                      />
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
