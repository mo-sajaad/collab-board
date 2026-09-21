import request from "./client";


export const registerUser = (data) => {
  const res = request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (res.token) {
    localStorage.setItem("token1", res.token);
  }

  return res;
};


export const loginUser = async (data) => {
  const res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (res.token) {
    localStorage.setItem("token1", res.token);
  }

  return res;
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem("token1");
};