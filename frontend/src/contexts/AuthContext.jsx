import React, { createContext, useContext, useEffect, useState } from "react";
import { createRoutesStub, useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

const VITE_BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/*
 * This provider should export a `user` context state that is
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get the current tokem from local storage
        const current_token = localStorage.getItem("token");

        // Check if the current token exists
        if (current_token) {
            // Update the current user based on the token
            fetch(`${VITE_BACKEND_URL}/user/me`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${current_token}`,
                },
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        return null;
                    }
                })
                .then((user) => {
                    if (user) {
                        setUser(user);
                    }
                });
        } else {
            // Otherwise, set the user to null
            setUser(null);
        }
    }, []);

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        // Remove the token from local storage and set the user to null
        localStorage.removeItem("token");
        setUser(null);

        navigate("/");
    };

    /**
     * Login a user with their credentials.
     *
     * @remarks Upon success, navigates to "/profile".
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {string} - Upon failure, Returns an error message.
     */
    const login = async (username, password) => {
        // Send a request to the backend to log in the user
        fetch(`${VITE_BACKEND_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        })
            // Error handling
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.message;
                }
            })
            // Login the user
            .then((data) => {
                if (data.hasOwnProperty("token")) {
                    localStorage.setItem("token", data.token);
                    setUser(data.user);

                    navigate("/profile");
                } else {
                    return data;
                }
            });
    };

    /**
     * Registers a new user.
     *
     * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
    const register = async (userData) => {
        fetch(`${VITE_BACKEND_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        })
            // Error handling
            .then((response) => {
                if (response.ok) {
                    navigate("/");
                } else {
                    return response.message;
                }
            });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
