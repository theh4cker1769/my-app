import { apiConfig } from './apiConfig';

// Auth API Services
export const authAPI = {
    signup: (userData) => apiConfig.post('/auth/signup', userData),
    login: (credentials) => apiConfig.post('/auth/login', credentials)
};

// User API Services
export const userAPI = {
    getUsers: () => apiConfig.get('/users'),
    getUserById: (id) => apiConfig.get(`/users/${id}`),
    updateUser: (id, userData) => apiConfig.put(`/users/${id}`, userData),
    deleteUser: (id) => apiConfig.delete(`/users/${id}`)
};

export default { authAPI, userAPI };