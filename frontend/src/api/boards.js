// src/api/boards.js
import request from "./client";

// Create board
export const createBoard = (payload) => {
  return request("/boards", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// Get user boards
export const getUserBoards = () => {
  return request("/boards");
};

// Get single board
export const getBoard = (id) => {
  return request(`/boards/${id}`);
};

// Update board
export const updateBoard = (id, payload) => {
  return request(`/boards/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

// Delete board
export const deleteBoard = (id) => {
  return request(`/boards/${id}`, {
    method: "DELETE",
  });
};

// Add member
export const addBoardMember = (boardId, payload) => {
  return request(`/boards/${boardId}/members`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// Remove member
export const removeBoardMember = (boardId, payload) => {
  return request(`/boards/${boardId}/members`, {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
};