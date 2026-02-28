import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. Initialize user from localStorage to prevent "flicker" redirects
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 2. This runs once when the app starts
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // IMPORTANT: Change this URL to your backend profile or verify route
                // If you don't have one, we can use the stored user object (see login)
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Session expired");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    // 3. Professional Login Function
    const login = async (email, password) => {
        try {
            const { data } = await axios.post('fleet-tracker-backend-production.up.railway.app/api/v1/auth/login', { email, password });
            
            // Backend should return: { token: "...", user: { name: "...", role: "..." } }
            const userData = data.user || data;

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(userData)); // Store user data too
            
            setUser(userData); // Update state
            return { success: true, user: data.user };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || "Login failed" 
            };
        }
    };

    // 4. Logout Function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // Page will automatically redirect because of ProtectedRoute in App.jsx
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {/* We don't render ANYTHING until we know if the user is logged in */}
            {!loading ? children : (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
