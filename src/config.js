// Fallback to localhost:5000 if env var is missing
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export const API_BASE_URL = "http://localhost:5000";
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;


export const ENDPOINTS = {
    BASE: API_BASE_URL,
    WEBSITES: `${API_BASE_URL}/api/websites`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,  
    ME: `${API_BASE_URL}/api/auth/me`,      
    ARTICLES: `${API_BASE_URL}/api/articles`,
    ORIGINAL_POSTS: `${API_BASE_URL}/api/originalposts`,
    REWRITTEN_POSTS: `${API_BASE_URL}/api/rewrittenposts`,
    CLUSTER: `${API_BASE_URL}/api/cluster`,
    DASHBOARD: `${API_BASE_URL}/api/dashboard`

    
};