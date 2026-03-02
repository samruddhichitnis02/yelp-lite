import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (userData) => {
        // Expected userData: { name, email, role: 'user' | 'owner', token }
        setUser(userData);
        localStorage.setItem('auth_token', userData.token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
