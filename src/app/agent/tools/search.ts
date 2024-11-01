import { SerpAPI } from "@langchain/community/tools/serpapi";

export const searchTool = new SerpAPI(process.env.SEARPA_API_KEY);