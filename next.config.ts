import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    LANGCHAIN_API_KEY: process.env.LANGCHAIN_API_KEY,
    LANGCHAIN_ENDPOINT: process.env.LANGCHAIN_ENDPOINT,
    LANGCHAIN_PROJECT: process.env.LANGCHAIN_PROJECT,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PIVATE_ZAPPER_API_KEY: process.env.NEXT_PIVATE_ZAPPER_API_KEY,
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
  },
};

export default nextConfig;
