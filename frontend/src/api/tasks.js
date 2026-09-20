// src/api/tasks.js
import request from "./client";

// Create task
export const createTask = (payload) => {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// Get user tasks
export const getUserTasks = () => {
  return request("/tasks");
};

// Get single task
export const getTask = (id) => {
  return request(`/tasks/${id}`);
};

// Update task
export const updateTask = (id, payload) => {
  return request(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

// Delete task
export const deleteTask = (id) => {
  return request(`/tasks/${id}`, {
    method: "DELETE",
  });
};