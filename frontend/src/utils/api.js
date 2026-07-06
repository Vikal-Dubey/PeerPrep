const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const registerUser = async (data) => {
  const res = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Registration failed");
  return result;
};

export const loginUser = async (data) => {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Login failed");
  return result;
};

export const getCurrentUser = async () => {
  const res = await fetch(`${API_URL}/api/me`, {
    credentials: "include",
  });

  if(!res.ok) {
    return null;
  }
  const result = await res.json();
  return result.user;
}

export const logoutUser = async () => {
  const res = await fetch(`${API_URL}/api/logout`, {
    method: "POST",
    credentials: "include",
  })
  return res.ok;
};