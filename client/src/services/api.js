function    getApiUrl() {
  const apiUrl = process.env.REACT_APP_API_URL;
  if (!apiUrl) {
    throw new Error("API URL is not defined in environment variables");
  }
  return apiUrl;
}