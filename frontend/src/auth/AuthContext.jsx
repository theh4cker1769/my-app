import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/apiServices';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);

    // Check for stored auth on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('Checking stored auth:', { storedToken, storedUser }); // Debug
        
        if (storedToken && storedToken !== 'undefined' && 
            storedUser && storedUser !== 'undefined') {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                console.log('✅ Auth restored from localStorage');
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.clear();
            }
        }
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        try {
            console.log('Attempting login...'); // Debug
            const response = await authAPI.login(credentials);
            
            console.log('Login API response:', response); // Debug
            
            if (response && response.success) {
                // Handle double-nested data structure
                // Check if response.data has another nested data object
                let actualData = response.data;
                
                if (actualData && actualData.data) {
                    // It's double nested, use response.data.data
                    actualData = actualData.data;
                }
                
                const newToken = actualData?.token;
                const newUser = actualData?.user;
                
                console.log('Extracted values:', { newToken, newUser }); // Debug
                
                // Validate data
                if (!newToken || !newUser) {
                    console.error('❌ Token or user is missing');
                    return { 
                        success: false, 
                        message: 'Invalid response from server' 
                    };
                }
                
                // Save to state
                setToken(newToken);
                setUser(newUser);
                
                // Save to localStorage
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(newUser));
                
                console.log('✅ Saved to localStorage:', {
                    token: localStorage.getItem('token'),
                    user: localStorage.getItem('user')
                }); // Debug
                
                return { success: true };
            } else {
                console.error('❌ Login failed:', response); // Debug
                return { 
                    success: false, 
                    message: response?.message || 'Login failed' 
                };
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            return { 
                success: false, 
                message: error.message || 'An error occurred during login' 
            };
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData) => {
        setLoading(true);
        try {
            console.log('Attempting signup...'); // Debug
            const response = await authAPI.signup(userData);
            
            console.log('Signup API response:', response); // Debug
            
            if (response && response.success) {
                // Handle double-nested data structure
                let actualData = response.data;
                
                if (actualData && actualData.data) {
                    actualData = actualData.data;
                }
                
                const newToken = actualData?.token;
                const newUser = actualData?.user;
                
                console.log('Extracted values:', { newToken, newUser }); // Debug
                
                // Validate data
                if (!newToken || !newUser) {
                    console.error('❌ Token or user is missing');
                    return { 
                        success: false, 
                        message: 'Invalid response from server' 
                    };
                }
                
                // Save to state
                setToken(newToken);
                setUser(newUser);
                
                // Save to localStorage
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(newUser));
                
                console.log('✅ Saved to localStorage'); // Debug
                
                return { success: true };
            } else {
                return { 
                    success: false, 
                    message: response?.message || 'Signup failed' 
                };
            }
        } catch (error) {
            console.error('Signup error:', error);
            return { 
                success: false, 
                message: error.message || 'An error occurred during signup' 
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        console.log('🚪 Logging out...');
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            loading, 
            login, 
            signup, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};