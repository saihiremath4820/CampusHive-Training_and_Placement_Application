import api from "./api";

export const getNotifications = () => api.get("/notifications");
export const markAsRead = (id) => api.put(`/notifications/${id}/read`);
export const clearAllNotifications = () => api.put("/notifications/clear-all");
