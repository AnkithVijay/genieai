import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    LANGCHAIN_API_KEY: process.env.LANGCHAIN_API_KEY,
    LANGCHAIN_ENDPOINT: process.env.LANGCHAIN_ENDPOINT,
    LANGCHAIN_PROJECT: process.env.LANGCHAIN_PROJECT,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ZAPPER_API_KEY: process.env.ZAPPER_API_KEY,
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
    SEARPA_API_KEY: process.env.SEARPA_API_KEY,
    ONEINCH_API_KEY: process.env.ONEINCH_API_KEY
  },
};

export default nextConfig;
