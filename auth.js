/**
 * auth.js - Session & Cookie Management
 */

export const Auth = {
    // Auth module with JSON persistence
    init: () => {
        // Initialize users storage if empty
        if (!localStorage.getItem('xperince_users')) {
            localStorage.setItem('xperince_users', JSON.stringify([]));
        }
    },

    // Login function
    login: (email, password) => {
        // Hardcoded Admin
        if (email === 'admin@gmail.com' && password === '12345') {
            Auth.setUserSession('admin', { email: email, name: 'Admin User' });
            return { success: true, role: 'admin' };
        }

        // Hardcoded Warehouse
        if (email === 'warehouse@gmail.com' && password === '123456') {
            Auth.setUserSession('warehouse', { email: email, name: 'Warehouse Manager' });
            return { success: true, role: 'warehouse' };
        }

        // Check registered users
        const users = JSON.parse(localStorage.getItem('xperince_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            Auth.setUserSession(user.role, user);
            return { success: true, role: user.role, user: user };
        }

        return { success: false, message: 'Invalid email or password' };
    },

    // Register function
    register: (userData) => {
        const users = JSON.parse(localStorage.getItem('xperince_users') || '[]');
        
        // Check if email exists
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }
        
        if (userData.email === 'admin@gmail.com' || userData.email === 'warehouse@gmail.com') {
             return { success: false, message: 'Cannot register with this email' };
        }

        // Add new user
        const newUser = {
            id: Date.now(),
            ...userData,
            joinedDate: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('xperince_users', JSON.stringify(users));
        
        // Auto login
        Auth.setUserSession(newUser.role, newUser);
        return { success: true, role: newUser.role, user: newUser };
    },

    // Set user session with full data
    setUserSession: (role, user = null) => {
        // Store role in cookie for backward compatibility
        const date = new Date();
        date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
        document.cookie = `xperince_user=${role}; expires=${date.toUTCString()}; path=/`;
        
        // Store full user data in localStorage
        const sessionData = {
            role: role,
            email: user?.email || (role === 'admin' ? 'admin@gmail.com' : null),
            name: user?.firstName ? `${user.firstName} ${user.lastName}` : user?.name,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('xperince_session', JSON.stringify(sessionData));
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
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(name) == 0) {
                const role = c.substring(name.length, c.length);
                return { role: role };
            }
        }
        return null; // No session
    },

    logout: () => {
        document.cookie = "xperince_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem('xperince_session');
        // Don't reload - let the app handle UI updates
    }
};
