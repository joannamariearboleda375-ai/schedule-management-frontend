const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
  } catch {
    throw new Error("Cannot connect to the backend. Start the backend server on port 5000.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

export const getSchedules = (search = "", status = "") => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  return request(`/schedules?${params.toString()}`);
};
export const getSchedule = (id) => request(`/schedules/${id}`);
export const createSchedule = (data) => request("/schedules", { method: "POST", body: JSON.stringify(data) });
export const updateSchedule = (id, data) => request(`/schedules/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteSchedule = (id) => request(`/schedules/${id}`, { method: "DELETE" });