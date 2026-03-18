// Safely extract array from any API response format
export const extractArray = (response, key) => {
  if (Array.isArray(response)) return response;
  if (key && Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.users)) return response.users;
  if (Array.isArray(response?.opportunities)) return response.opportunities;
  if (Array.isArray(response?.applications)) return response.applications;
  if (Array.isArray(response?.projects)) return response.projects;
  return [];
};

export const extractPagination = (response) => ({
  total: response?.total || 0,
  page: response?.page || 1,
  limit: response?.limit || 20,
  totalPages: response?.totalPages || 1
});
