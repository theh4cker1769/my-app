import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/apiServices';
import '../styles/auth.css';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [token]);

    const signup = async (userData) => {
        setLoading(true);
        try {
            const response = await authAPI.signup(userData);
            
            if (response.success) {
                setToken(response.data.token);
                setUser(response.data.user);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return { success: true };
            }
            
            return { success: false, message: response.message };
        } catch (error) {
            return { 
                success: false, 
                message: error.message || 'Signup failed' 
            };
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        setLoading(true);
        try {
            const response = await authAPI.login(credentials);
            
            if (response.success) {
                setToken(response.data.token);
                setUser(response.data.user);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return { success: true };
            }
            
            return { success: false, message: response.message };
        } catch (error) {
            return { 
                success: false, 
                message: error.message || 'Login failed' 
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, signup, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};