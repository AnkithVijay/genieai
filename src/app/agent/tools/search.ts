import { SerpAPI } from "@langchain/community/tools/serpapi";

export const searchTool = new SerpAPI(process.env.SERPAPI_API_KEY);