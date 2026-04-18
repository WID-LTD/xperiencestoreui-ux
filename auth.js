/**
 * auth.js - Session & Cookie Management
 */

const API_URL = `${window.API_BASE}/api/auth`;


export const Auth = {
    // Auth module with JSON persistence
    init: () => {
        // No longer dependent on local users array, but we can keep this empty init if needed
    },

    decodeToken: (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch {
            return null;
        }
    },

    // Login function
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                Auth.setUserSession(data.role, data);
                // Sync any guest cart/wishlist items to DB, then load DB data
                if (window.State) {
                    window.State.setUser(data.role, data);
                    window.State.syncToDBAfterLogin().catch(console.warn);
                }
                
                // Handle redirect
                const redirect = localStorage.getItem('authRedirect') || '/';
                localStorage.removeItem('authRedirect');
                window.location.hash = '#' + redirect;
                
                return { success: true, role: data.role, user: data };
            } else {
                return {
                    success: false,
                    message: data.message || 'Login failed',
                    requiresVerification: data.requiresVerification || false,
                    email: data.email || email  // Use the email from response, fallback to what user typed
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Server error. Please try again.' };
        }
    },

    // Register function
    register: async (userData) => {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                // Determine if immediate login or verification needed
                // Backend now sends verification code, so we likely need to show verification UI
                return { success: true, message: data.message, requiresVerification: true, email: data.email };
            } else {
                return { success: false, message: data.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Server error. Please try again.' };
        }
    },

    // Verify Email
    verify: async (email, code) => {
        try {
            const response = await fetch(`${API_URL}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (response.ok) {
                Auth.setUserSession(data.role, data);
                if (window.State) {
                    window.State.setUser(data.role, data);
                }
                return { success: true, message: data.message, user: data };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Verification failed' };
        }
    },

    // Forgot Password
    forgotPassword: async (email) => {
        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            return await response.json();
        } catch (error) {
            return { message: 'Request failed' };
        }
    },

    // Reset Password
    resetPassword: async (email, code, newPassword) => {
        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword }),
            });
            return await response.json();
        } catch (error) {
            return { message: 'Reset failed' };
        }
    },

    // Set user session with full data
    setUserSession: (role, user = null) => {
        // Store role in cookie for backward compatibility
        const date = new Date();
        date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
        document.cookie = `xperince_user=${role}; expires=${date.toUTCString()}; path=/`;

        // Store full user data in localStorage
        const sessionData = {
            token: user?.token, // Store JWT token
            id: user?.id || user?._id, // Support both SQL(id) and NoSQL(_id)
            _id: user?._id || user?.id, // Keep backward compatibility
            email: user?.email,
            name: user?.name,
            phone: user?.phone || '',
            profile_image: user?.profile_image || '',
            companyName: user?.companyName || user?.company_name || '',
            role: role,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('xperince_session', JSON.stringify(sessionData));
    },

    // Get the latest profile from the server
    fetchProfile: async () => {
        try {
            const token = Auth.getToken();
            if (!token) return null;

            const response = await fetch(`${API_URL}/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Merge token back in since /me might not return it
                Auth.setUserSession(data.role, { ...data, token });
                return data;
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
        }
        return null;
    },

    // Get the current user session
    getUserSession: () => {
        // Try localStorage first (full data)
        const session = localStorage.getItem('xperince_session');
        if (session) {
            try {
                return JSON.parse(session);
            } catch (e) {
                console.error('Failed to parse session', e);
            }
        }

        // Fallback to cookie (role only)
        const name = "xperince_user=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(name) == 0) {
                const role = c.substring(name.length, c.length);
                return { role: role };
            }
        }
        return null; // No session
    },

    getToken: () => {
        const session = localStorage.getItem('xperince_session');
        if (session) {
            try {
                return JSON.parse(session).token;
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    isLoggedIn: () => {
        const session = Auth.getUserSession();
        if (!session || !session.token) return false;
        
        const payload = Auth.decodeToken(session.token);
        if (!payload || !payload.exp) return false;
        
        // exp is in seconds, Date.now() is in ms
        return (payload.exp * 1000) > Date.now();
    },

    logout: () => {
        if (window.State) {
            window.State.logout();
        } else {
            document.cookie = "xperince_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            localStorage.removeItem('xperince_session');
        }
        // Don't reload - let the app handle UI updates
    },

    requireRole: (role, callback) => {
        const user = Auth.getUserSession();
        if (user && user.role === role) {
            return callback();
        }
        if (window.Components && window.Components.showNotification) {
            window.Components.showNotification(`Access restricted to ${role} account`, 'warning');
        } else {
            alert(`Access restricted to ${role} account`);
        }
        window.location.hash = '#/';
    }
};
