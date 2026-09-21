const API_URL = "http://localhost:3000/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token1");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error(`API Error on ${endpoint} [Status ${res.status}]:`, data);

    if (res.status === 401 && !endpoint.includes("/auth/")) {
      console.warn("Unauthorized request. Clearing token and redirecting.");
      localStorage.removeItem("token1");
      window.location.href = "/auth/login";
      return;
    }

    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export default request;