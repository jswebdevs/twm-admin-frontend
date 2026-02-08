// Fallback to localhost:5000 if env var is missing
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const ENDPOINTS = {
    WEBSITES: `${API_BASE_URL}/api/websites`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,  
    ME: `${API_BASE_URL}/api/auth/me`,      
    ARTICLES: `${API_BASE_URL}/api/articles`,
    ORIGINAL_POSTS: `${API_BASE_URL}/api/originalposts`,
};