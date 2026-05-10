// Backend API URL configuration
// Switch between localhost and Azure by setting NEXT_PUBLIC_API_ENV

const ENDPOINTS = {
  LOCAL: "http://localhost:5248",
  AZURE: "https://urbanpulsebackend-gedpgwakd5euh2bp.switzerlandnorth-01.azurewebsites.net",
};

// Default to Azure, but check environment variable
const API_ENV = process.env.NEXT_PUBLIC_API_ENV || "AZURE";
export const API_BASE_URL =
  API_ENV === "LOCAL" ? ENDPOINTS.LOCAL : ENDPOINTS.AZURE;

console.log(`Using ${API_ENV} backend: ${API_BASE_URL}`);
