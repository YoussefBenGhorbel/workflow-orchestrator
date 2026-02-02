const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function clearToken() {
  localStorage.removeItem("token");
}

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const headers = { ...(opts.headers || {}) };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data?.error || data?.message || "API_ERROR");
  return data;
}

export function login(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function voiceProposeTask(file) {
  const form = new FormData();
  form.append("audio", file);

  return apiFetch("/voice/propose-task", {
    method: "POST",
    body: form,
  });
}

export function createTask({ title, description, priority }) {
  return apiFetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, priority, assignedTo: null }),
  });
}

export function listTasks() {
  return apiFetch("/tasks", { method: "GET" });
}
export function updateTaskStatus(id, status) {
  return apiFetch(`/tasks/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}
export function listAudit() {
  return apiFetch("/audit");
}