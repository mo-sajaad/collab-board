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

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token1");
      window.location.href = "/auth/login";
      return;
    }

    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export default request;