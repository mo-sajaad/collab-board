// src/api/search.js
import request from "./client";


export async function searchGlobal(query, signal) {
  if (!query || !query.trim()) {
    return { boards: [], tasks: [] };
  }

  try {
    return await request(`/search?q=${encodeURIComponent(query.trim())}`, { signal });
  } catch (err) {
    if (err.name === "AbortError") {
      return { boards: [], tasks: [] };
    }
    throw err;
  }
}