import { useEffect, useState } from "react";
import axios from "axios";

export const useCSRF = () => {
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await axios.get("/api/v1/csrf/");
        setCsrfToken(response.data.csrfToken);
        axios.defaults.headers.common["X-CSRFToken"] = response.data.csrfToken;
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };

    fetchCSRFToken();
  }, []);

  return csrfToken;
};
