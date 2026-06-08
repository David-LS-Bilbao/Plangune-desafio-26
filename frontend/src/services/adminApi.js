import { apiClient } from './apiClient';

/**
 * Fetch global dashboard stats for admin
 * @returns {Promise<object>} Stats object
 */
export async function fetchDashboardStats() {
  const { data } = await apiClient.get('/admin/dashboard');
  return data;
}

/**
 * Fetch list of pending businesses
 * @returns {Promise<Array>} Array of pending businesses
 */
export async function fetchPendingBusinesses() {
  const { data } = await apiClient.get('/admin/businesses/pending');
  return data;
}

/**
 * Approve a business by ID
 * @param {number|string} id 
 * @returns {Promise<object>} Updated business
 */
export async function approveBusinessApi(id) {
  const { data } = await apiClient.patch(`/admin/businesses/${id}/approve`);
  return data;
}

/**
 * Reject a business by ID
 * @param {number|string} id 
 * @returns {Promise<object>} Updated business
 */
export async function rejectBusinessApi(id) {
  const { data } = await apiClient.patch(`/admin/businesses/${id}/reject`);
  return data;
}
