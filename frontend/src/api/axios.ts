import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Clears the locally stored access token and returns
 * the user to the login page.
 *
 * This clears the browser session only. It does not revoke
 * a JWT that has already been issued by the backend.
 */
export function logout(): void {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");

  window.location.replace("/login");
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (
      token &&
      token !== "undefined" &&
      token !== "null" &&
      token.trim() !== ""
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
