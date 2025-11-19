const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Common headers configuration
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
};

// Error handler for different status codes
const handleError = (error) => {
    const { status, message } = error;

    switch (status) {
        case 401:
            // Unauthorized - Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return { success: false, message: 'Session expired. Please login again.' };

        case 403:
            // Forbidden - No permission
            return { success: false, message: 'Access denied. You do not have permission.' };

        case 404:
            return { success: false, message: 'Resource not found.' };

        case 500:
            return { success: false, message: 'Server error. Please try again later.' };

        default:
            return { success: false, message: message || 'Something went wrong.' };
    }
};

// Main API call function
const apiCall = async (endpoint, options = {}) => {
    const config = {
        ...options,
        headers: getHeaders()
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || 'Request failed'
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('API Error:', error);
        return handleError(error);
    }
};

// HTTP Methods
export const apiConfig = {
    // GET method
    get: (endpoint) => {
        return apiCall(endpoint, {
            method: 'GET'
        });
    },

    // POST method
    post: (endpoint, body) => {
        return apiCall(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    // PUT method
    put: (endpoint, body) => {
        return apiCall(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    // PATCH method
    patch: (endpoint, body) => {
        return apiCall(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    },

    // DELETE method
    delete: (endpoint) => {
        return apiCall(endpoint, {
            method: 'DELETE'
        });
    }
};

export default apiConfig;