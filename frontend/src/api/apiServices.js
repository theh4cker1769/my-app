import { apiConfig } from './apiConfig';

// Auth API Services
export const authAPI = {
    signup: (userData) => apiConfig.post('/auth/signup', userData),
    login: (credentials) => apiConfig.post('/auth/login', credentials)
};

// User API Services
export const userAPI = {
    getStats: () => apiConfig.get('/users/stats'),
    getWeeklySummary: () => apiConfig.get('/users/weekly-summary'),
    updateProfile: (userData) => apiConfig.put('/users/profile', userData),
    getUserProfile: (userId) => apiConfig.get(`/users/profile/${userId}`)
};

// Workout API Services
export const workoutAPI = {
    createWorkout: (workoutData) => apiConfig.post('/workouts', workoutData),
    getMyWorkouts: (limit = 10, offset = 0) => apiConfig.get(`/workouts/my-workouts?limit=${limit}&offset=${offset}`),
    getTodayWorkout: () => apiConfig.get('/workouts/today'),
    getFriendsFeed: (limit = 20) => apiConfig.get(`/workouts/friends-feed?limit=${limit}`),
    getWorkoutDetails: (workoutId) => apiConfig.get(`/workouts/${workoutId}`),
    deleteWorkout: (workoutId) => apiConfig.delete(`/workouts/${workoutId}`)
};

// Friend API Services
export const friendAPI = {
    sendRequest: (friendId) => apiConfig.post('/friends/request', { friend_id: friendId }),
    getFriendRequests: () => apiConfig.get('/friends/requests'),
    getSentRequests: () => apiConfig.get('/friends/requests/sent'),
    acceptRequest: (friendshipId) => apiConfig.put(`/friends/requests/${friendshipId}/accept`),
    rejectRequest: (friendshipId) => apiConfig.delete(`/friends/requests/${friendshipId}/reject`),
    getFriends: () => apiConfig.get('/friends'),
    removeFriend: (friendId) => apiConfig.delete(`/friends/${friendId}`),
    searchUsers: (query) => apiConfig.get(`/friends/search?query=${query}`)
};

export default { authAPI, userAPI, workoutAPI, friendAPI };