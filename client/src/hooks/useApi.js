import { useState, useCallback } from "react";

export default function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const request = useCallback(async (endpoint, method = "GET", body = null) => {
    setLoading(true);
    setError(null);

    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      
      const token = localStorage.getItem("token");
      if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
      }      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`http://localhost:3001${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg =
          (typeof data.message === "string" && data.message) ||
          (typeof data.error === "string" && data.error) ||
          (Array.isArray(data.details) && data.details.join(", ")) ||
          "Something went wrong";

        
        if (response.status === 401 && localStorage.getItem("token")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }

        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  return { request, loading, error, clearError };
}
